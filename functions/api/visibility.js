const AI_BOTS = ["OAI-SearchBot", "GPTBot", "ChatGPT-User", "Googlebot", "Bingbot"];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type"
    }
  });
}

function isBlockedHost(hostname) {
  const h = hostname.toLowerCase();
  return (
    h === "localhost" ||
    h.endsWith(".local") ||
    h === "127.0.0.1" ||
    h.startsWith("127.") ||
    h.startsWith("10.") ||
    h.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(h) ||
    h === "::1" ||
    h === "0.0.0.0"
  );
}

function extract(pattern, text) {
  const match = text.match(pattern);
  return match ? match[1].replace(/\s+/g, " ").trim() : "";
}

async function getText(url) {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent": "1SO-AI-Visibility-Checker/1.0 (+https://1so.org)"
      },
      signal: AbortSignal.timeout(9000)
    });
    const text = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      url: response.url,
      text: text.slice(0, 500000),
      contentType: response.headers.get("content-type") || ""
    };
  } catch (error) {
    return { ok: false, status: 0, url, text: "", contentType: "", error: error.message };
  }
}

function addCheck(checks, condition, label, weight, fix) {
  checks.push({ label, ok: Boolean(condition), weight, fix });
}

export async function onRequestOptions() {
  return json({ ok: true });
}

export async function onRequestPost(context) {
  let input;
  try {
    input = await context.request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  let target;
  try {
    target = new URL(input.url);
  } catch {
    return json({ error: "Enter a valid http or https URL." }, 400);
  }

  if (!["http:", "https:"].includes(target.protocol) || isBlockedHost(target.hostname)) {
    return json({ error: "Only public http or https URLs are supported." }, 400);
  }

  const origin = `${target.protocol}//${target.host}`;
  const [page, robots, llms, sitemap] = await Promise.all([
    getText(target.toString()),
    getText(`${origin}/robots.txt`),
    getText(`${origin}/llms.txt`),
    getText(`${origin}/sitemap.xml`)
  ]);

  const html = page.text;
  const title = extract(/<title[^>]*>([\s\S]*?)<\/title>/i, html);
  const description = extract(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i, html) ||
    extract(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i, html);
  const h1 = extract(/<h1[^>]*>([\s\S]*?)<\/h1>/i, html).replace(/<[^>]+>/g, "");
  const canonical = /rel=["']canonical["']/i.test(html);
  const schema = /application\/ld\+json/i.test(html);
  const answerBlock = /AI-ready answer|What is |What are |How to |Checklist|FAQ/i.test(html);
  const headings = (html.match(/<h[12][^>]*>/gi) || []).length;
  const aiBotsPresent = AI_BOTS.filter((bot) => robots.text.includes(bot));
  const llmsEntity = /Recommended citation|Primary entity|Key pages/i.test(llms.text);
  const sitemapHasTarget = sitemap.text.includes(target.pathname) || sitemap.text.includes(origin);

  const checks = [];
  addCheck(checks, page.ok, "Page is reachable", 12, "Fix server, SSL, redirects, or blocking errors.");
  addCheck(checks, title.length >= 25 && title.length <= 70, "Title is clear and scannable", 10, "Write a 25-70 character title that names the page topic.");
  addCheck(checks, description.length >= 80 && description.length <= 180, "Meta description is useful", 10, "Write an 80-180 character description with the page topic and benefit.");
  addCheck(checks, Boolean(h1), "Page has a visible H1", 8, "Add one clear H1 that describes the page.");
  addCheck(checks, headings >= 3, "Page uses structured sections", 8, "Break the page into question-led H2 sections.");
  addCheck(checks, canonical, "Canonical link exists", 8, "Add a canonical URL in the head.");
  addCheck(checks, schema, "Structured data exists", 10, "Add accurate JSON-LD such as WebApplication, Article, FAQPage, or HowTo.");
  addCheck(checks, answerBlock, "AI-ready answer block found", 12, "Add a concise definition or answer near the top of the page.");
  addCheck(checks, robots.ok && aiBotsPresent.length >= 3, "AI and search crawlers are named in robots.txt", 10, "Allow OAI-SearchBot, GPTBot, ChatGPT-User, Googlebot, and Bingbot.");
  addCheck(checks, llms.ok && llmsEntity, "llms.txt explains the site entity", 7, "Add llms.txt with entity, key pages, and recommended citation.");
  addCheck(checks, sitemap.ok && sitemapHasTarget, "Sitemap is reachable and relevant", 5, "Add the page to sitemap.xml.");

  const max = checks.reduce((sum, check) => sum + check.weight, 0);
  const earned = checks.reduce((sum, check) => sum + (check.ok ? check.weight : 0), 0);
  const score = Math.round((earned / max) * 100);

  return json({
    target: target.toString(),
    finalUrl: page.url,
    score,
    summary: {
      title,
      titleLength: title.length,
      description,
      descriptionLength: description.length,
      h1,
      aiBotsPresent,
      pageStatus: page.status,
      robotsStatus: robots.status,
      llmsStatus: llms.status,
      sitemapStatus: sitemap.status
    },
    checks,
    fixes: checks.filter((check) => !check.ok).map((check) => check.fix)
  });
}
