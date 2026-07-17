#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const DIGIKEY_API_BASE = "https://api.digikey.com";
const DIGIKEY_TOKEN_URL = `${DIGIKEY_API_BASE}/v1/oauth2/token`;
const DIGIKEY_KEYWORD_SEARCH_URL = `${DIGIKEY_API_BASE}/products/v4/search/keyword`;

loadEnvFiles([".env.local", ".env"]);

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const config = {
  digikeyClientId: requireEnv("DIGIKEY_CLIENT_ID"),
  digikeyClientSecret: requireEnv("DIGIKEY_CLIENT_SECRET"),
  supabaseUrl: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseServiceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  site: process.env.DIGIKEY_SITE || "ES",
  language: process.env.DIGIKEY_LANGUAGE || "es",
  currency: process.env.DIGIKEY_CURRENCY || "EUR",
  limit: clampInteger(args.limit || 10, 1, 50),
  maxPages: clampInteger(args.maxPages || 1, 1, 20),
  status: args.publish ? "published" : "draft",
  dryRun: Boolean(args.dryRun),
  publicPrices: Boolean(args.publicPrices),
};

const keywords = collectKeywords(args);

if (!keywords.length) {
  fail("Debes pasar --keyword \"texto\" o --mpn-file archivo.txt");
}

const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const token = await getDigiKeyAccessToken(config);
let imported = 0;
let skipped = 0;

for (const keyword of keywords) {
  for (let page = 0; page < config.maxPages; page += 1) {
    const offset = page * config.limit;
    const response = await searchDigiKeyProducts(keyword, offset, token, config);
    const products = [...(response.ExactMatches || []), ...(response.Products || [])];
    const uniqueProducts = dedupeProducts(products);

    if (!uniqueProducts.length) {
      console.log(`No results for "${keyword}" at offset ${offset}.`);
      break;
    }

    for (const product of uniqueProducts) {
      const mapped = mapDigiKeyProduct(product, config);

      if (!mapped) {
        skipped += 1;
        continue;
      }

      if (config.dryRun) {
        console.log(JSON.stringify({ dryRun: true, product: mapped.product }, null, 2));
        imported += 1;
        continue;
      }

      const brandId = mapped.brandName
        ? await upsertBrand(mapped.brandName)
        : null;
      const categoryId = mapped.categoryName
        ? await upsertCategory(mapped.categoryName)
        : null;
      const productPayload = {
        ...mapped.product,
        brand_id: brandId,
        category_id: categoryId,
      };

      const saved = await upsertProduct(productPayload);
      imported += 1;
      console.log(`Imported ${saved.sku}: ${saved.title}`);
    }
  }
}

console.log(
  `Done. ${config.dryRun ? "Mapped" : "Imported"} ${imported} products. Skipped ${skipped}.`,
);

function loadEnvFiles(files) {
  for (const file of files) {
    const filePath = resolve(process.cwd(), file);

    if (!existsSync(filePath)) {
      continue;
    }

    const contents = readFileSync(filePath, "utf8");

    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);

      if (!match || process.env[match[1]]) {
        continue;
      }

      process.env[match[1]] = unquote(match[2].trim());
    }
  }
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function parseArgs(items) {
  const parsed = {
    keywords: [],
  };

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];

    switch (item) {
      case "--keyword":
        parsed.keywords.push(requireValue(items, ++index, item));
        break;
      case "--mpn-file":
        parsed.mpnFile = requireValue(items, ++index, item);
        break;
      case "--limit":
        parsed.limit = Number(requireValue(items, ++index, item));
        break;
      case "--max-pages":
        parsed.maxPages = Number(requireValue(items, ++index, item));
        break;
      case "--publish":
        parsed.publish = true;
        break;
      case "--public-prices":
        parsed.publicPrices = true;
        break;
      case "--dry-run":
        parsed.dryRun = true;
        break;
      case "--help":
      case "-h":
        parsed.help = true;
        break;
      default:
        fail(`Argumento desconocido: ${item}`);
    }
  }

  return parsed;
}

function requireValue(items, index, flag) {
  const value = items[index];

  if (!value || value.startsWith("--")) {
    fail(`Falta valor para ${flag}`);
  }

  return value;
}

function collectKeywords(parsed) {
  const keywords = [...parsed.keywords];

  if (parsed.mpnFile) {
    const filePath = resolve(process.cwd(), parsed.mpnFile);
    const fileKeywords = readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));

    keywords.push(...fileKeywords);
  }

  return [...new Set(keywords)];
}

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    fail(`Falta variable de entorno ${name}`);
  }

  return value;
}

function clampInteger(value, min, max) {
  const number = Number.isFinite(value) ? Math.trunc(value) : min;

  return Math.min(max, Math.max(min, number));
}

async function getDigiKeyAccessToken({ digikeyClientId, digikeyClientSecret }) {
  const body = new URLSearchParams({
    client_id: digikeyClientId,
    client_secret: digikeyClientSecret,
    grant_type: "client_credentials",
  });

  const response = await fetch(DIGIKEY_TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const payload = await readJsonResponse(response);

  if (!response.ok || !payload.access_token) {
    fail(`DigiKey OAuth failed: ${JSON.stringify(payload)}`);
  }

  return payload.access_token;
}

async function searchDigiKeyProducts(keyword, offset, token, searchConfig) {
  const response = await fetch(DIGIKEY_KEYWORD_SEARCH_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "X-DIGIKEY-Client-Id": searchConfig.digikeyClientId,
      "X-DIGIKEY-Locale-Site": searchConfig.site,
      "X-DIGIKEY-Locale-Language": searchConfig.language,
      "X-DIGIKEY-Locale-Currency": searchConfig.currency,
    },
    body: JSON.stringify({
      Keywords: keyword,
      Limit: searchConfig.limit,
      Offset: offset,
      FilterOptionsRequest: {
        MarketPlaceFilter: "ExcludeMarketPlace",
      },
      SortOptions: {
        Field: "QuantityAvailable",
        SortOrder: "Descending",
      },
    }),
  });

  const payload = await readJsonResponse(response);

  if (!response.ok) {
    fail(`DigiKey search failed for "${keyword}": ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function readJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function dedupeProducts(products) {
  const seen = new Set();
  const result = [];

  for (const product of products) {
    const key =
      product.ManufacturerProductNumber ||
      firstVariation(product)?.DigiKeyProductNumber ||
      product.ProductUrl;

    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(product);
  }

  return result;
}

function mapDigiKeyProduct(product, importConfig) {
  const variation = firstVariation(product);
  const mpn = clean(product.ManufacturerProductNumber);
  const digikeyNumber = clean(variation?.DigiKeyProductNumber);
  const manufacturerName = clean(product.Manufacturer?.Name);
  const sku = digikeyNumber ? `DK-${digikeyNumber}` : null;
  const title = clean(product.Description?.ProductDescription) || mpn;

  if (!sku || !mpn || !title) {
    return null;
  }

  const categoryName = clean(product.Category?.Name);
  const quantityAvailable = toInteger(product.QuantityAvailable);
  const leadDays = leadWeeksToDays(product.ManufacturerLeadWeeks);
  const price = importConfig.publicPrices
    ? firstUnitPrice(variation?.StandardPricing || product.StandardPricing)
    : null;
  const status = importConfig.status;
  const now = new Date().toISOString();

  return {
    brandName: manufacturerName,
    categoryName,
    product: {
      sku,
      mpn,
      slug: slugify(`${manufacturerName || "digikey"}-${mpn}-${digikeyNumber}`),
      title,
      short_description: clean(product.Description?.ProductDescription),
      description: clean(product.Description?.DetailedDescription),
      manufacturer_name: manufacturerName,
      status,
      visibility: "public",
      featured: false,
      currency: importConfig.currency,
      price,
      compare_at_price: null,
      price_visibility: price === null ? "quote_only" : "public",
      stock_quantity: quantityAvailable,
      stock_status: stockStatus(product, quantityAvailable),
      minimum_order_quantity: toInteger(variation?.MinimumOrderQuantity) || 1,
      lead_time_min_days: leadDays,
      lead_time_max_days: leadDays,
      condition: clean(product.ProductStatus?.Status),
      packaging: clean(variation?.PackageType?.Name),
      country_of_origin: null,
      datasheet_url: clean(product.DatasheetUrl),
      specifications: specificationsFromProduct(product, variation),
      embedding_status: status === "published" ? "pending" : "disabled",
      published_at: status === "published" ? now : null,
      archived_at: null,
    },
  };
}

function firstVariation(product) {
  const variations = product.ProductVariations || [];

  return (
    variations.find((variation) => !variation.MarketPlace) ||
    variations[0] ||
    null
  );
}

function stockStatus(product, quantityAvailable) {
  if (product.Discontinued || product.EndOfLife) {
    return "discontinued";
  }

  if (quantityAvailable > 25) {
    return "in_stock";
  }

  if (quantityAvailable > 0) {
    return "low_stock";
  }

  return "on_request";
}

function specificationsFromProduct(product, variation) {
  const specs = {};

  for (const parameter of product.Parameters || []) {
    const key = clean(parameter.ParameterText);
    const value = clean(parameter.ValueText);

    if (key && value) {
      specs[key] = value;
    }
  }

  return {
    ...specs,
    source: "DigiKey Product Information API V4",
    source_product_url: clean(product.ProductUrl),
    source_photo_url: clean(product.PhotoUrl),
    source_video_url: clean(product.PrimaryVideoUrl),
    digikey_product_number: clean(variation?.DigiKeyProductNumber),
    product_status: clean(product.ProductStatus?.Status),
    rohs_status: clean(product.Classifications?.RohsStatus),
    reach_status: clean(product.Classifications?.ReachStatus),
    moisture_sensitivity_level: clean(
      product.Classifications?.MoistureSensitivityLevel,
    ),
    export_control_class_number: clean(
      product.Classifications?.ExportControlClassNumber,
    ),
    htsus_code: clean(product.Classifications?.HtsusCode),
    other_names: product.OtherNames || [],
  };
}

async function upsertBrand(name) {
  const payload = {
    slug: slugify(name),
    name,
    status: "active",
  };
  const { data, error } = await supabase
    .from("brands")
    .upsert(payload, { onConflict: "slug" })
    .select("id")
    .single();

  if (error) {
    fail(`Could not upsert brand "${name}": ${JSON.stringify(error)}`);
  }

  return data.id;
}

async function upsertCategory(name) {
  const payload = {
    slug: slugify(name),
    name,
    status: "active",
  };
  const { data, error } = await supabase
    .from("categories")
    .upsert(payload, { onConflict: "slug" })
    .select("id")
    .single();

  if (error) {
    fail(`Could not upsert category "${name}": ${JSON.stringify(error)}`);
  }

  return data.id;
}

async function upsertProduct(payload) {
  let currentPayload = { ...payload };

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const { data, error } = await supabase
      .from("products")
      .upsert(currentPayload, { onConflict: "sku" })
      .select("id,sku,title")
      .single();

    if (!error) {
      return data;
    }

    const missingColumn = parseMissingColumn(error);

    if (missingColumn && missingColumn in currentPayload) {
      delete currentPayload[missingColumn];
      console.warn(`Column ${missingColumn} is missing in Supabase; retrying without it.`);
      continue;
    }

    fail(`Could not upsert product "${payload.sku}": ${JSON.stringify(error)}`);
  }

  fail(`Could not upsert product "${payload.sku}" after schema retries`);
}

function parseMissingColumn(error) {
  const message = error?.message || "";
  const match = message.match(/'([^']+)' column/);

  return error?.code === "PGRST204" && match ? match[1] : null;
}

function firstUnitPrice(prices) {
  const price = (prices || [])
    .filter((item) => Number.isFinite(Number(item.UnitPrice)))
    .sort((a, b) => Number(a.BreakQuantity || 0) - Number(b.BreakQuantity || 0))[0];

  return price ? Number(price.UnitPrice) : null;
}

function leadWeeksToDays(value) {
  const match = String(value || "").match(/(\d+)/);

  return match ? Number(match[1]) * 7 : null;
}

function toInteger(value) {
  const number = Number(value);

  return Number.isFinite(number) ? Math.max(0, Math.trunc(number)) : null;
}

function clean(value) {
  return typeof value === "string" ? value.trim() || null : null;
}

function slugify(value) {
  const slug = String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 170);

  return slug || `digikey-${Date.now()}`;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function printHelp() {
  console.log(`
Import DigiKey products into the Quicksol Supabase catalog.

This script uses DigiKey Product Information API V4. It does not scrape digikey.com.

Required environment variables:
  DIGIKEY_CLIENT_ID
  DIGIKEY_CLIENT_SECRET
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY

Optional environment variables:
  DIGIKEY_SITE=ES
  DIGIKEY_LANGUAGE=es
  DIGIKEY_CURRENCY=EUR

Examples:
  npm run import:digikey -- --keyword "TNC connector" --limit 10 --dry-run
  npm run import:digikey -- --keyword "TNC connector" --limit 10 --publish
  npm run import:digikey -- --mpn-file ./mpns.txt --publish --public-prices
`);
}
