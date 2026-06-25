# 完成报告: [TASK-001] 对抗式审计与修复

- **完成状态**: Success
- **关联任务规格**: [链接](../../../.claude/plugin-refactor/phases/phase-1.5_devkit/TASK-001_audit_fixes.md)
- **完成日期**: 2026-06-11

## 1. 审计总结论（两轮合并）

- **第一轮**（报告 [AUDIT-REPORT.md](./AUDIT-REPORT.md)）：发现 **1 个 P1** —— Build/Start 失败走 `log.Fatalf`→`os.Exit` 跳过 defer Cleanup，而部分 Provider 构造期已持有 Redis leader 锁（TTL 3min），启动失败会泄漏锁。已修：失败分支先显式 `app.Cleanup()` 再 Fatalf。另修 4 个 P2（回滚错误吞没→errors.Join + 回归测试、Starter/Stopper 快速返回契约注释、viper 小写化文档、bench awk 除零加固），1 个 P2 备查不修（基准名空格，当前无实例）。代理在收尾时因 WSL 沙箱故障中断，遗留桩文件已清理。
- **第二轮**（报告 [AUDIT-REPORT-R2.md](./AUDIT-REPORT-R2.md)，重启后全量复审 + 扩展前端/Cleanup 推演）：确认第一轮修复全部有效，**无新 P0/P1**；发现 6 个新 P2，全部修复并配回归测试。
- 测试可信度突变实验两轮合计 **6/6 变红**（计费×3、版本检查、槽配平、header 过滤、failover 上限，覆盖三大类），产线代码逐字节恢复确认。

## 2. 第二轮 P2 发现与修复明细

| 编号 | 问题 | 修复 | 回归测试 |
|---|---|---|---|
| A-1 | 失败的 Build 可被静默重跑，泄漏已 Provision 实例（guard 不覆盖失败路径） | runtime.go 增加 `buildAttempted` 守卫：失败后二次 Build/Start 一律拒绝（提示重启进程），doc comment 同步 | TestRuntimeBuildFailureBlocksRetry + TestRuntimeBuildSuccessThenRebuildStillRejected（internal/plugin/audit_regression_test.go） |
| B-1 | hello.Stop 传入已取消 ctx 时，worker 已干净退出仍可能误报失败（select 双臂随机选取） | Stop 先非阻塞探测 m.done 再进入双臂 select | TestStopWithPreCancelledContextAfterWorkerExit（internal/modules/hello/audit_regression_test.go） |
| B-2 | main.go Build/Start 失败路径显式+defer 双 Cleanup，依赖 os.Exit 才不双调 | main.go 加警示注释：此处不可改为 return（Cleanup 未统一幂等） | 注释级（无行为变化） |
| C-1 | `enabled:`（YAML null）hard fail，与三态语义不一致且未文档化 | ParseConfig 将 enabled nil 视为未配置（走模块默认值）；作者指南 §5.2 三态表同步 | TestParseConfigEnabledNilTreatedAsUnset（同 A-1 文件） |
| F-1 | bench compare 的 join 静默丢弃增删基准 → 回归网假阴性 | 脚本增加基准名集合对比：基线有而本次缺失 → FAIL；新增基准 → warn 提示重新 collect | 实跑 compare 验证（7 项 ok、exit 0；语法 bash -n 通过） |
| H-1 | 前端取错误用 `data.detail`，项目 envelope 是 `message` | stores/modules.ts 与 ModulesView.vue 改为 `data.message` | ModulesView.spec 6/6 复跑通过 |

## 3. 审计中的"通过"项（验证方式存档）

- 并发：Build/Start/Stop/Snapshot 全程持锁，50 goroutine 并发 -race 干净；hello 无 goroutine 泄漏（NumGoroutine 前后对比 ×3）；
- 回滚 Stop 失败不被吞（errors.Join，上一轮审计修复的回归测试仍在）；
- main.go 失败路径显式 Cleanup 优先于 log.Fatalf 的设计正确（避免 leader 锁滞留）；
- 配置畸形输入（大写 ID/含空格/enabled 为数字/null 子树/列表型模块项）全部 fail-fast 或安全规整，无 panic；
- 未知合法模块 ID 绝不影响启动（硬要求实测确认）；
- wire_gen.go 与声明逐字节一致；cleanup nil 防御在位；模块 Stop 先于 Redis/Ent；
- admin handler 脱敏（logredact）+ envelope + 鉴权链正确；CI yaml 语法有效；`test-invariants` 实匹配 46 个测试函数。

## 4. 文件变更详情

### 修改（修复）
- `backend/internal/plugin/runtime.go`（A-1）、`internal/plugin/config.go`（C-1）、`internal/modules/hello/hello.go`（B-1）、`cmd/server/main.go`（B-2 注释）、`backend/scripts/bench-baseline.sh`（F-1）、`frontend/src/stores/modules.ts` + `views/admin/ModulesView.vue`（H-1）、`docs/plugin-architecture/MODULE-AUTHOR-GUIDE.md`（C-1 文档）

### 创建（回归测试）
- `backend/internal/plugin/audit_regression_test.go`、`backend/internal/modules/hello/audit_regression_test.go`

## 5. 验证记录

- `go build ./...` ✅；`go test -race ./internal/plugin/ ./internal/modules/...` ✅（含新回归测试）；
- `make test-invariants` 42 包 ✅；bench compare 实跑 exit 0、7 项 ok ✅；
- 前端 `pnpm exec vitest run ModulesView.spec.ts` 6/6 ✅；
- 审计过程的突变实验已全部恢复（审计员 git diff 复核 + 主控 git status 复核）。

## 6. 备注

- 首轮审计代理因宿主进程退出丢失，仅遗留一个空探针文件（已删）；重启后完整完成；
- `scripts/bench-baseline.sh` 的 summarize 缺指标警告为审计期间的前置改进，一并保留。
