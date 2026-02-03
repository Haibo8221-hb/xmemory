# xmemory Issues & TODOs

## High Priority

### [ ] Deploy Email Worker for automatic upload processing
**Created:** 2026-02-03

**Description:**
Currently email to `upload@xmemory.work` is forwarded to admin email. Need to deploy Cloudflare Email Worker to automatically process emails and save content to user accounts.

**Requirements:**
1. Create Cloudflare API Token with Workers permissions
2. Deploy `cloudflare/email-worker.js` using wrangler
3. Update Email Routing rule: `upload@xmemory.work` → Worker (instead of email forward)
4. Test with subaddressing: `upload+userId@xmemory.work`

**Files ready:**
- `cloudflare/email-worker.js` - Worker code
- `cloudflare/wrangler.toml` - Deployment config
- `src/app/api/email-upload/route.ts` - API endpoint

**Blocked by:** Need to create Cloudflare API Token manually in dashboard

---

## Medium Priority

### [ ] Add email binding UI in user settings
Allow users to bind their email address for automatic upload matching.

### [ ] Email upload confirmation notification
Send user a notification when content is uploaded via email.

---

## Low Priority

### [ ] Support multiple email addresses per user
Allow users to bind multiple email addresses.

### [ ] Email upload analytics
Track email upload success/failure rates.
