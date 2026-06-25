# 完成报告: [TASK-004] 调度与并发不变量测试

- **完成状态**: Success
- **关联任务规格**: [链接](../../../.claude/plugin-refactor/phases/phase-0_safety-net/TASK-004_scheduling_invariants.md)
- **完成日期**: 2026-06-11

## 1. 任务完成简报

新增 3 个测试文件（13 个顶层测试 / 25 个含子测试用例，全部 `//go:build unit`），覆盖分派的全部 8 条不变量。主控验证：新增测试全绿（handler 包 2.3s，其中池模式重试链固有 500ms×3 间隔）、`go vet` 干净、全量 unit 套件无破坏、零业务代码改动。

## 2. 不变量 → 测试映射

| 不变量 | 测试函数（节选） |
|---|---|
| I-4.1 粘性命中 + hash 优先级 | TestSchedulingInvariant_StickySession_SecondSelectionHitsSameAccount、_SessionHashSourcePriority（metadata→cacheable→IP+UA+APIKeyID 三级链） |
| I-4.2 TTL=1h | _StickySession_TTLIsOneHour（常量+硬编码双断言、miniredis FastForward 过期） |
| I-4.3 sticky_escape | _StickyEscape_ReselectsWhenBoundAccountUnavailable（三子场景，只断言逃逸后重选成功） |
| I-4.5 模型过滤 | _AccountModelMappingFiltersSelection、_ChannelMappingPricingRestrictionAffectsSelection |
| I-5.1 上限 10/3/3 + 耗尽错误 | _FailoverSwitchLimit_DefaultValues（三平台双断言）、_FailoverAnthropic_FullLoopExhaustion（12 账号恒定 500 → 恰好 11 次尝试 → 502）、_FailoverGemini_SwitchLimitLoopContract、_FailoverExhausted_ChatCompletionsErrorBody |
| I-5.2（加固） | FullLoopExhaustion 断言同一账号不被尝试两次 |
| I-5.3 同账号重试链 | _FailoverSameAccountRetry_FullChain（1+3=4 次同账号尝试 → 排除 → 502） |
| I-6.1 槽配平 | _SlotBalance_NormalSuccessPath / _InterceptEarlyReturnPath / _PanicPath、_WrapReleaseOnDone_ExactlyOnce、TestSchedulingCharacterization_ServiceReleaseFuncNotOnceGuarded |
| I-6.2 等待队列 | _UserSlotWaitQueue_FullWaitReleaseWakeup、_AccountSlotWait_TimeoutReturnsConcurrencyError |

## 3. 跳过条目

- gemini/openai 的完整 Forward e2e 失败循环：gemini compat Forward 内置 5 次重试 + 指数退避（完整循环约 2 分钟），openai 循环为 inline 代码且依赖过重，不改业务代码无法纳入单测预算。替代：构造默认上限双断言 + 按真实接线的 FailoverState 循环契约测试（3+1 次后耗尽）。

## 4. Characterization 发现（重要，已回写 INVARIANTS.md）

1. **I-5.1 原记录不精确**：`/v1/messages` 耗尽实际返回 502 + `upstream_error`/"Upstream service temporarily unavailable"；`server_error`/"All available accounts exhausted" 属于 chat-completions/responses 兼容路径，且该路径 lastErr 非空时状态码透传上游、错误体无顶层 `"type":"error"` 包裹；
2. `AcquireResult.ReleaseFunc` 无 once 保护，配平依赖 Redis ZREM 幂等 + handler 层 wrapReleaseOnDone（exactly-once 已固化）；
3. panic 路径下账号槽不走 defer，靠 wrapReleaseOnDone 的 context.AfterFunc 在请求 context 取消时兜底回收；
4. 测试性陷阱（非 prod bug）：GatewayService cfg=nil 时 anthropic apikey 透传 Forward 必 panic（gateway_service.go:9951 附近）；`SUB2API_DEBUG_GATEWAY_BODY` 环境变量会打开调试日志文件，测试用 t.Setenv 隔离。

## 5. 文件变更详情

### 创建的文件
- `backend/internal/service/scheduling_invariants_test.go`
- `backend/internal/handler/scheduling_invariants_failover_test.go`
- `backend/internal/handler/scheduling_invariants_slots_test.go`

### 修改的文件
- `.claude/plugin-refactor/INVARIANTS.md`（I-5.1 事实基线按实测修正）

### 业务代码
- 零改动

## 6. 验证记录

- `go test -tags=unit -count=1 -run 'SchedulingInvariant|SchedulingCharacterization' ./internal/service/ ./internal/handler/` → 全 PASS；
- `go vet ./...` → 0 问题；`go test -tags=unit ./internal/...` 全量 → 0 FAIL。
