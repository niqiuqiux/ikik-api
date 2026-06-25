# 完成报告: [TASK-001] Phase-3 前置特征化测试 T1-T5

- **完成状态**: Success
- **关联设计**: [SEAM-DESIGN.md v2 裁决记录](../../../.claude/plugin-refactor/phases/phase-3_platform/SEAM-DESIGN.md)
- **完成日期**: 2026-06-12

## 1. 任务完成简报

7 个特征化测试 + 2 个 antigravity forward 基准落地，全部在当前行为下绿（行为锁定，零产线改动）。这是 TASK-002（gatewayplatform 接缝）的等价性 gate。

## 2. 锁定的行为（T1-T5）

- **T1 :794 路由矩阵**：antigravity×{非 APIKey→AntigravityGatewayService.Forward（v1internal 包裹体上游）, APIKey→GatewayService.Forward（直连 anthropic + x-api-key）}——锁定真实条件 `Type != APIKey`（含 Upstream 类型子用例），每用例双向断言（命中侧 1 次/另一侧 0 次）；
- **T2 :444 + 参数**：gemini→ForwardGemini 的 model/body/stream（false=收集单 JSON、true=SSE 解包）/sessionKey `"gemini:"+hash`；action 契约在 service 层锁定（generateContent/streamGenerateContent 接受、countTokens 短路零上游、未知 404）；
- **T3 session 透传**：粘性绑定→429 限流→DeleteSessionAccountID(groupID, key) 参数断言→failover 成功 + RecordUsage force_cache_billing 日志断言（isStickySession 端到端可观测面）；
- **T4 错误链**：BetaBlockedError→400 invalid_request_error（零上游）、PromptTooLongError→WriteMappedClaudeError 透传（单次上游无 failover）——adapter 若包裹错误必红；
- **T5 基准**：AntigravityClaude NonStream ~39.6µs/266 allocs、Stream ~42.7µs/329 allocs 入基线（旧 7 基准先 compare 零漂移再 collect，新基线自比 exit 0）。

## 3. 实现取舍

handler 的 service 字段为具体类型不可接口替换 → 真实 service + 注入式记录桩（双 HTTPUpstream 按 accountID 脚本化区分路径 + GatewayCache 记录桩断言 session 参数 + 结构化日志 sink）。

## 4. 文件变更

新增 `internal/handler/gateway_platform_dispatch_characterization_test.go`、`internal/service/antigravity_forward_gemini_action_characterization_test.go`、`internal/service/gateway_forward_antigravity_benchmark_test.go`；基线文件重采集。

## 5. 验证（主控复跑确认）

7 测试全绿、`make test-invariants` 44 包、全量 unit 零失败、vet 干净、bench 自比 exit 0。
