# 1SO.org

Static site for 1SO.org, a SERP snippet, SEO, and GEO utility site deployed to Cloudflare Pages.

## Structure

- `public/` - Static HTML, CSS, JS, robots.txt, sitemap.xml, ads.txt, llms.txt.
- `functions/` - Cloudflare Pages Functions, including the `www.1so.org` to `1so.org` redirect.
- `scripts/geo-audit.mjs` - Daily GEO audit script used by GitHub Actions.
- `.github/workflows/deploy-cloudflare-pages.yml` - Deploys to Cloudflare Pages on pushes to `main`.
- `.github/workflows/daily-geo-audit.yml` - Runs a daily GEO audit and opens a GitHub Issue.

## GitHub Secrets

Add these repository secrets before enabling deployment:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The Cloudflare token needs permission to deploy the `1so-landing` Pages project.

## Local Commands

```bash
npm install
npm run audit:geo
npm run deploy
```

## Daily GEO Audit

The scheduled workflow checks:

- AI crawler access in `robots.txt`
- `llms.txt` entity and citation structure
- `sitemap.xml` coverage
- AdSense code presence
- Canonical links
- AI-ready answer blocks

It creates or updates one GitHub Issue per day with suggested tasks.
