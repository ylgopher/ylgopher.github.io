import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const thisFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(thisFile), "..");
const utf8Bom = "\uFEFF";

export async function buildIndex(options = {}) {
  const docsDir = options.docsDir || path.join(projectRoot, "src/content/docs");
  const siteName = options.siteName || "GoAgent Lab文档中心";
  const siteUrl = normalizeSiteUrl(options.siteUrl || process.env.SITE_URL || "http://localhost:4321");
  const docsBasePath = normalizeBasePath(options.docsBasePath || process.env.DOCS_BASE_PATH || "/");
  const files = await listDocFiles(docsDir);

  const documents = [];
  for (const file of files) {
    const raw = await readFile(path.join(docsDir, file), "utf8");
    const doc = readDoc(file, raw, siteUrl, docsBasePath);
    if (!doc.draft) {
      documents.push(doc);
    }
  }

  documents.sort((a, b) => {
    if (a.source === "index.md" || a.source === "index.mdx") return -1;
    if (b.source === "index.md" || b.source === "index.mdx") return 1;
    return a.source.localeCompare(b.source);
  });

  return {
    site: {
      name: siteName,
      url: siteUrl,
      docsBasePath,
    },
    generatedAt: new Date().toISOString(),
    documents,
  };
}

export function buildLlmsText(input) {
  const siteName = input.siteName || input.site?.name || "GoAgent Lab文档中心";
  const siteUrl = input.siteUrl || input.site?.url || "";
  const documents = input.documents || [];
  const lines = [
    `# ${siteName}`,
    "",
    "> GoAgent Lab文档中心是一个 Go Agent 学习项目，记录构建过程、架构复盘和改进建议，适合阅读和 LLM 抓取索引。",
    "",
  ];

  if (siteUrl) {
    lines.push(`Base URL: ${siteUrl}`, "");
  }

  lines.push("## Documents", "");

  for (const doc of documents) {
    const desc = doc.description ? `: ${doc.description}` : "";
    lines.push(`- [${doc.title}](${doc.url})${desc}`);
    if (doc.llmUrl) {
      lines.push(`  LLM text: ${doc.llmUrl}`);
    }
    lines.push(`  Source: ${doc.source}`);
  }

  return `${utf8Bom}${lines.join("\n")}\n`;
}

export function buildLlmsFullText(input) {
  const siteName = input.siteName || input.site?.name || "GoAgent Lab文档中心";
  const siteUrl = input.siteUrl || input.site?.url || "";
  const documents = input.documents || [];
  const lines = [
    `# ${siteName} - Full LLM Content`,
    "",
    "> 这个文件汇总所有 Markdown/MDX 文档正文，供 Agent 或 LLM 直接阅读。",
    "",
  ];

  if (siteUrl) {
    lines.push(`Base URL: ${siteUrl}`, "");
  }

  for (const doc of documents) {
    lines.push("---", "");
    lines.push(`## ${doc.title}`, "");
    if (doc.description) {
      lines.push(`Description: ${doc.description}`);
    }
    lines.push(`URL: ${doc.url}`);
    if (doc.llmUrl) {
      lines.push(`LLM text: ${doc.llmUrl}`);
    }
    lines.push(`Source: ${doc.source}`, "");
    lines.push(doc.content || "");
    lines.push("");
  }

  return `${utf8Bom}${lines.join("\n").replace(/\n{4,}/g, "\n\n\n")}\n`;
}

export function buildDocLlmsText(doc) {
  const lines = [
    `# ${doc.title}`,
    "",
  ];

  if (doc.description) {
    lines.push(`Description: ${doc.description}`);
  }
  lines.push(`URL: ${doc.url}`);
  lines.push(`Source: ${doc.source}`, "");
  lines.push(doc.content || "");

  return `${utf8Bom}${lines.join("\n").replace(/\n{4,}/g, "\n\n\n")}\n`;
}

async function main() {
  const index = await buildIndex();
  const outDir = path.join(projectRoot, "public");
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "docs-index.json"), `${JSON.stringify(index, null, 2)}\n`);
  await writeFile(
    path.join(outDir, "llms.txt"),
    buildLlmsText({
      siteName: index.site.name,
      siteUrl: index.site.url,
      documents: index.documents,
    }),
  );
  await writeFile(
    path.join(outDir, "llms-full.txt"),
    buildLlmsFullText({
      siteName: index.site.name,
      siteUrl: index.site.url,
      documents: index.documents,
    }),
  );
  for (const doc of index.documents) {
    const outFile = path.join(outDir, doc.llmPath);
    await mkdir(path.dirname(outFile), { recursive: true });
    await writeFile(outFile, buildDocLlmsText(doc));
  }
}

async function listDocFiles(root) {
  const result = [];
  await walk(root, "");
  return result;

  async function walk(dir, prefix) {
    const items = await readdir(dir, { withFileTypes: true });
    for (const item of items) {
      const rel = path.posix.join(prefix, item.name);
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        await walk(full, rel);
        continue;
      }
      if (/\.(md|mdx)$/i.test(item.name)) {
        result.push(rel);
      }
    }
  }
}

function readDoc(source, raw, siteUrl, docsBasePath) {
  const { meta, body } = readFrontmatter(raw);
  const llmPath = docTextPath(source);
  return {
    title: meta.title || firstHeading(body) || titleFromSource(source),
    description: meta.description || "",
    url: docUrl(siteUrl, docsBasePath, source),
    llmUrl: docTextUrl(siteUrl, docsBasePath, source),
    llmPath,
    source,
    content: cleanDocBody(body),
    draft: meta.draft === "true",
  };
}

function cleanDocBody(body) {
  return body
    .split(/\r?\n/)
    .filter((line) => !/^\s*import\s+/.test(line))
    .map((line) => line.replace(/<\/?[A-Z][^>]*>/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function readFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return { meta: {}, body: raw };
  }

  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const sep = line.indexOf(":");
    if (sep < 0) {
      continue;
    }
    const key = line.slice(0, sep).trim();
    const value = line.slice(sep + 1).trim();
    meta[key] = stripQuote(value);
  }

  return {
    meta,
    body: raw.slice(match[0].length),
  };
}

function firstHeading(body) {
  const match = body.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "";
}

function titleFromSource(source) {
  const name = path.basename(source, path.extname(source));
  return name
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function docUrl(siteUrl, docsBasePath, source) {
  let slug = source.replace(/\.(md|mdx)$/i, "");
  if (slug === "index") {
    slug = "";
  }
  if (slug.endsWith("/index")) {
    slug = slug.slice(0, -"/index".length);
  }

  const docPath = [docsBasePath, slug].filter(Boolean).join("/");
  const cleaned = docPath.replace(/\/+/g, "/");
  return `${siteUrl}${withLeadingSlash(withTrailingSlash(cleaned))}`;
}

function docTextUrl(siteUrl, docsBasePath, source) {
  const textPath = [docsBasePath, docTextPath(source)].filter(Boolean).join("/");
  const cleaned = textPath.replace(/\/+/g, "/");
  return `${siteUrl}${withLeadingSlash(cleaned)}`;
}

function docTextPath(source) {
  let slug = source.replace(/\.(md|mdx)$/i, "");
  if (slug === "index") {
    slug = "index";
  }
  if (slug.endsWith("/index")) {
    slug = slug.slice(0, -"/index".length);
  }
  return `${slug}.txt`;
}

function normalizeSiteUrl(siteUrl) {
  return siteUrl.replace(/\/+$/, "");
}

function normalizeBasePath(basePath) {
  if (!basePath || basePath === "/") {
    return "";
  }
  return withLeadingSlash(basePath).replace(/\/+$/, "");
}

function withLeadingSlash(value) {
  return value.startsWith("/") ? value : `/${value}`;
}

function withTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

function stripQuote(value) {
  return value.replace(/^["']|["']$/g, "");
}

if (process.argv[1] && path.resolve(process.argv[1]) === thisFile) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
