# Deployment Notes

Render continues to use:

- Build: `npm ci && npm run build`
- Start: `npm run start`
- Health check: `/en`

Migrations are operator-controlled and are not run automatically by the app.

