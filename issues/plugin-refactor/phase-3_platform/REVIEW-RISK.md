# Phase-3 接缝设计评审 — 回归风险/等价性/YAGNI 视角（2026-06-11）

> 评审对象：SEAM-DESIGN v1。本报告与架构评审共同纠正三处事实硬伤；裁决见 SEAM-DESIGN v2。

## 三处事实硬伤（必须改）

1. OpenAI 不流经 :444/:794（独立 OpenAIGatewayHandler + OpenAIRecordUsage 管线）——设计把"OpenAI 结果适配"挂错位置；
2. :794 真实条件 `antigravity && Type != APIKey`，非"OAuth vs APIKey"；
3. Batch-1 六点多已集中化：InvalidateToken 单处 composite（8 消费点统一）、GetFallbackModel 单消费点且各平台默认值不同、DefaultModels 异构结构体（[]string 丢字段改变 /v1/models 与 admin 响应）。

## 关键风险（节选）

- **R-2.1（高）统一返回类型必丢载荷计费字段**：BillingModel 直接决定计费模型（openai_gateway_service.go:5789）、ServiceTier 驱动倍率（:2681）、ResponseID 会话绑定（openai_gateway_messages.go:371）；Usage 子类型也不同——**禁止跨平台 result 收敛**；
- R-2.2（高）registry 只按 platform 分发会把 antigravity-APIKey 错误路由（须保留 Type 条件）；
- R-2.3（中）ForwardRequest 两字段不足以覆盖 ForwardGemini（model/action/stream/session 选项）；
- R-2.4（高）bench gate 盲区：现仅 anthropic forward 基准，须补 antigravity；
- R-2.5（低）variadic 仅 1 个 option（WithForwardGeminiSession 两字段、生产 2 调用点），折叠风险低。

## 裁决表

| # | 裁决 |
|---|---|
| Q1 | D-A 骨架接受；TokenRefresh 独立 |
| Q2 | 6 方法砍到 Platform()+Forward() |
| Q3 | 返回类型不得统一；OpenAI 剔出本期；前置特征化 T1-T5（OpenAI 不碰则 ≈1.75d） |
| Q4 | 永久留核心点比设计多（含全部原 Batch-1）；**19 点中真正值得建缝 ≤2**——Provider 抽象 ROI 需在 PHASE_PLAN 复核（裁决：保留收窄版，为 Phase-4 搬家建立 Forward 承重接缝） |
| Q5 | 推迟成立；API 从 ROADMAP 待建清单摘除（裁决采纳架构评审的"可观测触发条件"折中表述） |

## 前置特征化清单（已转化为 PHASE_PLAN TASK-001）

T1 :794 路由矩阵（antigravity×{OAuth,APIKey}）/ T2 :444 ForwardGemini 参数逐一断言 / T3 session 选项不丢参 / T4 错误链（BetaBlockedError/PromptTooLong 经 errors.As）/ T5 antigravity forward bench。
