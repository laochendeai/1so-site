const directory = document.querySelector("#tool-directory");
const searchInput = document.querySelector("#tool-search");
const categoryFilter = document.querySelector("#category-filter");
const affiliateFilter = document.querySelector("#affiliate-filter");
let tools = [];

function matches(tool) {
  const q = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const affiliateOnly = affiliateFilter.checked;
  const haystack = [tool.name, tool.category, tool.useCase, tool.bestFor, tool.geoValue, ...(tool.tags || [])].join(" ").toLowerCase();
  return (!q || haystack.includes(q)) &&
    (category === "All" || tool.category === category) &&
    (!affiliateOnly || ["candidate", "pending"].includes(tool.affiliateStatus));
}

function render() {
  const filtered = tools.filter(matches);
  directory.innerHTML = filtered.map((tool) => `
    <article class="tool-card">
      <div>
        <span class="pill">${tool.category}</span>
        <h2>${tool.name}</h2>
        <p>${tool.useCase}</p>
      </div>
      <dl>
        <dt>Free access</dt><dd>${tool.freeAccess}</dd>
        <dt>Best for</dt><dd>${tool.bestFor}</dd>
        <dt>GEO value</dt><dd>${tool.geoValue}</dd>
        <dt>Affiliate</dt><dd>${tool.affiliateStatus}</dd>
      </dl>
      <a class="text-link" href="${tool.url}" rel="nofollow sponsored noopener" target="_blank">Visit official site</a>
    </article>
  `).join("") || "<p>No tools match the current filters.</p>";
}

fetch("/data/ai-tools.json")
  .then((response) => response.json())
  .then((data) => {
    tools = data;
    render();
  });

[searchInput, categoryFilter, affiliateFilter].forEach((el) => el.addEventListener("input", render));
