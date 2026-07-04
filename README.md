# GoAgent Lab文档中心

`GoAgent Lab文档中心` 是一个基于 Go 的 Agent 学习项目文档站，基于 Astro 和 Starlight 构建，用来记录开发过程、架构复盘和改进建议。

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

构建前会生成：

- `public/llms.txt`：简洁导航索引，适合先给 Agent 发现文档入口。
- `public/llms-full.txt`：汇总所有 Markdown/MDX 正文，适合一次性输入给 LLM 阅读。
- `public/docs-index.json`：结构化索引，适合工具程序读取。
- `public/**/*.txt`：每篇文档对应的纯文本版本，例如 `public/services/platform-service.txt`。

## 文档位置

Markdown 文档放在 `src/content/docs` 下，路径会映射为站点路由。
