# LinkedIn Integration

The platform is prepared for two modes.

## Manual mode

`LINKEDIN_SYNC_MODE=manual`

Admins manage `linkedin_posts` records with URL, title, summary, image/video, date, order and status. Public pages read only `published` records. This mode does not require LinkedIn API approval and does not scrape LinkedIn.

## API mode

`LINKEDIN_SYNC_MODE=api`

API mode must be enabled only after LinkedIn app approval and valid credentials are available. Required safeguards:

- OAuth 2.0 with `state` validation.
- Organization ID verification.
- Admin role verification.
- Tokens encrypted at rest.
- Protected callback and cron endpoints.
- Graceful fallback to manual mode if API fails.

