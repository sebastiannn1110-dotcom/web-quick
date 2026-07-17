# Deployment Checklist

1. Confirm `npm run lint` passes.
2. Confirm `npm run build` passes.
3. Apply Supabase migration in staging.
4. Configure Render env vars.
5. Verify `/en`, `/en/catalog`, `/en/contact`, `/en/rfq`, `/sitemap.xml`, `/robots.txt`.
6. Verify catalog reads Supabase published products.
7. Verify private routes show protected states for anonymous users.
8. Verify `/api/ai/catalog` is `search_only` without OpenAI and `openai` with credentials.
9. Keep `CHECKOUT_MODE=rfq` until payment approval exists.
10. Promote to production after smoke tests.

