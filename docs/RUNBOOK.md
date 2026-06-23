# Operations Runbook

Small app, no backend - operations are mostly "deploy" and "roll back". (Backlog F280.)

## Deploy

- `main` auto-deploys to production on Vercel. Keep `main` green (CI gates lint + type-check + tests + build).
- Manual: from the **repo root**, `vercel --prod` (project rootDirectory is `app`), or `../deploy-vercel.sh`.
- Preview: every PR gets a Vercel preview URL automatically (F274).

## Roll back production (fastest first)

1. **Vercel dashboard (seconds, recommended):** Project → Deployments → pick the last known-good deployment → **Promote to Production** (Instant Rollback). No rebuild.
2. **Vercel CLI:** `vercel rollback <deployment-url>` (or `vercel ls` to find the prior prod deployment, then `vercel promote <url>`).
3. **Git revert (when the code itself is bad):** `git revert <bad-sha>` → push to `main` → CI + auto-deploy ship the revert. Use for a clean history; slower than instant rollback.

## After a rollback

- Open an issue with the symptom, the bad deployment URL, and the SHA.
- Reproduce locally (`npm run dev`), add a failing test if logic-related, fix, PR.

## Health checks

- Smoke: load `/`, draw a card, score a point, refresh (resume works), go offline (banner shows, app still works).
- Routes that must 200: `/`, `/about`, `/privacy`, `/terms`, `/robots.txt`, `/sitemap.xml`.

## Secrets & env vars (F334, F286)

- The app ships **no secrets**: it is local-first with no backend, no API keys, no
  auth. The only `NEXT_PUBLIC_*` value is a public GitHub URL. So nothing sensitive
  can leak into the client bundle, and gitleaks (CI) guards against accidental
  commits.
- If a future feature needs config, manage it with `vercel env add/pull` and keep
  real secrets out of `NEXT_PUBLIC_*` (those are inlined into the client).

## Branch protection (one-time, GitHub repo settings - needs admin)

- Settings → Branches → protect `main`: require the **CI** checks (build + secret-scan) to pass before merge (F275).
