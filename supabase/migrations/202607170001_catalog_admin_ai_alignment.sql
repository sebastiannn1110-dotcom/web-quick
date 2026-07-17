alter table public.products
  add column if not exists archived_at timestamptz,
  add column if not exists embedding_source_hash text,
  add column if not exists embedding_status text not null default 'pending',
  add column if not exists embedding_error text,
  add column if not exists embedded_at timestamptz;

alter table public.orders
  add column if not exists order_number text,
  add column if not exists payment_status text not null default 'rfq',
  add column if not exists fulfillment_status text not null default 'pending';

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'products_stock_status_check'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products drop constraint products_stock_status_check;
  end if;

  alter table public.products
    add constraint products_stock_status_check
    check (stock_status in (
      'in_stock',
      'low_stock',
      'out_of_stock',
      'on_request',
      'discontinued',
      'limited',
      'quote'
    ));

  if exists (
    select 1
    from pg_constraint
    where conname = 'products_embedding_status_check'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products drop constraint products_embedding_status_check;
  end if;

  alter table public.products
    add constraint products_embedding_status_check
    check (embedding_status in (
      'pending',
      'processing',
      'ready',
      'failed',
      'disabled'
    ));

  if exists (
    select 1
    from pg_constraint
    where conname = 'rfq_requests_status_check'
      and conrelid = 'public.rfq_requests'::regclass
  ) then
    alter table public.rfq_requests drop constraint rfq_requests_status_check;
  end if;

  alter table public.rfq_requests
    add constraint rfq_requests_status_check
    check (status in (
      'new',
      'reviewing',
      'quoted',
      'accepted',
      'rejected',
      'converted',
      'closed'
    ));
end $$;

update public.products
set archived_at = coalesce(archived_at, deleted_at)
where archived_at is null
  and (status = 'archived' or deleted_at is not null);

update public.products
set embedding_status = case
  when status = 'published' and archived_at is null then 'pending'
  else 'disabled'
end
where embedding_status is null;

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
  and p.archived_at is null
  and p.deleted_at is null;

create index if not exists idx_products_archived_at on public.products(archived_at);
create index if not exists idx_products_embedding_status on public.products(embedding_status);
create index if not exists idx_products_embedding_hash on public.products(embedding_source_hash);

drop policy if exists "public read quicksol public storage" on storage.objects;
create policy "public read quicksol public storage" on storage.objects
for select using (
  bucket_id in ('product-images', 'product-videos', 'corporate-media', 'linkedin-media')
);

drop policy if exists "admin manage quicksol storage" on storage.objects;
create policy "admin manage quicksol storage" on storage.objects
for all using (
  bucket_id in ('product-images', 'product-videos', 'product-documents', 'corporate-media', 'linkedin-media')
  and public.is_admin()
) with check (
  bucket_id in ('product-images', 'product-videos', 'product-documents', 'corporate-media', 'linkedin-media')
  and public.is_admin()
);
