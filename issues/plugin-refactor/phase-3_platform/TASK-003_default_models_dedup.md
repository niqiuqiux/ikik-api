# 完成报告: [TASK-003] 默认模型同构 switch 数据驱动去重（可选小项）

- **完成状态**: Success（主控直接实施——代理因 API 过载未启动）
- **完成日期**: 2026-06-12

## 1. 同构性核实

`handler.defaultModelIDsForPlatform`（gateway_handler.go:1152）与 `service.defaultModelsListCandidateIDs`（admin_service.go:1766）经逐分支对比**完全同构**（openai→DefaultModelIDs() / gemini→geminicli.DefaultModels IDs / antigravity→antigravity.DefaultModels() IDs / default→claude.DefaultModels IDs）。

## 2. 变更

- **创建** `internal/service/platform_default_models.go`：导出 `DefaultModelIDsForPlatform`（单一来源，doc 注明只共享 ID 形状、需完整结构体的调用方仍用平台包导出值）+ 表驱动测试（四平台 + anthropic/空串/未知 的 default 兜底）；
- 两处原函数改为单行委托（保留原函数名，调用点零改动——最小 diff）；admin_service.go 清理 4 个失效 import。

## 3. 验证

新测试绿、`make test-invariants` 45 包、全量 unit 零 FAIL、vet/gofmt 干净、build 通过。
