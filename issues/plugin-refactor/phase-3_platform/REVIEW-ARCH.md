# Phase-3 接缝设计评审 — 架构合理性/演进性视角（2026-06-11）

> 评审对象：SEAM-DESIGN v1。裁决采纳情况见 SEAM-DESIGN v2【裁决记录】。

## 裁决表

| # | 裁决 |
|---|---|
| Q1 | D-A 采纳、D-C 否决（Host 需暴露 upstream/token/billing/setting/ratelimit ≥5 项重型能力，耦合倒置）；TokenRefreshService 不收编（分发粒度是"账号"非"平台"，CanRefresh 多态已完善，GetTokenRefresher 进 Provider 违背单一职责） |
| Q2 | v1 接口仅 Platform()+Forward()。FallbackModel 全仓单消费点（antigravity_gateway_service.go:2258，且是 service 调自己依赖）；DefaultModels 消费点需要完整结构体且不经 registry 路径（gemini_v1beta_handler 4 处直调包函数）；InvalidateToken 的消费者是账号管理/限速路径，admin handler 不应依赖 gateway 层 registry——三者均不进接口，switch 用数据驱动 map 另行消灭 |
| Q3 | ForwardRequest 必须补 SessionGroupID/SessionKey（WithForwardGeminiSession 两字段）；action="generateContent" hardcode+测试锁定；**OpenAI 不经过 :444/:794（独立 handler），OpenAIForwardResult 适配是 Batch-2 阶段的虚假问题**——OpenAI 留原路径，Phase-4 再统一 |
| Q4 | 永久留核心：粘性 key 格式（Redis 键策略，影响存量会话 TTL 接续）、antigravity 退避（调度决策，Phase-0 不变量覆盖区）、beta policy（Forward 内部 Anthropic 专属）、endpoint 映射（多 handler 共享纯函数，OpenAI subpath 依赖 rawRequestPath 无法平台常量化）、BetaBlockedError/PromptTooLong 类型断言链（adapter 不得包裹） |
| Q5 | 从 ROADMAP 摘除"Phase-3 单独提案"表述，但**不宣布伪需求**——改为可观测触发条件："gateway.hook.* 首个真实模块进入 modules/standard 插装清单时重新提案"（两次推迟原因不同：Phase-2 是零成员命名空间、Phase-3 是依赖未收敛，均正确） |

## 附加意见

ForwardRequest 分层建议：Parsed（Anthropic/Antigravity 路径）与 session 字段并存；GeminiAction 不进字段（adapter 内 hardcode）；adapter 按 Platform() 决定底层调用与字段提取，不泄漏到接口定义。
