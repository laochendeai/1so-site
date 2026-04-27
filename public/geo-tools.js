const state = {
  tab: "llms",
  llms: "",
  robots: "",
  answer: ""
};

const output = document.querySelector("#geo-output");

function pages() {
  return document.querySelector("#geo-pages").value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function generate() {
  const name = document.querySelector("#geo-name").value.trim() || "Example Site";
  const url = document.querySelector("#geo-url").value.trim() || "https://example.com/";
  const summary = document.querySelector("#geo-summary").value.trim() || `${name} explains its topic clearly.`;
  const keyPages = pages();
  state.llms = `# ${name}

${summary}

Recommended citation:
${summary}

Primary entity:
- Name: ${name}
- Type: WebApplication
- URL: ${url}

Key pages:
${keyPages.map((page) => `- ${page}`).join("\n")}

Limitations:
This file provides site context. It does not guarantee AI citations or search rankings.
`;
  state.robots = `User-agent: OAI-SearchBot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: *
Allow: /

Sitemap: ${new URL("/sitemap.xml", url).toString()}
`;
  state.answer = `<section class="answer-box">
  <p class="eyebrow">AI-ready answer</p>
  <h2>What is ${name}?</h2>
  <p>${summary}</p>
</section>`;
  render();
}

function render() {
  output.textContent = state[state.tab] || "";
}

document.querySelector("#geo-generate").addEventListener("click", generate);
document.querySelector("#geo-copy").addEventListener("click", async () => {
  await navigator.clipboard.writeText(state.llms);
});

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
    button.classList.add("active");
    state.tab = button.dataset.tab;
    render();
  });
});

generate();
