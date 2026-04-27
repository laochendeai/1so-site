const form = document.querySelector("#visibility-form");
const urlInput = document.querySelector("#visibility-url");
const score = document.querySelector("#visibility-score");
const summary = document.querySelector("#visibility-summary");

function renderResult(data) {
  score.textContent = `${data.score}/100`;
  const checks = data.checks.map((check) => `
    <li class="${check.ok ? "ok" : "fix"}">
      <strong>${check.ok ? "OK" : "Fix"}:</strong> ${check.label}
      ${check.ok ? "" : `<span>${check.fix}</span>`}
    </li>
  `).join("");
  summary.innerHTML = `
    <p><strong>Final URL:</strong> ${data.finalUrl || data.target}</p>
    <p><strong>Title:</strong> ${data.summary.title || "Missing"} (${data.summary.titleLength})</p>
    <p><strong>Description:</strong> ${data.summary.description || "Missing"} (${data.summary.descriptionLength})</p>
    <p><strong>AI crawlers found:</strong> ${data.summary.aiBotsPresent.join(", ") || "None detected"}</p>
    <ul class="check-list">${checks}</ul>
  `;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  score.textContent = "...";
  summary.innerHTML = "<p>Checking page, robots.txt, llms.txt, and sitemap.xml...</p>";
  try {
    const response = await fetch("/api/visibility", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: urlInput.value.trim() })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to check this URL.");
    renderResult(data);
  } catch (error) {
    score.textContent = "-";
    summary.innerHTML = `<p>${error.message}</p>`;
  }
});
