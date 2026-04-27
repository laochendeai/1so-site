$ErrorActionPreference = "Stop"

$siteRoot = Split-Path -Parent $PSScriptRoot
$logPath = Join-Path $siteRoot "seo-daily.log"
$date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

if (-not (Get-Command openclaw -ErrorAction SilentlyContinue)) {
  "[$date] openclaw is not installed or not in PATH. Skipped daily SEO/GEO run." | Add-Content -Path $logPath
  exit 0
}

openclaw --site "https://1so.org" --goal "Improve SEO and GEO clarity for a single-page SERP snippet optimizer" --output (Join-Path $siteRoot "openclaw-report.md")
"[$date] openclaw SEO/GEO run completed." | Add-Content -Path $logPath
