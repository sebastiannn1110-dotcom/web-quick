# Supabase Setup

1. Create a Supabase project for Quicksol Global.
2. Configure these Render variables without exposing values in logs: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DATABASE_URL`.
3. Apply `supabase/migrations/202607160001_b2b_catalog_platform.sql` from a trusted operator machine or Supabase SQL editor.
4. Verify tables exist: `profiles`, `categories`, `brands`, `products`, `rfq_requests`, `orders`, `admin_audit_logs`.
5. Verify RLS is enabled on all public tables.
6. Verify buckets exist: `product-images`, `product-videos`, `product-documents`, `corporate-media`, `linkedin-media`.
7. Bootstrap the first admin by inserting/updating a trusted `profiles` row server-side. Never allow client-side role escalation.

No destructive migrations are executed by the app.

