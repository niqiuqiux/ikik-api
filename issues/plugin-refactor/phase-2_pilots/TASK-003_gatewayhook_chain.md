# 完成报告: [TASK-003] gatewayhook 链 + moderation 核心钩子 + HTTP 调用点替换

- **完成状态**: Success
- **关联设计**: [SEAM-DESIGN.md v2 裁决 H](../../../.claude/plugin-refactor/phases/phase-2_pilots/SEAM-DESIGN.md)
- **完成日期**: 2026-06-11

## 1. 任务完成简报

`internal/gatewayhook` 包落地（Request/CallerInfo/只读 RequestHeaders/Decision/PreFlightHook/Chain），Chain 含评审三件必补：每钩子 recover 隔离、error 默认 fail-open、`Run` 永不返回 error（nil=放行）。moderation 核心钩子 adapter 经 Wire 装配；**8 个 HTTP 调用点全部经链**（每点保留原入参表达式与格式化函数，逐点对照 TASK-001 格式测试验证）；**WS 两点（:1255/:1430）完全未动**（helper 保留供其消费）。

## 2. 关键等价性证据

- 7 个格式特征化测试 + Phase-0 拦截特征化全绿（逐点替换时单独验证）；
- 输入 builder 新旧逐字段等价测试、gateway_check_start 11 字段/check_done 8 字段日志名称+顺序锁定测试；
- adapter 自吞 Check error（保留原 `content_moderation.check_failed` 事件名）——日志事件名零变化；
- **bench compare：allocs/op 全部零增加**（93/134/40/37/2 不变，ns/op 噪声内）；空链路径 AllocsPerRun=0 锁定。

## 3. 裁量决定（要点）

请求级 logger 经 handler 私有 ctx key 传入（契约 7 字段不扩）；强制平台覆盖改读 ctxkey.ForcePlatform（middleware 双写恒一致，等价性有测试）；GatewayHandler 彻底移除 moderation service 字段（无 WS 消费者），OpenAIGatewayHandler 双持（svc 供 WS、chain 供 HTTP）；gatewayhook→service import 无环（service 不引用 gatewayhook，且契约含 *service.APIKey 本就需要）。

## 4. 文件变更详情

- **创建**: `internal/gatewayhook/{hook,chain,chain_test}.go`、`internal/handler/gateway_preflight.go` + `gateway_preflight_test.go`
- **修改**: 7 个 handler 文件（8 调用点替换）、content_moderation_helper.go（删 2 个零消费者函数、保留 WS 消费部分）、handler/wire.go、wire_gen.go（wire@v0.7.0 生成）；TASK-001/Phase-0 测试文件夹具适配（断言零改动）
- 内核 internal/plugin 零改动

## 5. 验证记录（主控复跑确认）

- `go build ./...` ✅；Characterization|Invariant 集合（handler+service）✅；gatewayhook 包测试 ✅；
- 剩余 `checkContentModeration` 引用恰为 5 处（WS helper 定义 1 + 注释 2 + WS 调用点 2）✅；
- `make test-invariants`、全量 unit 44 包 0 失败、vet、bench compare exit 0（实施代理记录 + 主控抽查）。
