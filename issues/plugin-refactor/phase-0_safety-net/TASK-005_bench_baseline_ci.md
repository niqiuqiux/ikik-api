# 完成报告: [TASK-005] 性能基准基线与 CI gate

- **完成状态**: Success
- **关联任务规格**: [链接](../../../.claude/plugin-refactor/phases/phase-0_safety-net/TASK-005_bench_baseline_ci.md)
- **完成日期**: 2026-06-11

## 1. 任务完成简报

热路径基准、采集/对比脚本、CI 门禁与 Makefile 修复全部落地。新增覆盖**完整 Forward 路径**的基准（非流式 ~10.2µs/93 allocs、流式 SSE ~29.6µs/134 allocs），allocs/op 在 6 次采样中完全稳定，时间抖动 ±2%，适合作为 Phase 1-3 改造的灵敏对比基线。

## 2. 文件变更详情

### 创建的文件
- `backend/internal/service/gateway_forward_benchmark_test.go` — BenchmarkGatewayForward_AnthropicNonStreamPassthrough / _AnthropicStreamPassthrough（复用 TASK-002 passChar 夹具，`//go:build unit`，基准内静音 stdlib log 降噪）
- `backend/scripts/bench-baseline.sh` — `collect`（采集基线 + 环境信息）/ `compare`（awk 阈值门禁：allocs/op 严格不允许增加、ns/op 容忍 15%，违反退出码 1；benchstat 可用时附带其报告）
- `backend/testdata/bench/baseline.txt` + `baseline.env.txt` — 基线数据（count=6）与采集环境（Go 1.26.4）

### 修改的文件
- `backend/Makefile` — 新增 `test-invariants` 目标；修复 `test-e2e`（原引用不存在的 scripts/e2e-test.sh，改为与 test-e2e-local 等价的 env 驱动 e2e）
- `.github/workflows/backend-ci.yml` — 新增 `invariants` job（`make test-invariants`，PR 阻断）；带注释说明这些测试同时包含在 test-unit 中，独立 job 为了回归信号清晰

### 业务代码
- 零改动

## 3. 基准策略说明

- 基准 job 未加入 CI（共享 runner 时间指标不可靠）：`compare` 设计为**本地/PR 人工运行**，时间阈值宽松（15%）、分配阈值严格（0）；换机器或换 Go 版本后须重新 `collect`；
- 基准集合：2 个全链路 Forward 基准 + 5 个既有 SSE usage 解析基准。

## 4. 验证记录

- `./scripts/bench-baseline.sh collect` → 基线入库；`compare` 实测 7 个基准全部 ok（allocs 零漂移、时间 ≤2.1%）；
- `make test-invariants` → 全绿；
- `go test ./internal/...`（无标签构建）与 `go test -tags=unit ./internal/...`（全量）→ 0 FAIL；
- `go vet ./internal/...` → 干净；golangci-lint 本地超时未跑完（WSL /mnt 盘 IO 慢），由 CI 把关。
