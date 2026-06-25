# 完成报告: [TASK-001] 回归不变量清单与现有测试缺口分析

- **完成状态**: Success
- **关联任务规格**: [链接](../../../.claude/plugin-refactor/phases/phase-0_safety-net/TASK-001_invariants_inventory.md)
- **完成日期**: 2026-06-11

## 1. 任务完成简报

通过两轮并行代码调研（现有 627 个测试文件的覆盖盘点 + 不变量行为的代码事实核实），产出 `.claude/plugin-refactor/INVARIANTS.md`：八类共 30 条不变量，每条标注覆盖状态与代码事实位置，并为 TASK-002/003/004 划定了精确的补齐清单。

**调研中的重要发现（影响后续任务）：**
1. 计费金额实现为 **float64**（非 decimal 库），TASK-003 规格中"decimal 精确断言"已修订为"固定期望值 + ≤1e-10 容差"；
2. `make test-e2e` 引用的 `scripts/e2e-test.sh` **不存在**，可用的是 `test-e2e-local`（env 驱动）；已列入 TASK-005 顺手处理；
3. failover 上限为 handler 层常量：anthropic=10（gateway_handler.go:77）、gemini=3（:78）、openai=3（openai_gateway_handler.go:111）；
4. 内容审核为 **fail-open**（审核服务失败时放行）——这是必须锁定的安全语义；
5. PR 3061 三个计费漂移点在当前代码中的位置均已定位（overages=accounts.extra.allow_overages、5m/1h 双档缓存价、ImageOutputTokens 独立计价），现有测试对这三点均无金额级断言。

## 2. 核心计划回顾

> 1. 通读热路径关键文件，固化"外部可观测行为"列表（八类）；
> 2. 盘点现有 gateway_*/billing_*/concurrency_* 测试，建立"不变量 → 现有测试"映射；
> 3. 重点核对 PR 3061 三个计费漂移点的现有断言情况；
> 4. 写 INVARIANTS.md，附覆盖标注与补齐分派。

全部按计划完成。

## 3. 文件变更详情

### 创建的文件
- `.claude/plugin-refactor/INVARIANTS.md` — 八类 30 条不变量清单 + 补齐分派 + 测试基础设施备注

### 修改的文件
- `.claude/plugin-refactor/phases/phase-0_safety-net/TASK-003_billing_invariants.md` — DoD 第 1 条按 float64 现实修订断言策略

### 业务代码
- 零改动（符合任务约束）
