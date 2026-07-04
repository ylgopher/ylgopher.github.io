---
title: RPC 契约
description: agent-contracts 中 Thrift IDL 和服务注册表的说明。
---

# RPC 契约

`agent-contracts` 统一维护跨服务契约，包括 Thrift IDL、生成代码和服务注册表。

## 目录

- `idl/common`：公共请求元信息、响应元信息和错误结构。
- `idl/platform`：`platform-service` 的 RPC 契约。
- `registry/services.yaml`：服务、方法、请求类型和响应类型注册表。

## 生成代码

```bash
cd /Users/chenyinglin/agent-backend/agent-contracts
make gen
```

业务服务可以按需引用或重新生成自己的 Kitex 代码。
