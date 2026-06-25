# 完成报告: [TASK-002] gatewayplatform 接缝（Provider/Registry/3 adapter + 分发替换）

- **完成状态**: Success
- **关联设计**: [SEAM-DESIGN.md v2 裁决记录](../../../.claude/plugin-refactor/phases/phase-3_platform/SEAM-DESIGN.md)
- **完成日期**: 2026-06-12

## 1. 任务完成简报

`internal/gatewayplatform` 落地：`Provider{Platform; Forward}`（v1 仅两方法）+ `ForwardRequest{Parsed, Body, IsStickySession, SessionGroupID, SessionKey}` + 构造期注册 Registry（重复/nil panic，运行期并发只读无锁）+ 3 个单语句直返 adapter（anthropic/antigravity/gemini，action="generateContent" 常量）。`:444`/`:794` 两处分发改 registry 查找，**`Type != APIKey` 条件保留在调用点**。OpenAI、v1beta 端点的 ForwardGemini、内核全部零触碰。

## 2. 等价性证据（要点）

- :444 逐字段对照：reqModel/reqStream 与 Parsed.Model/Stream 同源且无 mutation（gemini 分支不经 :794 的克隆循环）；session 两字段经 ForwardRequest 重组同名 option——T2/T3 断言；
- :794 双分支共享 ForwardRequest（attemptBody=attemptParsedReq.Body.Bytes() 关系不变）；session 维度留零值（现状不传、adapter 不消费——不虚构维度）；
- gemini 平台非 antigravity 账号的 else 分支（geminiCompatService.Forward）保持原状（不在裁决 3 adapter 内）；
- 错误透传：adapter 单语句 `return p.svc.Forward(...)`，T4 两用例（BetaBlockedError/PromptTooLong 的 errors.As 链）经新路径全绿。

## 3. 文件变更

新增 gatewayplatform 包 4 文件 + handler/gateway_platform.go（Wire provider）；修改 gateway_handler.go（字段+两处替换）、handler/wire.go、wire_gen.go（wire@v0.7.0 生成）；两个测试文件仅夹具加参（断言零改动）。

## 4. 验证（主控复跑确认）

T1-T4+action 契约全绿、gatewayplatform 包 -race 通过、`make test-invariants` 45 包、全量 unit 零失败、build/vet/gofmt 干净、bench compare exit 0（allocs 全部持平：266/329/93/134）。
