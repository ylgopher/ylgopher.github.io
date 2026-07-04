---
title: 快速开始
description: 本地启动文档中心并查看生成的 LLM 索引。
---

# 快速开始

进入文档中心目录：

```bash
cd /Users/chenyinglin/agent-backend/docs-center
```

安装依赖：

```bash
npm install
```

启动开发服务：

```bash
npm run dev
```

构建静态站点：

```bash
npm run build
```

生成给 LLM 使用的索引：

```bash
npm run gen:index
```

生成文件位于：

- `public/llms.txt`
- `public/llms-full.txt`
- `public/docs-index.json`
- `public/services/platform-service.txt` 等单篇文档纯文本文件
