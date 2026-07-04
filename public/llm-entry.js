(() => {
  const script = document.currentScript;
  const base = normalizeBase(script?.dataset.docsBase || "/");

  function normalizeBase(value) {
    if (!value || value === "/") return "";
    return `/${value}`.replace(/\/+/g, "/").replace(/\/$/, "");
  }

  function textPathForPage(pathname) {
    if (pathname.endsWith(".txt")) return "";
    if (base && !pathname.startsWith(`${base}/`) && pathname !== base) return "";

    const pagePath = base ? pathname.slice(base.length) || "/" : pathname;
    if (pagePath === "/") return "";

    const cleanPath = pagePath.replace(/\/+$/, "");
    return `${base}${cleanPath}.txt` || `${cleanPath}.txt`;
  }

  function createEntry(href) {
    const entry = document.createElement("aside");
    entry.className = "docs-llm-entry";
    entry.innerHTML = [
      '<span class="docs-llm-kicker">Agent 阅读：</span>',
      `<a class="docs-llm-link" href="${href}">LLM 纯文本</a>`,
    ].join("");
    return entry;
  }

  function init() {
    const content = document.querySelector(".sl-markdown-content");
    if (!content || content.querySelector(".docs-llm-entry")) return;

    const href = textPathForPage(window.location.pathname);
    if (!href) return;

    content.prepend(createEntry(href));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
