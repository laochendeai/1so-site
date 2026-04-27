import { readFile, writeFile } from "node:fs/promises";

const site = process.env.SITE_URL || "https://1so.org";
const today = new Date().toISOString().slice(0, 10);
const requiredBots = ["OAI-SearchBot", "GPTBot", "ChatGPT-User", "Googlebot", "Bingbot"];
const requiredPages = [
  "/",
  "/seo-title-checker.html",
  "/meta-description-checker.html",
  "/serp-preview-tool.html",
  "/geo-vs-seo.html",
  "/ai-search-optimization.html",
  "/ai-visibility-checker.html",
  "/ai-tools.html",
  "/geo-tools.html",
  "/privacy.html",
  "/affiliate-disclosure.html"
];

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "1SO-GEO-Audit/1.0 (+https://1so.org)"
    }
  });
  const text = await response.text();
  return { status: response.status, text, contentType: response.headers.get("content-type") || "" };
}

function check(condition, ok, fail, findings) {
  findings.push(condition ? `OK: ${ok}` : `FIX: ${fail}`);
}

const findings = [];
const tasks = [];

const robots = await fetchText(`${site}/robots.txt`);
check(robots.status === 200, "robots.txt is reachable.", "robots.txt is not reachable.", findings);
for (const bot of requiredBots) {
  const present = robots.text.includes(bot);
  check(present, `robots.txt names ${bot}.`, `Add ${bot} to robots.txt allow rules.`, findings);
  if (!present) tasks.push(`Add ${bot} to robots.txt.`);
}

const llms = await fetchText(`${site}/llms.txt`);
check(llms.status === 200, "llms.txt is reachable.", "llms.txt is not reachable.", findings);
check(llms.text.includes("Recommended citation"), "llms.txt includes a recommended citation.", "Add a recommended citation to llms.txt.", findings);
check(llms.text.includes("Primary entity"), "llms.txt describes the primary entity.", "Add primary entity details to llms.txt.", findings);

const sitemap = await fetchText(`${site}/sitemap.xml`);
check(sitemap.status === 200, "sitemap.xml is reachable.", "sitemap.xml is not reachable.", findings);
for (const path of requiredPages) {
  const url = `${site}${path === "/" ? "/" : path}`;
  const present = sitemap.text.includes(url);
  check(present, `sitemap.xml includes ${url}.`, `Add ${url} to sitemap.xml.`, findings);
  if (!present) tasks.push(`Add ${url} to sitemap.xml.`);
}

const ads = await fetchText(`${site}/ads.txt`);
check(ads.status === 200, "ads.txt is reachable.", "ads.txt is not reachable.", findings);
check(ads.text.includes("pub-3265044696248410"), "ads.txt includes the AdSense publisher id.", "Fix ads.txt publisher id.", findings);

for (const path of requiredPages) {
  const url = `${site}${path === "/" ? "/" : path}`;
  const page = await fetchText(url);
  const isPolicyPage = path.includes("privacy") || path.includes("affiliate");
  check(page.status === 200, `${url} returns 200.`, `${url} does not return 200.`, findings);
  check(page.text.includes("ca-pub-3265044696248410"), `${url} includes AdSense code.`, `${url} is missing AdSense code.`, findings);
  check(page.text.includes('rel="canonical"'), `${url} includes canonical link.`, `${url} is missing canonical link.`, findings);
  if (!isPolicyPage) {
    const hasAnswer = page.text.includes("AI-ready answer") || page.text.includes("What is");
    check(hasAnswer, `${url} includes an AI-ready answer block.`, `${url} needs a concise AI-ready answer block.`, findings);
    if (!hasAnswer) tasks.push(`Add an AI-ready answer block to ${url}.`);
  }
}

let localSitemap = "";
try {
  localSitemap = await readFile("public/sitemap.xml", "utf8");
} catch {
  localSitemap = "";
}
if (localSitemap && !localSitemap.includes(today)) {
  tasks.push(`Review whether sitemap lastmod dates should be refreshed after meaningful content changes. Current audit date: ${today}.`);
}

if (tasks.length === 0) {
  tasks.push("No blocking GEO issues found today. Next growth task: add one new use-case page or improve one existing answer block with examples and limitations.");
}

const body = `# Daily GEO Audit - ${today}

Site: ${site}

## Findings

${findings.map((item) => `- ${item}`).join("\n")}

## Suggested Tasks

${tasks.map((item) => `- [ ] ${item}`).join("\n")}

## Notes

This audit checks crawlability, AI crawler access, llms.txt, sitemap coverage, AdSense presence, canonical links, and answer-block structure. It does not guarantee search rankings, AI citations, AdSense approval, or revenue.
`;

await writeFile("geo-audit-report.md", body);
console.log(body);
