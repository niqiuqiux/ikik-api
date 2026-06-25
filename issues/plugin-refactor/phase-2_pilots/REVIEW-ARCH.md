# Phase-2 接缝设计评审 — 架构合理性/Caddy 对齐/演进性视角（2026-06-11）

> 评审对象：SEAM-DESIGN.md v1。裁决采纳情况见 SEAM-DESIGN.md v2【裁决记录】。

## 结论

- 接缝 P：P-A 方向可行但"能力模块不经 Runtime"契约**破坏内核语义**（必须改）——绕过 Runtime 自行 New 导致 Snapshot/admin 可观测失效、Stop 失管；Caddy 的 ctx.LoadModule 合法是因为 Caddy 无集中 Runtime，本内核语义不同。修正案：模块经 Runtime Build，factory 查询已 Build 实例，需内核补 `BuiltModulesInNamespace` 只读 API（单独提案）。
- 接缝 H：H-A 总体可行，三处必须改：①钩子包必须独立（internal/gatewayhook，否则模块 import handler 层）；②GinCtx 暴露是安全边界漏洞（钩子可 c.Set 覆盖认证、抢写响应），改只读访问器；③**事实遗漏：调用点 12 个非 8 个**，其中 2 个 WebSocket 路径（openai_gateway_handler.go:1251/:1426）是每消息语义 + WS 帧格式，必须排除在链改造外。

## 其他意见

- Subject → CallerInfo 最小视图（建议改，解耦 middleware 包）；
- Chain 的 fail-open 必须返回 (nil,nil) 而非 (nil,err)，保持"nil=放行"简单语义；
- "核心钩子（Wire）+ 插件钩子（Runtime 收集）"双轨模式认可；
- EnabledByDefault=true 迁移例外：有条件成立（须 ROADMAP 登记规则 + 双开关语义文档化）；
- Phase-3 先例效应：P-A 绕过 Runtime / GinCtx 暴露 / Subject 耦合三个错误若带入平台 Provider 阶段会被放大，必须在 Phase-2 纠正。

## 评审请求裁决表

| # | 裁决 |
|---|---|
| Q1 | P-A 修正后可行（经 Runtime）；P-B 否决；H-A 修正后可行；H-B 否决；H-C 不推荐（收集机制是 Phase-3 前置模式，值得现在验证） |
| Q2 | "不经 Runtime"否决；正确表述：经 Runtime Build + factory 查已 Build 实例 |
| Q3 | 成立，附条件（ROADMAP 规则化 + 双开关文档化） |
| Q4 | Decision 最小充分；GinCtx 必须改；Subject 建议改；WS 边界必须补充 |
| Q5 | 必须先补特征化测试（≥3 种 HTTP 格式），WS 排除 |

> 注：Q1/Q2 中"修正 P-A 经 Runtime"与"H-A 含收集"两项被最终裁决否决，采纳风险评审的更简方案（payment 私有注册表 + H-C），理由见 SEAM-DESIGN v2 裁决记录；本报告其余意见全部采纳。
