# 内容审核调用点清单（Phase-2 TASK-001 归档）

- **固定日期**: 2026-06-11
- **固定方法**: `grep -rn 'checkContentModeration|runContentModeration' internal/handler/ --include='*.go'`
- **裁决依据**: SEAM-DESIGN.md v2【裁决记录】——两评审计数 10/12 不一致，以本 grep 为准
- **结论**: **共 10 个真实调用点**（8 个 HTTP + 2 个 WebSocket）。
  另有 3 处为辅助函数自身定义/转发（content_moderation_helper.go:15/33/40，`GatewayHandler.checkContentModeration` 与 `OpenAIGatewayHandler.checkContentModeration` 均转发到 `runContentModeration`），不计入调用点。

## 调用点明细

| # | 文件:行号 | 所属端点（handler 方法 / 路由） | 协议常量 | Blocked 后格式化函数 | body 入参表达式 | 格式类 |
|---|---|---|---|---|---|---|
| 1 | gateway_handler.go:198 | `GatewayHandler.Messages` — POST /v1/messages（anthropic 平台分组）| `ContentModerationProtocolAnthropicMessages` | `h.errorResponse(c, contentModerationStatus(decision), contentModerationErrorCode(decision), decision.Message)`（gateway_handler.go:1698） | `body` | **A**（anthropic） |
| 2 | gateway_handler_chat_completions.go:98 | `GatewayHandler.ChatCompletions` — POST /v1/chat/completions（anthropic 平台分组兼容层） | `ContentModerationProtocolOpenAIChat` | `h.chatCompletionsErrorResponse(...)`（gateway_handler_chat_completions.go:333） | `body` | **B**（chat_completions） |
| 3 | gateway_handler_responses.go:107 | `GatewayHandler.Responses` — POST /v1/responses（anthropic 平台分组兼容层） | `ContentModerationProtocolOpenAIResponses` | `h.responsesErrorResponse(...)`（gateway_handler_responses.go:312，**code 字段**） | `body` | **C**（responses） |
| 4 | gemini_v1beta_handler.go:190 | `GatewayHandler.GeminiV1BetaModels` — POST /v1beta/models/*modelAction（含 /antigravity 路由复用） | `ContentModerationProtocolGemini` | `googleError(c, contentModerationStatus(decision), decision.Message)`（gemini_v1beta_handler.go:663）——**不消费 errorCode** | `body` | **D**（googleError） |
| 5 | openai_gateway_handler.go:244 | `OpenAIGatewayHandler.Responses` — POST /openai/v1/responses（HTTP；openai 平台分组） | `ContentModerationProtocolOpenAIResponses` | `h.errorResponse(...)`（openai_gateway_handler.go:1920） | `body` | **B'**（与 B 字节级同形） |
| 6 | openai_gateway_handler.go:676 | `OpenAIGatewayHandler.Messages` — POST /v1/messages（openai 平台分组 dispatch） | `ContentModerationProtocolAnthropicMessages` | `h.anthropicErrorResponse(...)`（openai_gateway_handler.go:934） | `body` | **A'**（与 A 字节级同形） |
| 7 | openai_chat_completions.go:88 | `OpenAIGatewayHandler.ChatCompletions` — POST /openai/v1/chat/completions | `ContentModerationProtocolOpenAIChat` | `h.errorResponse(...)`（openai_gateway_handler.go:1920） | `body` | **B'** |
| 8 | openai_images.go:89 | `OpenAIGatewayHandler.Images` — POST /v1/images/generations、/v1/images/edits（含 /openai 前缀路由） | `ContentModerationProtocolOpenAIImages` | `h.errorResponse(...)`（openai_gateway_handler.go:1920） | **`parsed.ModerationBody()`**（全清单唯一非原始 body 入参：prompt + images 重组 JSON） | **B'** |
| 9 | openai_gateway_handler.go:1251 | `OpenAIGatewayHandler.ResponsesWebSocket` — GET /openai/v1/responses 等 WS 升级路由；**turn-1 首帧** | `ContentModerationProtocolOpenAIResponses` | `writeContentModerationWSError(ctx, wsConn, decision)`（openai_gateway_handler.go:1992）+ `closeOpenAIClientWS(wsConn, coderws.StatusPolicyViolation, decision.Message)` | `firstMessage` | **E**（WS 错误帧 + close） |
| 10 | openai_gateway_handler.go:1426 | `OpenAIGatewayHandler.ResponsesWebSocket` — `OpenAIWSIngressHooks.BeforeRequest` 回调；**turn ≥ 2 每消息审核** | `ContentModerationProtocolOpenAIResponses` | `writeContentModerationWSError(ctx, wsConn, decision)` + `return service.NewOpenAIWSClientCloseError(coderws.StatusPolicyViolation, decision.Message, nil)`（最终由 openai_gateway_handler.go:1567-1569 取 closeErr.StatusCode()/Reason() 关闭客户端 WS） | `payload`（model 取值链：`originalModel` → `payload.model` → `reqModel`） | **E** |

## 格式类定义（实测锁定值）

| 格式类 | JSON 形状（403 拦截时） | 关键差异点 |
|---|---|---|
| **A / A'**（anthropic） | `{"type":"error","error":{"type":"content_policy_violation","message":<BlockMessage>}}` | 有顶层 `type:"error"`；error 内用 `type` 字段 |
| **B / B'**（chat_completions / openai 网关通用） | `{"error":{"type":"content_policy_violation","message":<BlockMessage>}}` | **无**顶层 type；error 内用 `type` 字段 |
| **C**（responses，仅 GatewayHandler 侧） | `{"error":{"code":"content_policy_violation","message":<BlockMessage>}}` | **无**顶层 type；error 内用 **`code`**（字符串）而非 `type` |
| **D**（gemini googleError） | `{"error":{"code":403,"message":<BlockMessage>,"status":"PERMISSION_DENIED"}}` | **无**顶层 type、**无** error.type；`code` 为 **int** HTTP 状态；`status` 为 google 状态串（403→PERMISSION_DENIED）；errorCode（content_policy_violation）**被丢弃** |
| **E**（WS） | 错误帧 `{"event_id":"evt_content_moderation_blocked","type":"error","error":{"type":"invalid_request_error","code":"content_policy_violation","message":<Message>}}` + close(1008 StatusPolicyViolation, reason=Message 截断 120 字节) | 帧内 error.type 固定 `invalid_request_error`，审核码降级为 `code` 字段 |

## 注意点（TASK-003 改造时的硬约束）

1. **同一协议常量 ≠ 同一格式**：`ContentModerationProtocolOpenAIResponses` 在调用点 3（GatewayHandler，C 格式 code 字段）与调用点 5（OpenAIGatewayHandler，B' 格式 type 字段）格式**不同**；格式由调用点的格式化函数决定，与协议常量无映射关系——印证裁决"格式化留在调用点"。
2. **gemini 调用点不消费 `contentModerationErrorCode`**：Decision.ErrorType 对 D 格式无效（与裁决记录一致）。
3. **images 调用点的 body 入参是 `parsed.ModerationBody()`**，不是原始请求 body——链改造时各点保留自己的入参表达式。
4. **WS 两点（9/10）按裁决排除在链改造之外**，保持现状。

## 特征化测试覆盖映射

| 格式类 | 测试函数 | 文件 |
|---|---|---|
| A（block）+ A fail-open | `TestGatewayCharacterization_ContentModerationBlock` / `..._ContentModerationFailOpen`（已有） | gateway_intercept_characterization_test.go |
| A'（openai 网关 anthropic 一族，调用点 6） | `TestP2Characterization_ModerationBlock_OpenAIGatewayAnthropicFormat` | gateway_moderation_format_characterization_test.go |
| B（调用点 2） | `TestP2Characterization_ModerationBlock_ChatCompletionsFormat` | 同上 |
| B fail-open（非 anthropic 协议） | `TestP2Characterization_ModerationFailOpen_ChatCompletionsFormat` | 同上 |
| B'（调用点 8 images；**归并覆盖调用点 5/7**——三点共用 openai_gateway_handler.go:1920 同一格式化函数，输出与 B 字节级同形） | `TestP2Characterization_ModerationBlock_OpenAIImagesFormat` | 同上 |
| C（调用点 3） | `TestP2Characterization_ModerationBlock_ResponsesFormat` | 同上 |
| D（调用点 4） | `TestP2Characterization_ModerationBlock_GeminiGoogleErrorFormat` | 同上 |
| E turn-1（调用点 9） | `TestOpenAIResponsesWebSocket_ContentModerationBlocksFirstFrame`（已有） | openai_gateway_handler_test.go |
| E turn-2（调用点 10） | `TestP2Characterization_OpenAIResponsesWSTurn2ModerationCloseError` | gateway_moderation_format_characterization_test.go |
