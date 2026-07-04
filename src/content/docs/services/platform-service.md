---
title: Platform Service
description: 平台内部服务的职责边界和常见本地调用入口。
---

# Platform Service

`platform-service` 是平台域的内部 Kitex 服务，承担租户、用户、成员、工作空间和中台账号相关能力。

## 服务职责

- 管理租户与工作空间。
- 管理平台用户、租户成员和中台账号。
- 提供内部 RPC 接口给网关或测试客户端调用。

## 本地调试

可以配合 `platform-client-test` 调用本地 RPC：

```bash
cd /Users/chenyinglin/agent-backend/platform-client-test
go run ./cmd/platform-client -action describe
```

具体 action 以 `platform-client-test/README.md` 为准。
