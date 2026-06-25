# 完成报告: [TASK-003] 计费精度不变量测试

- **完成状态**: Success
- **关联任务规格**: [链接](../../../.claude/plugin-refactor/phases/phase-0_safety-net/TASK-003_billing_invariants.md)
- **完成日期**: 2026-06-11

## 1. 任务完成简报

新增 4 个表驱动不变量测试文件（共 1204 行，12 个测试函数），覆盖分派的全部 7 条不变量，每个金额期望值附人工核算算式注释、容差 1e-10。实施代理在收尾阶段遭遇 API 过载中断，最终验证与报告由主控完成：全量 unit 套件绿、vet 干净、零业务代码改动。

## 2. 不变量 → 测试映射

| 不变量 | 测试函数 | 文件 |
|---|---|---|
| I-2.2 5m/1h 双档缓存价 | TestBillingInvariant_CacheTier5mVs1h / _CacheTierBreakdownGating（动态定价门控）/ _CacheTier5mVs1hEndToEnd | billing_invariants_cost_test.go、billing_invariants_e2e_test.go |
| I-2.4 倍率叠加顺序 | TestBillingInvariant_ServiceTierThenRateMultiplier / _ZeroAndNegativeRateMultiplier | billing_invariants_cost_test.go |
| I-2.5 overages 语义 | TestBillingInvariant_OveragesFlagSemantics / _OveragesDeniedNoCreditsInjection | billing_invariants_overages_test.go |
| I-2.6 端到端 usage→金额 | TestBillingInvariant_EndToEndUsageBillingCommand | billing_invariants_e2e_test.go |
| I-3.3 API Key 配额增量 | 同上（apiKeyQuotaCost = ActualCost 断言） | 同上 |
| I-3.4 Account 配额增量 | 同上（accountQuotaCost = TotalCost × 账号倍率断言）+ _LegacyPathIncrements | 同上 |
| I-3.6 preflight 拒绝 | TestBillingInvariant_PreflightBalanceEligibility / _PreflightSubscriptionLimits / _PreflightUserPlatformQuota / _PreflightSimpleModeBypass | billing_invariants_preflight_test.go |

## 3. 固化的关键行为（characterization 发现）

- **双档缓存价门控**：仅当 LiteLLM 1h 单价存在且**严格大于** 5m 单价时才启用两档计费（防上游数据错误导致少收费）；无 ephemeral 明细时全部回退 5m 档；
- **priority 显式价微妙行为**：显式 priority 价生效时 tierMultiplier 固定 1.0，cache_write 无 priority 价时按基础价计费**不做 2 倍上浮**——与"无显式价回退 2 倍 tier"路径行为不同；
- **负数 rateMultiplier 按 0 处理**（免费账号语义），TotalCost 保留、ActualCost=0；
- API Key 配额按 **ActualCost** 计，Account 配额按 **TotalCost × 账号倍率** 计——两者基数不同。

## 4. 文件变更详情

### 创建的文件
- `backend/internal/service/billing_invariants_cost_test.go`（291 行）
- `backend/internal/service/billing_invariants_e2e_test.go`（546 行）
- `backend/internal/service/billing_invariants_overages_test.go`（141 行）
- `backend/internal/service/billing_invariants_preflight_test.go`（226 行）

### 修改/删除
- 无（零业务代码改动）

## 5. 验证记录

- `go test -tags=unit -count=1 -run 'Invariant' ./internal/service/` → 全部 PASS；
- `go test -tags=unit -count=1 ./internal/...` → 全绿；
- `go vet ./internal/...` → 无告警。

## 6. 疑似 bug 清单

无（实施代理中断前未上报；主控抽查 cost/e2e 两文件未见"应然值"式断言，全部为当前行为固化）。
