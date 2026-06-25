# 插件化改造对抗式审计报告 — 第二轮（2026-06-11）

> 第一轮审计（见 AUDIT-REPORT.md）修复落地后的全量复审，扩展覆盖前端新增代码与 main.go Cleanup 交互推演。
> 方法：静态分析 + 临时 race 测试 + wire v0.7.0 重生成逐字节比对 + 配置畸形输入表驱动探针 + 3 个测试突变实验（与第一轮不重复）。
> 结论：**无 P0/P1**；6 个 P2，已全部修复（修复明细见 TASK-001 完成报告）。

## 发现汇总

| 编号 | 严重度 | 位置 | 问题 |
|---|---|---|---|
| A-1 | P2 | internal/plugin/runtime.go Build | 失败的 Build 可被静默重跑：guard 仅在成功路径置位，重跑会对已 Provision 的旧实例不 Stop 即覆盖（当前 main 不重试故不可达，属契约漏洞） |
| B-1 | P2 | internal/modules/hello/hello.go Stop | 传入已取消 ctx 时 select 双臂就绪随机选取，可把"worker 已干净退出"误报为失败 |
| B-2 | P2 | cmd/server/main.go | Build/Start 失败路径显式+defer 双 Cleanup，依赖 os.Exit 不双调；若未来改为 return 会双触发（Cleanup 未统一幂等） |
| C-1 | P2 | config 子树 + plugin/config.go | `enabled:`（YAML null）hard fail，与三态语义（未配置→默认）不一致且未文档化 |
| F-1 | P2 | scripts/bench-baseline.sh compare | `join` 只输出两侧共有基准：基准被删/改名后静默退出对比，compare 仍绿（回归网假阴性） |
| H-1 | P2 | frontend stores/modules.ts + ModulesView.vue | 取错误用 `data.detail`，项目 envelope 为 `message`（cosmetic，有兜底） |

## 通过项（验证方式）

- **并发**：Build/Start/Stop/Snapshot 全程持锁；50 goroutine 并发 Snapshot × Build/Start/Stop 的 -race 测试干净；Snapshot 在 Start 进行中被正确互斥；hello 无 goroutine 泄漏（NumGoroutine 对比 ×3）；
- **生命周期**：回滚 Stop 失败经 errors.Join 不被吞（第一轮 B2 修复的回归测试在位）；Stop 容错 + 尊重 ctx deadline；main.go 失败路径显式 Cleanup 先于 Fatalf（第一轮 B1 修复）设计正确；
- **配置**：畸形输入（大写 ID/含空格/enabled 数字/null 子树/列表型模块项/嵌套 map）全部 fail-fast 或安全规整，无 panic；与作者指南声明一致（除 C-1）；
- **接入**：wire_gen 与声明 wire@v0.7.0 重生成逐字节一致；cleanup nil 防御在位；模块 Stop 严格先于 Redis/Ent；"配置未知合法模块 ID 绝不 fail"实测成立；
- **admin handler**：logredact 脱敏（ya29.* 实测抹除）、Snapshot 并发安全、envelope/鉴权链合规；
- **Phase-0 资产**：CI YAML safe_load 通过；test-invariants 实匹配 46 个测试函数、42 包绿；bench awk 解析正确（缺指标有警告）；
- **测试可信度**（突变→红→恢复→绿，git diff 复核零残留）：版本检查比较符翻转 → ClaudeCodeVersionCheck 红；计费 rateMultiplier 置 1 → ServiceTierThenRateMultiplier 红；failover 默认上限 10→9 → FailoverSwitchLimit_DefaultValues 红；
- **前端**：Module 类型与后端逐字段一致；store loading/error 管理正确；spec 6/6。
