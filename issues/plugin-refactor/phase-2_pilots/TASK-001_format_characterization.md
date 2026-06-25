# 完成报告: [TASK-001] 拦截格式特征化测试补齐（实施前置 gate）

- **完成状态**: Success
- **关联设计**: [SEAM-DESIGN.md v2 裁决 H](../../../.claude/plugin-refactor/phases/phase-2_pilots/SEAM-DESIGN.md)
- **完成日期**: 2026-06-11

## 1. 任务完成简报

调用点清单权威定数并归档（[CALLSITE-INVENTORY.md](./CALLSITE-INVENTORY.md)）：**10 个真实调用点 = 8 HTTP + 2 WS**（评审分歧 10/12 的"12"系误计 helper 函数定义）。新增 7 个格式特征化测试（`gateway_moderation_format_characterization_test.go`，p2Char 前缀），全部为实跑后固化的真实行为，TASK-003 的实施 gate 就绪。

## 2. 格式类 → 测试映射与锁定差异

- B chat_completions：403、error.type、**无顶层 type**；
- C responses（GatewayHandler 侧）：error 内用 **code 字符串**字段；
- D gemini：error.code 为 **int**、status=PERMISSION_DENIED、**无 type 字段**（content_policy_violation 被丢弃）；
- A' openai 网关 anthropic 格式：**有**顶层 type:"error"；
- B' images：与 B 字节级同形（openai 网关三点共用 :1920 格式化函数，归并覆盖）；
- fail-open（chat_completions）：审核 500 → 放行至调度（503 非 403），与 block 测试同夹具互证；
- E WS turn-2：turn-1 正常转发 → turn-2 命中 → 错误帧（evt_content_moderation_blocked）→ close 1008 → **帧未达上游**（完整 E2E 夹具，3 次重复稳定）。

## 3. 关键发现

**同一协议常量 ≠ 同一格式**：`openai_responses` 在 GatewayHandler 侧是 C 格式（code 字段）、在 OpenAIGatewayHandler 侧是 B' 格式（type 字段）——印证评审裁决"Decision→格式化映射保留在各调用点，链不得统一格式化"。

## 4. 文件变更详情

- **创建**: `backend/internal/handler/gateway_moderation_format_characterization_test.go`、`issues/plugin-refactor/phase-2_pilots/CALLSITE-INVENTORY.md`
- 零业务代码改动

## 5. 验证记录（主控复跑确认）

- 7/7 PASS；全部 Characterization 集合 ok；`make test-invariants` 全绿；全量 unit 零失败；vet 干净。
