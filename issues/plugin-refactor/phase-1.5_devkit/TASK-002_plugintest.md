# 完成报告: [TASK-002] plugintest 测试夹具包

- **完成状态**: Success
- **关联任务规格**: [链接](../../../.claude/plugin-refactor/phases/phase-1.5_devkit/TASK-002_plugintest.md)
- **完成日期**: 2026-06-11

## 1. 任务完成简报

`internal/plugin/plugintest/` 落地（host.go 103 行 + runtime.go 120 行 + 自测 318 行）：一行构造 Host（Option 模式：WithRedis/WithConfig/WithObservedLogger）、一行跑完整生命周期（RunLifecycle 自动 t.Cleanup Stop）、BuildOnly / BuildExpectingError 变体。hello 测试自举改造（213→178 行），语义不变全绿。

## 2. 公开 API

`NewHost(tb, ...Option)`、`WithRedis(tb)`（miniredis + t.Cleanup）、`WithConfig(raw)`、`WithObservedLogger() (Option, *ObservedLogs)`、`RunLifecycle(tb, m, host, raw) *Runtime`（失败 t.Fatal 含模块 ID；cleanup Stop 10s 上限并断言无错）、`BuildOnly`、`BuildExpectingError`。包 doc 声明 test-only。

## 3. 关键裁量（已在代码注释登记）

- observer 句柄随 Option 双返回值（较草案 `Logs(t)` 更直接，无包内状态）；
- 失败期望走独立 `BuildExpectingError`（调用处意图显式、不注册多余 cleanup）；"Start 应失败"不预铺夹具（无样板需求）；
- RunLifecycle 的 raw 为配置唯一来源（统一重绑 host.ConfigOf，消除歧义）；
- disabled 模块不强制 enable，仅 t.Logf 提示（防 footgun 兼顾 default-noop 测试）；
- 不吞错由 `recordingTB` 哨兵自测固化（Build/Start 失败 Fatal、cleanup Stop 失败 Errorf）。

## 4. 文件变更详情

- **创建**: `internal/plugin/plugintest/{host,runtime,plugintest_test}.go`
- **修改**: `internal/modules/hello/hello_test.go`（公共样板换夹具，−35 行）、`audit_regression_test.go`（仅 Host 构造样板替换，内部字段访问保留）
- 内核与生产代码零改动

## 5. 验证记录（主控复跑确认）

- `go test -race ./internal/plugin/... ./internal/modules/...` ✅（plugintest 17 自测全过）；
- `make test-invariants`、全量 `go test -tags=unit ./internal/...`（43 包）✅；vet/lint/gofmt 0 issues；
- 无任何非 `_test.go` 文件 import plugintest。
