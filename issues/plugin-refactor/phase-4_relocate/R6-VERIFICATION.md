# R6 实施前核实：AccountRuntimeBlocker"归属错误"债务撤回（2026-06-12）

## 背景

Phase-4 两份评审均记录架构债务："`AccountRuntimeBlocker` 接口定义在 openai 卫星文件、被 ratelimit/admin 核心消费——命名/归属错误，应归位消费者侧并重命名"，并列为可选重构项 R6。用户指示继续后，按纪律先做实施前核实。

## 核实结果：债务不成立，R6 撤回

逐项对照代码（preview-dev @ b3261c94）：

| 评审声称 | 代码事实 |
|---|---|
| 接口定义在 openai 卫星文件 | **错**。接口定义在消费者侧 `ratelimit_service.go:37`（`type AccountRuntimeBlocker interface { BlockAccountScheduling; ClearAccountSchedulingBlock }`）——正是评审建议的"消费者定义接口"模式，已经如此 |
| 命名为 OpenAI 专属 | **错**。接口名与方法名均平台中立 |
| 实为通用调度依赖、归属错误 | **不成立**。实现（openai_account_runtime_block_fastpath.go:82）首行 `!isOpenAIAccount(account)` 即返回；其守护的 `openaiAccountRuntimeBlockUntil` sync.Map 是 OpenAI 调度器内部运行时状态——状态归谁、实现在谁，正确；非 openai 账号经此接口调用为设计内 no-op |
| 消费者仅 ratelimit/admin | 不全。还有 token_refresh_service、openai_token_provider——均按能力消费接口，模式一致 |

评审错误的根因推测：fastpath 文件名 + wire.Bind 绑定具体类型给人"接口属于 openai"的表象；评审未打开 ratelimit_service.go:37 核实定义位置。

## 处置

- R6 重构项**撤回**（执行它=纯 churn，违反"禁止过度设计"）；
- 仅存的边缘改进（如 wire.Bind 处加注释说明实现选择）价值过低，不立项；
- Phase-4 的 Deferred 总裁决**不受影响**（循环依赖/规模/gate 缺口等其余证据独立成立且经编译器实测）；
- 评审归档（REVIEW-ARCH/REVIEW-RISK）保留原文为历史记录，以本文件为勘误。

## 方法论备注

本项目第三次"下游核实推翻上游结论"（Phase-3 实施前推翻摸底三处、本次实施前推翻评审一处）——多轮验证纪律双向起效：评审抓设计错误，实施前核实抓评审错误。**任何"债务/缺陷"在动手前必须用代码原文复核**，已固化为流程。
