# Rollback

## Code rollback

Redeploy the previous Render version or revert the commit containing the platform changes.

## Database rollback

The migration is additive and uses `create table if not exists`. If rollback is required, first disable new UI links, then archive data or drop new objects only after backup and explicit approval.

## Feature rollback

- Disable AI: remove `OPENAI_API_KEY` or set `AI_ASSISTANT_ENABLED=false`.
- Disable LinkedIn API: set `LINKEDIN_SYNC_MODE=manual`.
- Disable checkout beyond RFQ: keep `CHECKOUT_MODE=rfq`.
- Hide admin/portal links if auth setup is incomplete.

