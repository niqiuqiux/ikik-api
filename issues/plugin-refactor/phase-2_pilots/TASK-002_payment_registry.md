# 完成报告: [TASK-002] payment 私有注册表（消灭 factory switch）

- **完成状态**: Success
- **关联设计**: [SEAM-DESIGN.md v2 裁决 P](../../../.claude/plugin-refactor/phases/phase-2_pilots/SEAM-DESIGN.md)
- **完成日期**: 2026-06-11

## 1. 任务完成简报

`provider/factory.go` 的 5-case switch 清零：包级私有 `map[string]ConstructorFunc` + 各 provider 文件 `init()` 闭包自注册（重复 key 写前 panic）。新增支付渠道 = 新增 provider 文件 + init 一行，factory/核心零改动。按评审裁决**未触碰插件内核**。

## 2. 等价性硬约束核对（评审 B1/B2/B3）

- **B2 unknown-key 文案**：`fmt.Errorf("unknown provider key: %s", ...)` 表达式逐字节相同 + `TestCreateProviderUnknownKeyMessage` 精确相等断言锁定；
- **B1 错误原样透传**：命中后 `return fn(...)` 无包裹；`TestCreateProviderPassesThroughApplicationError` 用**直接类型断言**（非 errors.As）证明 `*ApplicationError` 未被包裹（Reason/Metadata 字段级断言），另 4 个 provider 校验错误文案精确相等锁定；
- **B3 无可变状态副作用**：map 仅 init 期写入，CreateProvider 纯读（RefreshProviders Clear+重载幂等）；panic 发生在写入前（注册表长度不变断言）；`TestRegistryContainsExactlyAllProviderKeys` 锁定恰好 5 key 防漏注。

## 3. 文件变更详情

- **创建**: `internal/payment/provider/registry.go`、`registry_test.go`（6 测试）
- **修改**: `factory.go`（switch→map）、5 个 provider 文件（各 +init）
- 未触碰 internal/plugin、internal/modules、payment.Registry、PaymentService

## 4. 验证记录（主控复跑确认）

- factory.go switch 计数 = 0 ✅；`go test ./internal/payment/...` ✅；service 层 Payment 测试 ✅；
- `make test-invariants` 43 包 ✅；全量 unit 零失败；vet/gofmt 干净。
