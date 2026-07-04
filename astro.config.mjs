import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

const site = process.env.SITE_URL || "http://localhost:4321";
const base = process.env.DOCS_BASE_PATH || "/";
const assetBase = base.endsWith("/") ? base : `${base}/`;

export default defineConfig({
  site,
  base,
  integrations: [
    starlight({
      title: "GoAgent Lab文档中心",
      description: "记录一个基于 Go 的 Agent 学习项目，沉淀开发过程、架构复盘和改进建议。",
      defaultLocale: "root",
      locales: {
        root: {
          label: "简体中文",
          lang: "zh-CN",
        },
      },
      customCss: ["./src/styles/custom.css"],
      head: [
        {
          tag: "script",
          attrs: {
            src: `${assetBase}toc-controls.js`,
            defer: true,
          },
        },
        {
          tag: "script",
          attrs: {
            src: `${assetBase}llm-entry.js`,
            "data-docs-base": base,
            defer: true,
          },
        },
      ],
      expressiveCode: {
        themes: ["github-dark", "github-light"],
        styleOverrides: {
          borderRadius: "4px",
          borderWidth: "0px",
          borderColor: "transparent",
          codeBackground: "#222833",
          codeFontFml: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          codeFontSize: "0.95rem",
          codeLineHeight: "1.5",
          codePadding: "1.25rem 1.5rem",
          uiFontFml: "var(--sl-font)",
          frames: {
            editorActiveTabBackground: "#222833",
            editorTabBarBackground: "#222833",
            terminalBackground: "#222833",
            terminalTitlebarBackground: "#222833",
            tooltipSuccessBackground: "#059669",
          },
        },
      },
      sidebar: [
        {
          label: "开始",
          items: [
            { label: "实验室首页", slug: "index" },
            { autogenerate: { directory: "guide" } },
          ],
        },
        {
          label: "服务文档",
          items: [{ autogenerate: { directory: "services" } }],
        },
        {
          label: "契约",
          items: [{ autogenerate: { directory: "contracts" } }],
        },
      ],
    }),
  ],
});
