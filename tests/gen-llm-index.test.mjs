import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { buildDocLlmsText, buildIndex, buildLlmsFullText, buildLlmsText } from "../scripts/gen-llm-index.mjs";

test("buildIndex reads docs metadata and creates stable document urls", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "docs-center-"));
  const docsDir = path.join(root, "src/content/docs");
  await mkdir(path.join(docsDir, "guide"), { recursive: true });
  await mkdir(path.join(docsDir, "api"), { recursive: true });

  await writeFile(
    path.join(docsDir, "index.md"),
    [
      "---",
      "title: 文档中心",
      "description: 面向用户和 LLM 的开发文档入口",
      "---",
      "",
      "# 文档中心",
    ].join("\n"),
  );
  await writeFile(
    path.join(docsDir, "guide/quick-start.md"),
    [
      "---",
      "title: 快速开始",
      "description: 本地启动和调用方式",
      "---",
      "",
      "# 快速开始",
    ].join("\n"),
  );
  await writeFile(
    path.join(docsDir, "api/platform.mdx"),
    [
      "---",
      "title: Platform API",
      "---",
      "",
      "# Platform API",
    ].join("\n"),
  );

  const index = await buildIndex({
    docsDir,
    siteUrl: "https://docs.example.com",
    docsBasePath: "/docs",
  });

  assert.deepEqual(
    index.documents.map((doc) => ({
      title: doc.title,
      description: doc.description,
      url: doc.url,
      llmUrl: doc.llmUrl,
      source: doc.source,
    })),
    [
      {
        title: "文档中心",
        description: "面向用户和 LLM 的开发文档入口",
        url: "https://docs.example.com/docs/",
        llmUrl: "https://docs.example.com/docs/index.txt",
        source: "index.md",
      },
      {
        title: "Platform API",
        description: "",
        url: "https://docs.example.com/docs/api/platform/",
        llmUrl: "https://docs.example.com/docs/api/platform.txt",
        source: "api/platform.mdx",
      },
      {
        title: "快速开始",
        description: "本地启动和调用方式",
        url: "https://docs.example.com/docs/guide/quick-start/",
        llmUrl: "https://docs.example.com/docs/guide/quick-start.txt",
        source: "guide/quick-start.md",
      },
    ],
  );
});

test("buildLlmsText exposes a concise LLM navigation entry", () => {
  const text = buildLlmsText({
    siteName: "Agent Backend Docs",
    siteUrl: "https://docs.example.com",
    documents: [
      {
        title: "快速开始",
        description: "本地启动和调用方式",
        url: "https://docs.example.com/docs/guide/quick-start/",
        llmUrl: "https://docs.example.com/docs/guide/quick-start.txt",
        source: "guide/quick-start.md",
      },
    ],
  });

  assert.ok(text.startsWith("\uFEFF# Agent Backend Docs"));
  assert.match(text, /- \[快速开始\]\(https:\/\/docs\.example\.com\/docs\/guide\/quick-start\/\): 本地启动和调用方式/);
  assert.match(text, /LLM text: https:\/\/docs\.example\.com\/docs\/guide\/quick-start\.txt/);
  assert.match(text, /Source: guide\/quick-start\.md/);
});

test("default LLM index branding uses GoAgent Lab文档中心", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "docs-center-"));
  const docsDir = path.join(root, "src/content/docs");
  await mkdir(docsDir, { recursive: true });
  await writeFile(
    path.join(docsDir, "index.md"),
    [
      "---",
      "title: GoAgent Lab文档中心",
      "description: 记录 Go Agent 练手项目的构建过程和复盘。",
      "---",
      "",
      "# GoAgent Lab文档中心",
    ].join("\n"),
  );

  const index = await buildIndex({
    docsDir,
    siteUrl: "https://docs.example.com",
  });
  const text = buildLlmsText(index);

  assert.equal(index.site.name, "GoAgent Lab文档中心");
  assert.ok(text.startsWith("\uFEFF# GoAgent Lab文档中心"));
  assert.match(text, /Go Agent 学习项目/);
  assert.doesNotMatch(text, /Agent Backend 文档中心/);
});

test("buildLlmsFullText exposes all markdown content for agents", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "docs-center-"));
  const docsDir = path.join(root, "src/content/docs");
  await mkdir(path.join(docsDir, "services"), { recursive: true });

  await writeFile(
    path.join(docsDir, "index.mdx"),
    [
      "---",
      "title: GoAgent Lab文档中心",
      "description: 首页描述",
      "---",
      "",
      "import { Card } from '@astrojs/starlight/components';",
      "",
      "# 首页",
      "",
      "<Card title=\"学习记录\">",
      "记录 Go Agent 的学习过程。",
      "</Card>",
    ].join("\n"),
  );
  await writeFile(
    path.join(docsDir, "services/platform-service.md"),
    [
      "---",
      "title: Platform Service",
      "description: 平台服务说明",
      "---",
      "",
      "# Platform Service",
      "",
      "`platform-service` 负责用户、租户和工作空间。",
      "",
      "```bash",
      "make run",
      "```",
    ].join("\n"),
  );

  const index = await buildIndex({
    docsDir,
    siteUrl: "https://docs.example.com",
  });
  const fullText = buildLlmsFullText(index);
  const docText = buildDocLlmsText(index.documents.find((doc) => doc.source === "services/platform-service.md"));

  assert.match(fullText, /^﻿# GoAgent Lab文档中心 - Full LLM Content/);
  assert.match(fullText, /Source: services\/platform-service\.md/);
  assert.match(fullText, /LLM text: https:\/\/docs\.example\.com\/services\/platform-service\.txt/);
  assert.match(fullText, /`platform-service` 负责用户、租户和工作空间。/);
  assert.match(fullText, /```bash\nmake run\n```/);
  assert.doesNotMatch(fullText, /title: Platform Service/);
  assert.doesNotMatch(fullText, /import \{ Card \}/);
  assert.match(docText, /^﻿# Platform Service/);
  assert.match(docText, /URL: https:\/\/docs\.example\.com\/services\/platform-service\//);
  assert.match(docText, /Source: services\/platform-service\.md/);
  assert.match(docText, /`platform-service` 负责用户、租户和工作空间。/);
});
