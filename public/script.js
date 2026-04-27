const titleInput = document.querySelector("#title-input");
const descriptionInput = document.querySelector("#description-input");
const urlInput = document.querySelector("#url-input");
const keywordInput = document.querySelector("#keyword-input");
const previewTitle = document.querySelector("#preview-title");
const previewDescription = document.querySelector("#preview-description");
const previewUrl = document.querySelector("#preview-url");
const scoreEl = document.querySelector("#score");
const titleStatus = document.querySelector("#title-status");
const descriptionStatus = document.querySelector("#description-status");
const keywordStatus = document.querySelector("#keyword-status");
const suggestions = document.querySelector("#suggestions");

const clampText = (value, max) => value.trim().length > max ? `${value.trim().slice(0, max - 1)}...` : value.trim();
const hasKeyword = (text, keyword) => keyword && text.toLowerCase().includes(keyword.toLowerCase());

function statusForLength(length, min, max) {
  if (length < min) return "Short";
  if (length > max) return "Long";
  return "Good";
}

function updatePreview() {
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const url = urlInput.value.trim();
  const keyword = keywordInput.value.trim();
  const titleLen = title.length;
  const descLen = description.length;
  const titleOk = titleLen >= 45 && titleLen <= 60;
  const descOk = descLen >= 120 && descLen <= 155;
  const keywordOk = hasKeyword(`${title} ${description}`, keyword);
  let score = 40;
  if (titleOk) score += 20;
  if (descOk) score += 20;
  if (keywordOk) score += 15;
  if (/how|free|best|tool|check|guide|template/i.test(title)) score += 5;

  previewTitle.textContent = clampText(title || "Your SEO title preview", 68);
  previewDescription.textContent = clampText(description || "Your meta description preview will appear here.", 160);
  previewUrl.textContent = url || "https://example.com/page";
  scoreEl.textContent = `${Math.min(score, 100)}/100`;
  titleStatus.textContent = statusForLength(titleLen, 45, 60);
  descriptionStatus.textContent = statusForLength(descLen, 120, 155);
  keywordStatus.textContent = keywordOk ? "Used" : "Missing";

  const notes = [];
  if (!titleOk) notes.push(`Title is ${titleLen} characters; aim for 45 to 60.`);
  if (!descOk) notes.push(`Meta description is ${descLen} characters; aim for 120 to 155.`);
  if (!keywordOk) notes.push("Use the target keyword naturally in the title or description.");
  if (!notes.length) notes.push("Snippet is clear. Next step: test it against the search intent and page content.");
  suggestions.innerHTML = notes.map((note) => `<li>${note}</li>`).join("");
}

function generateTitles() {
  const keyword = keywordInput.value.trim() || "SEO title";
  const base = keyword.replace(/\b\w/g, (char) => char.toUpperCase());
  const ideas = [
    `${base}: Free Preview Tool for Better Google Snippets`,
    `Free ${base} Checker for SEO Titles and Meta Descriptions`,
    `How to Improve Your ${base} Before Publishing`,
    `${base} Tool: Check Length, Keywords, and CTR Clarity`,
    `Best ${base} Examples for Higher Search Clicks`
  ];
  suggestions.innerHTML = ideas.map((idea) => `<li>${idea}</li>`).join("");
  titleInput.value = ideas[0];
  updatePreview();
}

async function copySnippet() {
  const text = `Title: ${titleInput.value.trim()}\nDescription: ${descriptionInput.value.trim()}\nURL: ${urlInput.value.trim()}`;
  await navigator.clipboard.writeText(text);
  suggestions.innerHTML = "<li>Snippet copied to clipboard.</li>";
}

document.querySelector("#generate-btn").addEventListener("click", generateTitles);
document.querySelector("#copy-btn").addEventListener("click", copySnippet);
[titleInput, descriptionInput, urlInput, keywordInput].forEach((field) => field.addEventListener("input", updatePreview));
document.querySelector("#year").textContent = new Date().getFullYear();
updatePreview();
