import { NextResponse, type NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { forwardSubmission } from "@/lib/submissions";
import { rfqSchema, validateBomFile } from "@/lib/validation";

function clientKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export async function POST(request: NextRequest) {
  if (!rateLimit(`rfq:${clientKey(request)}`, 5)) {
    return NextResponse.json(
      { ok: false, code: "rate_limited" },
      { status: 429 },
    );
  }

  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return NextResponse.json(
      { ok: false, code: "invalid_payload" },
      { status: 400 },
    );
  }

  const bom = formData.get("bom");
  const bomFile = bom instanceof File ? bom : null;
  const fileResult = validateBomFile(bomFile);

  if (!fileResult.ok) {
    return NextResponse.json(
      { ok: false, code: fileResult.reason },
      { status: 400 },
    );
  }

  const parsed = rfqSchema.safeParse({
    company: formData.get("company"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    country: formData.get("country"),
    partNumber: formData.get("partNumber"),
    manufacturer: formData.get("manufacturer"),
    quantity: formData.get("quantity"),
    targetPrice: formData.get("targetPrice"),
    requiredDate: formData.get("requiredDate"),
    notes: formData.get("notes"),
    consent: formData.get("consent") === "true",
    website: formData.get("website"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, code: "invalid_payload" },
      { status: 400 },
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  await forwardSubmission({
    type: "rfq",
    payload: parsed.data,
    bom: fileResult.file,
  });

  return NextResponse.json({ ok: true });
}
