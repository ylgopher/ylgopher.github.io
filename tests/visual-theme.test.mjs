import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");

test("dark theme uses graphite glass tokens instead of near-black surfaces", async () => {
  const css = await readFile(path.join(root, "src/styles/custom.css"), "utf8");

  assert.doesNotMatch(css, /#0f1117|rgba\(15,\s*17,\s*23/);
  assert.match(css, /--docs-bg:\s*#1b1b1f/);
  assert.match(css, /--docs-surface-strong:/);
  assert.match(css, /--docs-line:/);
  assert.match(css, /--docs-primary:\s*#a8b1ff/);
  assert.match(css, /--docs-primary-soft:\s*#eef0ff/);
  assert.doesNotMatch(css, /#f59e0b|#fbbf24|#f6d28b/i);
});

test("site branding uses GoAgent Lab文档中心", async () => {
  const [config, home, readme] = await Promise.all([
    readFile(path.join(root, "astro.config.mjs"), "utf8"),
    readFile(path.join(root, "src/content/docs/index.mdx"), "utf8"),
    readFile(path.join(root, "README.md"), "utf8"),
  ]);

  assert.match(config, /title:\s*"GoAgent Lab文档中心"/);
  assert.match(home, /title:\s*GoAgent Lab文档中心/);
  assert.match(home, /hero:\s*[\s\S]*title:\s*GoAgent Lab文档中心/);
  assert.match(home, /基于 Go 的 Agent 学习项目/);
  assert.match(readme, /GoAgent Lab文档中心/);
  assert.doesNotMatch(config, /title:\s*"GOAgent Lab文档中心"/);
  assert.doesNotMatch(home, /title:\s*GOAgent Lab文档中心/);
  assert.doesNotMatch(config, /Agent Backend 文档中心/);
  assert.doesNotMatch(home, /Agent Backend 文档中心/);
});

test("top navigation reads as a refined document toolbar", async () => {
  const css = await readFile(path.join(root, "src/styles/custom.css"), "utf8");

  assert.match(css, /\.page > \.header\s*{[^}]*min-height:\s*4rem/s);
  assert.match(css, /\.page > \.header > \.header\s*{[^}]*padding-inline:\s*clamp\(1rem,\s*2vw,\s*2rem\)/s);
  assert.doesNotMatch(css, /\n\.header\s*{/);
  assert.match(css, /\.title-wrapper\s*{[^}]*border-radius:\s*10px/s);
  assert.match(css, /\.site-title\s*{[^}]*background:\s*linear-gradient/s);
  assert.match(css, /:root\[data-theme="light"\] \.site-title\s*{[^}]*background:\s*none/s);
  assert.match(css, /:root\[data-theme="light"\] \.site-title\s*{[^}]*color:\s*#3f4fd8/s);
  assert.match(css, /site-search button\s*{[^}]*border-radius:\s*10px/s);
  assert.match(css, /site-search button\s*{[^}]*box-shadow:\s*0 8px 24px/s);
  assert.match(css, /starlight-theme-select label\s*{[^}]*border:\s*1px solid var\(--docs-line\)/s);
  assert.match(css, /starlight-theme-select label\s*{[^}]*border-radius:\s*10px/s);
  assert.match(css, /starlight-theme-select label\s*{[^}]*height:\s*2\.35rem/s);
  assert.match(css, /starlight-theme-select label\s*{[^}]*min-width:\s*7rem/s);
  assert.match(css, /starlight-theme-select label\s*{[^}]*display:\s*inline-flex/s);
  assert.match(css, /starlight-theme-select label\s*{[^}]*align-items:\s*center/s);
  assert.match(css, /starlight-theme-select select\s*{[^}]*appearance:\s*none/s);
  assert.match(css, /starlight-theme-select select\s*{[^}]*width:\s*4\.5rem/s);
  assert.match(css, /starlight-theme-select select\s*{[^}]*min-width:\s*4\.5rem/s);
  assert.match(css, /starlight-theme-select \.caret\s*{[^}]*margin-inline-start:\s*0/s);
  assert.match(css, /:root\[data-theme="light"\] starlight-theme-select label\s*{[^}]*color:\s*#1f2937/s);
  assert.doesNotMatch(css, /starlight-theme-select label\s*{[^}]*#2563eb/s);
});

test("hero illustration uses dark-compatible glass artwork", async () => {
  const svg = await readFile(path.join(root, "src/assets/docs-hud.svg"), "utf8");

  assert.match(svg, /id="glassFrame"/);
  assert.match(svg, /id="terminalGlow"/);
  assert.doesNotMatch(svg, /fill="#FFFFFF"|stop-color="#FFFFFF"/);
  assert.doesNotMatch(svg, /#F59E0B|#FBBF24|#F6D28B/i);
});

test("markdown code blocks adapt to dark and light reading frames", async () => {
  const [css, config] = await Promise.all([
    readFile(path.join(root, "src/styles/custom.css"), "utf8"),
    readFile(path.join(root, "astro.config.mjs"), "utf8"),
  ]);

  assert.match(css, /--docs-code-bg:\s*#222833/);
  assert.match(css, /:root\[data-theme="light"\]\s*{[^}]*--docs-code-bg:\s*#f6f6f7/s);
  assert.match(css, /--docs-code-line:\s*transparent/);
  assert.match(css, /\.sl-markdown-content h2\s*{[^}]*border-bottom:\s*1px solid var\(--docs-line\)/s);
  assert.match(css, /\.expressive-code \.frame\s*{[^}]*border:\s*0/s);
  assert.match(css, /\.expressive-code \.frame\s*{[^}]*border-radius:\s*4px/s);
  assert.match(css, /\.expressive-code pre\s*{[^}]*padding:\s*1\.25rem 1\.5rem/s);
  assert.match(css, /\.expressive-code pre\s*{[^}]*overflow-x:\s*auto/s);
  assert.match(css, /\.expressive-code pre\[data-language\]::before/);
  assert.match(css, /\.expressive-code \.copy\s*{[^}]*display:\s*none/s);
  assert.match(css, /\.expressive-code code\s*{[^}]*color:\s*#d6deeb/s);
  assert.match(css, /\.expressive-code \.code span\[style\*="--0:"\]\s*{[^}]*color:\s*var\(--0\) !important/s);
  assert.match(css, /:root\[data-theme="light"\] \.expressive-code code\s*{[^}]*color:\s*#403f53/s);
  assert.match(css, /:root\[data-theme="light"\] \.expressive-code \.code span\[style\*="--1:"\]\s*{[^}]*color:\s*var\(--1\) !important/s);
  assert.match(config, /borderRadius:\s*"4px"/);
  assert.match(config, /borderWidth:\s*"0px"/);
  assert.match(config, /codeBackground:\s*"#222833"/);
  assert.match(config, /codePadding:\s*"1\.25rem 1\.5rem"/);
});

test("desktop table of contents can collapse and resize", async () => {
  const [css, config, script] = await Promise.all([
    readFile(path.join(root, "src/styles/custom.css"), "utf8"),
    readFile(path.join(root, "astro.config.mjs"), "utf8"),
    readFile(path.join(root, "public/toc-controls.js"), "utf8"),
  ]);

  assert.match(config, /head:\s*\[/);
  assert.match(config, /toc-controls\.js/);
  assert.match(config, /defer:\s*true/);
  assert.match(css, /--docs-toc-width:\s*17\.5rem/);
  assert.match(css, /\.docs-toc-toggle/);
  assert.match(css, /\.docs-toc-resizer/);
  assert.match(css, /data-docs-toc="collapsed"/);
  assert.match(css, /\.right-sidebar-container\s*{[^}]*width:\s*var\(--docs-toc-width\)/s);
  assert.match(script, /docs-center:toc-state/);
  assert.match(script, /docs-center:toc-width/);
  assert.match(script, /data-docs-toc/);
  assert.match(script, /pointerdown/);
  assert.match(script, /aria-expanded/);
  assert.match(script, /--docs-toc-width/);
});

test("markdown pages expose a per-page LLM text entry", async () => {
  const [config, css, script] = await Promise.all([
    readFile(path.join(root, "astro.config.mjs"), "utf8"),
    readFile(path.join(root, "src/styles/custom.css"), "utf8"),
    readFile(path.join(root, "public/llm-entry.js"), "utf8"),
  ]);

  assert.match(config, /llm-entry\.js/);
  assert.match(config, /data-docs-base/);
  assert.match(script, /docs-llm-entry/);
  assert.match(script, /LLM 纯文本/);
  assert.match(script, /pagePath === "\/"/);
  assert.doesNotMatch(script, /index\.txt/);
  assert.match(script, /\.txt/);
  assert.match(script, /sl-markdown-content/);
  assert.match(css, /\.docs-llm-entry\s*{[^}]*border:\s*0/s);
  assert.match(css, /\.docs-llm-entry\s*{[^}]*background:\s*transparent/s);
  assert.match(css, /\.docs-llm-entry\s*{[^}]*padding:\s*0/s);
  assert.match(css, /\.docs-llm-link\s*{[^}]*background:\s*transparent/s);
  assert.match(css, /\.docs-llm-link\s*{[^}]*color:\s*var\(--docs-primary\)/s);
  assert.doesNotMatch(css, /\.docs-llm-link\s*{[^}]*color:\s*#15151a/s);
});

test("new markdown docs are picked up by sidebar and dev index generation", async () => {
  const [config, pkg] = await Promise.all([
    readFile(path.join(root, "astro.config.mjs"), "utf8"),
    readFile(path.join(root, "package.json"), "utf8"),
  ]);

  assert.match(config, /autogenerate:\s*{\s*directory:\s*"guide"\s*}/s);
  assert.match(config, /autogenerate:\s*{\s*directory:\s*"services"\s*}/s);
  assert.match(config, /autogenerate:\s*{\s*directory:\s*"contracts"\s*}/s);
  assert.doesNotMatch(config, /slug:\s*"services\/gateway-api"/);
  assert.doesNotMatch(config, /slug:\s*"services\/platform-service"/);

  const scripts = JSON.parse(pkg).scripts;
  assert.equal(scripts.predev, "npm run gen:index");
});
