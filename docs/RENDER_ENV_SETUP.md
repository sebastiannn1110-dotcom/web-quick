# Render Environment Setup

| Variable | Public | Render service | Used by | Verification without value |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Yes | Web | SEO, sitemap | Open `/sitemap.xml` and check host |
| `CRM_WEBHOOK_URL` | No | Web | Contact/RFQ forwarding | Submit staging form and check CRM receipt |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Web | Browser/server Supabase | Catalog no longer shows setup state |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Web | Browser/server Supabase | Preferred public key name; app also accepts anon key fallback |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Web | Browser/server Supabase | Auth and public catalog can initialize |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Web only | Admin server-only operations | Admin diagnostics pass server-side |
| `SUPABASE_DATABASE_URL` | No | Migration runner/operator | SQL migrations | Migration command connects |
| `RESEND_API_KEY` | No | Web | Contact/RFQ email notifications | Requests persist even if email fails; notification status records failure |
| `EMAIL_FROM` | No | Web | Contact/RFQ email notifications | Resend accepts sender domain |
| `ADMIN_NOTIFICATION_EMAILS` | No | Web | Internal sales/admin notifications | Comma-separated recipients receive form alerts |
| `OPENAI_API_KEY` | No | Web | Catalog assistant | `/api/ai/catalog` returns `mode=openai` |
| `OPENAI_MODEL` | No | Web | Catalog assistant | Assistant response metadata/logs |
| `OPENAI_EMBEDDING_MODEL` | No | Worker/operator | Embeddings | Embedding job uses configured model |
| `LINKEDIN_CLIENT_ID` | No | Web | LinkedIn API mode | Admin connect button enabled in API mode |
| `LINKEDIN_CLIENT_SECRET` | No | Web | LinkedIn OAuth callback | Callback can exchange code |
| `LINKEDIN_REDIRECT_URI` | No | Web | LinkedIn OAuth | Matches LinkedIn app setting |
| `LINKEDIN_ORGANIZATION_ID` | No | Web | LinkedIn sync | Sync targets expected organization |
| `LINKEDIN_SYNC_MODE` | No | Web | LinkedIn provider | `manual` works without API approval |
| `LINKEDIN_TOKEN_ENCRYPTION_KEY` | No | Web | Token encryption | API mode refuses to connect if missing |
| `CRON_SECRET` | No | Web/cron | Protected cron endpoints | Request without header is rejected |
| `CHECKOUT_MODE` | No | Web | Cart/checkout | `rfq` creates RFQ instead of payment |
| `ADMIN_BOOTSTRAP_EMAILS` | No | Operator/bootstrap | First admin setup | Bootstrap script lists allowed emails only |
| `MAX_IMAGE_UPLOAD_MB` | No | Web | Upload validation | Oversized image rejected |
| `MAX_VIDEO_UPLOAD_MB` | No | Web | Upload validation | Oversized video rejected |
