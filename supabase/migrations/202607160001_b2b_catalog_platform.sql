create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
create extension if not exists vector;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.normalize_part_reference(value text)
returns text
language sql
immutable
as $$
  select upper(regexp_replace(coalesce(value, ''), '[^a-zA-Z0-9]', '', 'g'));
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  company_name text,
  phone text,
  country text,
  preferred_locale text not null default 'en',
  role text not null default 'customer' check (role in ('customer', 'admin', 'super_admin')),
  status text not null default 'active' check (status in ('active', 'disabled', 'pending')),
  receive_notifications boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image_url text,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  logo_url text,
  website_url text,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  mpn text not null,
  slug text not null unique,
  title text not null,
  short_description text,
  description text,
  brand_id uuid references public.brands(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  manufacturer_name text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  visibility text not null default 'public' check (visibility in ('public', 'authenticated')),
  featured boolean not null default false,
  currency text not null default 'USD',
  price numeric(12, 4),
  compare_at_price numeric(12, 4),
  price_visibility text not null default 'quote_only' check (price_visibility in ('public', 'authenticated', 'quote_only')),
  stock_quantity integer,
  stock_status text not null default 'quote' check (stock_status in ('in_stock', 'limited', 'out_of_stock', 'quote')),
  minimum_order_quantity integer not null default 1,
  lead_time_min_days integer,
  lead_time_max_days integer,
  condition text,
  packaging text,
  country_of_origin text,
  datasheet_url text,
  specifications jsonb not null default '{}'::jsonb,
  search_text tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(sku, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(mpn, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(manufacturer_name, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(short_description, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'D')
  ) stored,
  sku_normalized text generated always as (public.normalize_part_reference(sku)) stored,
  mpn_normalized text generated always as (public.normalize_part_reference(mpn)) stored,
  embedding vector(1536),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.product_translations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  locale text not null,
  title text,
  short_description text,
  description text,
  translated_specifications jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id, locale)
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  public_url text,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_videos (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  public_url text,
  poster_url text,
  title text,
  caption text,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_documents (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  public_url text,
  document_type text not null default 'datasheet',
  title text not null,
  locale text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id text,
  status text not null default 'active' check (status in ('active', 'submitted', 'abandoned')),
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_id is not null or session_id is not null)
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  unit_price_snapshot numeric(12, 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rfq_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  company_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  country text not null,
  message text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'quoted', 'converted', 'closed')),
  notification_status text not null default 'pending' check (notification_status in ('pending', 'sent', 'failed', 'disabled')),
  notification_error text,
  notified_at timestamptz,
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company_name text not null,
  email text not null,
  phone text,
  country text not null,
  message text not null,
  locale text not null default 'en',
  status text not null default 'new' check (status in ('new', 'reviewing', 'closed')),
  notification_status text not null default 'pending' check (notification_status in ('pending', 'sent', 'failed', 'disabled')),
  notification_error text,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rfq_items (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfq_requests(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  requested_mpn text,
  quantity integer not null check (quantity > 0),
  target_price numeric(12, 4),
  required_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  rfq_id uuid references public.rfq_requests(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'fulfilled', 'cancelled')),
  currency text not null default 'USD',
  total_amount numeric(12, 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  sku_snapshot text not null,
  mpn_snapshot text not null,
  title_snapshot text not null,
  quantity integer not null check (quantity > 0),
  unit_price_snapshot numeric(12, 4),
  created_at timestamptz not null default now()
);

create table if not exists public.linkedin_posts (
  id uuid primary key default gen_random_uuid(),
  linkedin_url text not null,
  title text not null,
  summary text,
  image_url text,
  video_url text,
  published_at timestamptz,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.corporate_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  video_url text not null,
  poster_url text,
  captions_url text,
  locale text,
  cta_label text,
  related_url text,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles','categories','brands','products','product_translations',
    'product_images','product_videos','product_documents','carts','cart_items',
    'contact_requests','rfq_requests','rfq_items','orders','linkedin_posts','corporate_videos'
  ]
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end $$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and status = 'active'
      and role in ('admin', 'super_admin')
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and status = 'active'
      and role = 'super_admin'
  );
$$;

create or replace view public.public_catalog_products as
select
  p.id,
  p.sku,
  p.mpn,
  p.slug,
  p.title,
  p.short_description,
  p.description,
  b.name as brand_name,
  b.slug as brand_slug,
  c.name as category_name,
  c.slug as category_slug,
  p.manufacturer_name,
  p.status,
  p.visibility,
  p.featured,
  p.currency,
  case when p.price_visibility = 'public' then p.price else null end as price,
  case when p.price_visibility = 'public' then p.price else null end as public_price_sort,
  p.price_visibility,
  p.stock_quantity,
  p.stock_status,
  p.minimum_order_quantity,
  p.lead_time_min_days,
  p.lead_time_max_days,
  p.condition,
  p.packaging,
  p.country_of_origin,
  p.datasheet_url,
  p.specifications,
  p.sku_normalized,
  p.mpn_normalized,
  img.public_url as primary_image_url,
  img.alt_text as primary_image_alt,
  p.published_at,
  p.updated_at
from public.products p
left join public.brands b on b.id = p.brand_id
left join public.categories c on c.id = p.category_id
left join lateral (
  select public_url, alt_text
  from public.product_images
  where product_id = p.id
  order by is_primary desc, sort_order asc, created_at asc
  limit 1
) img on true
where p.status = 'published'
  and p.visibility = 'public'
  and p.deleted_at is null;

create index if not exists idx_products_status_visibility on public.products(status, visibility);
create index if not exists idx_products_sku_normalized on public.products(sku_normalized);
create index if not exists idx_products_mpn_normalized on public.products(mpn_normalized);
create index if not exists idx_products_search_text on public.products using gin(search_text);
create index if not exists idx_products_specs on public.products using gin(specifications);
create index if not exists idx_products_embedding on public.products using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index if not exists idx_product_translations_locale on public.product_translations(product_id, locale);
create index if not exists idx_rfq_requests_user on public.rfq_requests(user_id);
create index if not exists idx_orders_user on public.orders(user_id);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles','categories','brands','products','product_translations',
    'product_images','product_videos','product_documents','favorites','carts',
    'cart_items','contact_requests','rfq_requests','rfq_items','orders','order_items',
    'linkedin_posts','corporate_videos','admin_audit_logs'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles self update no role" on public.profiles;
create policy "profiles self update no role" on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

drop policy if exists "profiles admin manage" on public.profiles;
create policy "profiles admin manage" on public.profiles
for all using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "public active categories" on public.categories;
create policy "public active categories" on public.categories
for select using (status = 'active');

drop policy if exists "admin manage categories" on public.categories;
create policy "admin manage categories" on public.categories
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public active brands" on public.brands;
create policy "public active brands" on public.brands
for select using (status = 'active');

drop policy if exists "admin manage brands" on public.brands;
create policy "admin manage brands" on public.brands
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public published products" on public.products;
create policy "public published products" on public.products
for select using (status = 'published' and visibility = 'public' and deleted_at is null);

drop policy if exists "admin manage products" on public.products;
create policy "admin manage products" on public.products
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public product assets" on public.product_images;
create policy "public product assets" on public.product_images
for select using (exists (
  select 1 from public.products p
  where p.id = product_id and p.status = 'published' and p.visibility = 'public'
));

drop policy if exists "admin manage product images" on public.product_images;
create policy "admin manage product images" on public.product_images
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public product videos" on public.product_videos;
create policy "public product videos" on public.product_videos
for select using (status = 'published' and exists (
  select 1 from public.products p
  where p.id = product_id and p.status = 'published' and p.visibility = 'public'
));

drop policy if exists "admin manage product videos" on public.product_videos;
create policy "admin manage product videos" on public.product_videos
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public product documents" on public.product_documents;
create policy "public product documents" on public.product_documents
for select using (exists (
  select 1 from public.products p
  where p.id = product_id and p.status = 'published' and p.visibility = 'public'
));

drop policy if exists "admin manage product documents" on public.product_documents;
create policy "admin manage product documents" on public.product_documents
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "users manage favorites" on public.favorites;
create policy "users manage favorites" on public.favorites
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "users manage own carts" on public.carts;
create policy "users manage own carts" on public.carts
for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "users manage own cart items" on public.cart_items;
create policy "users manage own cart items" on public.cart_items
for all using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()) or public.is_admin())
with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()) or public.is_admin());

drop policy if exists "users create rfq" on public.rfq_requests;
create policy "users create rfq" on public.rfq_requests
for insert with check (user_id is null or user_id = auth.uid());

drop policy if exists "users read own rfq" on public.rfq_requests;
create policy "users read own rfq" on public.rfq_requests
for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "admin manage rfq" on public.rfq_requests;
create policy "admin manage rfq" on public.rfq_requests
for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public create contact requests" on public.contact_requests;
create policy "public create contact requests" on public.contact_requests
for insert with check (true);

drop policy if exists "admin read contact requests" on public.contact_requests;
create policy "admin read contact requests" on public.contact_requests
for select using (public.is_admin());

drop policy if exists "admin manage contact requests" on public.contact_requests;
create policy "admin manage contact requests" on public.contact_requests
for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "users read own orders" on public.orders;
create policy "users read own orders" on public.orders
for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "admin manage orders" on public.orders;
create policy "admin manage orders" on public.orders
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public linkedin posts" on public.linkedin_posts;
create policy "public linkedin posts" on public.linkedin_posts
for select using (status = 'published');

drop policy if exists "admin manage linkedin posts" on public.linkedin_posts;
create policy "admin manage linkedin posts" on public.linkedin_posts
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public corporate videos" on public.corporate_videos;
create policy "public corporate videos" on public.corporate_videos
for select using (status = 'published');

drop policy if exists "admin manage corporate videos" on public.corporate_videos;
create policy "admin manage corporate videos" on public.corporate_videos
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin read audit logs" on public.admin_audit_logs;
create policy "admin read audit logs" on public.admin_audit_logs
for select using (public.is_admin());

drop policy if exists "admin insert audit logs" on public.admin_audit_logs;
create policy "admin insert audit logs" on public.admin_audit_logs
for insert with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif']),
  ('product-videos', 'product-videos', true, 209715200, array['video/mp4','video/webm','video/quicktime']),
  ('product-documents', 'product-documents', false, 26214400, array['application/pdf']),
  ('corporate-media', 'corporate-media', true, 209715200, array['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/webm']),
  ('linkedin-media', 'linkedin-media', true, 104857600, array['image/jpeg','image/png','image/webp','video/mp4','video/webm'])
on conflict (id) do nothing;
