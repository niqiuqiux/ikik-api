# Phase-2 接缝设计评审 — 回归风险/等价性/YAGNI 视角（2026-06-11）

> 评审对象：SEAM-DESIGN.md v1。本报告的第四方案与 H-C 被最终裁决采纳（见 SEAM-DESIGN.md v2）。

## 结论

方向正确，但有一个事实硬伤（调用点 10 个非 8 个，含 2 个 WS 路径，Decision 抽象无法表达 WS 关闭码/帧）+ 一个铁律硬冲突（命名空间收集需给冻结的 Runtime 加实例访问 API——`moduleRecord.instance` 私有、Snapshot 只回元数据）。

## 风险清单（核对真实代码后）

**moderation 链替换：**
- A1 WS 两点（:1251 首帧 / :1426 turn 内每消息）走 writeContentModerationWSError + 关闭帧，必须排除；turn-2 close-error 路径无测试需补；
- A2 gemini `googleError(c, status, message)` 两参签名不消费 errType，输出 `{code:int, status:string}` 三字段——统一格式化会污染 gemini 格式；
- A3 顶层 `type:"error"` 包裹差异：gateway_handler.errorResponse 有 / chatCompletions 无 / responses 用 `code` 字段——共 5 种 HTTP 格式 + 1 WS（格式函数：gateway_handler.go:1698、gateway_handler_chat_completions.go:333、gateway_handler_responses.go:312、gemini_v1beta_handler.go:663、openai_gateway_handler.go:934,1920）；
- A4 入参 5 种表达式（images 用 parsed.ModerationBody()、WS 用 payload）——链不得统一取 body；
- A5 protocol 常量真实值 `openai_chat_completions`（content_moderation.go:51-55）≠ 设计写的 `openai_chat`——必须复用现有常量；
- A6 fail-open 在 helper:60-66（Check 返回 err 即放行）——链层默认策略必须写死为 fail-open。

**factory 改造：**
- B1 `_validate_` 路径（payment_config_providers.go:27）依赖构造器 ApplicationError 原样透传做前端 i18n——查找层不得包裹错误；
- B2 unknown-key 文案（factory.go:22）保持逐字节一致；
- B3 RefreshProviders（Clear+重载）要求查找路径无包级可变状态副作用。

## YAGNI 审查

- 【砍】P-A 整体：无生命周期工厂进模块系统需三条契约例外，是为模式而模式。**第四方案**：payment 包私有 `map[string]ConstructorFunc` + provider init() 自注册，零内核耦合达成"消灭 switch"；
- 【砍】命名空间收集：为零成员命名空间写收集代码 + 解冻内核 API，违 YAGNI——采纳 H-C，Phase-3 有真实模块钩子时与 Runtime 实例访问 API 合并设计；
- 【必补】链层 panic recover（抽象成接口遍历后，单钩子 panic 会炸整条请求）；
- 【必补】`gateway_check_start/done` 11 字段结构化日志等价（运维依赖）；
- 【必补】fail-open 默认策略入契约。

## 评审请求裁决表

| # | 裁决 |
|---|---|
| Q1 | P：双否决，采纳第四方案（payment 私有注册表）；H：采纳 H-C |
| Q2 | 不接受；改用私有注册表则问题不存在 |
| Q3 | 不成立（第四方案下无此概念；死字段徒增认知负担） |
| Q4 | Request 不充分（WS 维度、入参非单一）；GinCtx 过宽改只读访问器 |
| Q5 | 必须先补，按格式类去重：5~6 条 HTTP block 特征化 + WS turn-2 close-error 1 条，约半天成本 |
