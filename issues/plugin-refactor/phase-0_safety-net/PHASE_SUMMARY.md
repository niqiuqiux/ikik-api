# 阶段总结报告: Phase-0 回归安全网（Safety Net）

- **阶段状态**: Completed
- **完成时间**: 2026-06-11
- **关联阶段计划**: [链接](../../../.claude/plugin-refactor/phases/phase-0_safety-net/PHASE_PLAN.md)

## 1. 阶段目标达成情况

目标"把'绝不引入回归'变成机器可验证的硬约束"已达成：

1. ✅ INVARIANTS.md：八类 30 条不变量，全部标注覆盖状态（含两处按实测修正的事实基线）；
2. ✅ 新增测试在当前 main 上全绿（绿色基线成立）；
3. ✅ 流式 SSE 逐事件 + 非流式逐字节透传断言就位（anthropic/openai/gemini 三路径）；
4. ✅ 计费精度不变量含 PR 3061 三个漂移点（overages/1h-cache/ImageCount）全部金额级断言；
5. ✅ 调度不变量（粘性会话、failover 10/3/3 完整循环、槽配平、等待队列）就位；
6. ✅ 基准基线入库 + benchstat/awk 双对比脚本（allocs 严格 / ns 宽松 15%）；
7. ✅ `go test ./internal/...`（无标签）与 `-tags=unit` 全量均 0 FAIL；vet 干净；CI invariants job 为 PR 阻断门禁。

## 2. 任务完成统计

| 任务ID | 任务描述 | 状态 | 完成报告 |
|:--|:--|:--|:--|
| TASK-001 | 回归不变量清单与缺口分析 | Completed | [链接](./TASK-001_invariants_inventory.md) |
| TASK-002 | 透传/拦截特征化测试 | Completed | [链接](./TASK-002_passthrough_characterization.md) |
| TASK-003 | 计费精度不变量测试 | Completed | [链接](./TASK-003_billing_invariants.md) |
| TASK-004 | 调度与并发不变量测试 | Completed | [链接](./TASK-004_scheduling_invariants.md) |
| TASK-005 | 性能基准基线与 CI gate | Completed | [链接](./TASK-005_bench_baseline_ci.md) |

**总计**: 5 个任务全部完成。新增测试代码约 3700 行（11 个测试文件、42+ 测试函数）+ 2 个全链路基准 + 脚本与 CI 配置；**业务代码零改动**。

## 3. 关键技术成果

- 后续所有插件化 PR 的硬性合并门禁：`make test-invariants`（CI invariants job）+ `scripts/bench-baseline.sh compare`（本地/PR 人工）；
- 全链路 Forward 基准基线：非流式 ~10.2µs/93 allocs、流式 ~29.6µs/134 allocs（allocs 跨采样零漂移，可灵敏捕获 Phase-3 adapter 引入的开销）。

## 4. 遇到的问题与解决方案

- **问题1**: TASK-002/003 实施代理两次遭遇上游 API 过载（529）在收尾阶段中断
  - **解决**: 产出文件已落盘且质量达标，主控完成验证（全量测试/vet/抽查断言粒度）并代写完成报告；后续任务改为单代理串行执行。
- **问题2**: INVARIANTS 初稿两处与实测不符（failover 耗尽错误体路径差异、计费为 float64 非 decimal）
  - **解决**: 按"以代码为准"原则实测修正清单与任务规格，体现了"清单须经验证"流程的必要性。

## 5. 技术债务与待优化项（不阻塞，移交后续阶段处理）

- 生产热路径上有 stdlib `log.Printf`（透传分支每请求一条），基准已静音处理；Phase-3 anthropic 搬家时可顺手评估收敛到结构化日志（属行为等价优化，需单独 PR）；
- `AcquireResult.ReleaseFunc` 无 once 保护（依赖 ZREM 幂等 + wrapReleaseOnDone），已固化现状，Phase-3 建缝时保持语义不变；
- gemini/openai 完整 Forward e2e 失败循环因内置长退避无法纳入单测（已用循环契约测试替代），真实环境冒烟清单中补充；
- golangci-lint 在本地 WSL /mnt 盘超时，依赖 CI 把关。

## 6. 经验总结与建议

- "先盘点缺口再补齐"避免了对 627 个现有测试文件的重复建设；
- characterization 纪律（固化现状而非应然值）在 TASK-004 发现错误体路径差异时发挥了作用——若按 INVARIANTS 初稿写"应然断言"，会在 main 上直接红灯。

## 7. 下一阶段准备

- Phase-1（插件内核）就绪：5 个任务规格已细化（.claude/plugin-refactor/phases/phase-1_plugin-kernel/）；
- Phase-1 全程以本阶段安全网为门禁：每个 PR 须 `make test-invariants` 全绿 + bench compare 无劣化。
