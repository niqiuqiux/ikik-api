# 插件化改造对抗式审计报告（2026-06-11）

> 审计范围：插件内核（internal/plugin/）、hello 模块、Wire/main 接入、admin handler、config 改动、Phase-0 资产。
> 方法：静态分析 + go build/test（含 -race）+ 3 个特征化测试变异验证 + viper 边界实测 + log.Fatalf 行为实证。
> 审计执行于沙箱 shell 故障前，全部需执行的验证均已完成；报告全文由审计代理产出，主控归档。

## 发现汇总

| ID | 严重度 | 位置 | 问题 | 修复状态 |
|---|---|---|---|---|
| B1 | **P1** | cmd/server/main.go:156-165 | Build/Start 失败走 `log.Fatalf`→`os.Exit`，跳过 `defer app.Cleanup()`；而部分 Provider（如 ProvidePaymentOrderExpiryService，service/wire.go:627）构造期已自启动并持有 Redis leader 锁（TTL 3min）→ 启动失败时锁/后台服务不被优雅释放。**改造新引入的失败模式**（原 Fatalf 在 defer 注册之前）。 | ✅ 已修：失败分支先显式 `app.Cleanup()` 再 Fatalf |
| B2 | P2 | internal/plugin/runtime.go | Start 回滚时回滚 Stop 失败仅记日志、不并入返回值；该模块置 errored 后不再重试。 | ✅ 已修：rollback errs 经 errors.Join 并入返回错误 + 回归测试 TestRuntimeStartRollbackStopFailureJoinedIntoError |
| A | P2 | internal/plugin/runtime.go:249 | 单锁横跨模块 Start/Stop：慢模块会阻塞 Snapshot（admin /modules）。属模块作者隐性契约。 | ✅ 已修：Starter/Stopper 接口注释明确"必须快速返回，长任务自起 goroutine" |
| C | P2 | plugin/config.go | viper 静默小写所有 key：大写模块 ID 被规整而非报错（部署友好），但模块 mapstructure 标签必须全小写——未文档化。 | ✅ 已修：ParseConfig 注释点明；TASK-005 文档将收录 |
| F1 | P2 | scripts/bench-baseline.sh | awk 的均值计数耦合在 allocs/op 分支，去掉 -benchmem 时除零→inf/nan 静默失真。 | ✅ 已修：ns/allocs 独立计数，缺指标跳过并向 stderr 告警 |
| F2 | P2 | scripts/bench-baseline.sh | 基准名含空格时 $1 截断（当前基准均无空格，理论隐患）。 | 备查不修 |

## 通过项（验证方式）

- **并发正确性**：-race 下并发 Build/Start/Stop/Snapshot、registry 并发注册/读取无竞争（临时 race 测试，已清理）；hello goroutine 无泄漏（cancel 先于等待，Stop 超时也会退出）；
- **生命周期边界**：Build 失败后 Start 被拒、重复 Stop 幂等、Stop ctx 取消正确传递；
- **配置边界**：normalizeModulesSubtree/ParseConfig 对畸形输入（非 map、字符串 enabled、null 子树、嵌套 map）均返回错误或安全规整，不 panic（viper 实测）；
- **接入正确性**：wire_gen 与声明一致（build 通过）、cleanup nil 防御在位、Build/Start 先于 HTTP listen、"配置了未注册的合法模块 ID 绝不 fail"成立；
- **admin handler**：logredact 脱敏、Snapshot 持锁拷贝值切片（并发只读安全）、envelope 合规；
- **CI YAML/Makefile**：静态判定结构正确（与既有 job 同构）；
- **测试可信度**：3/3 变异实验（计费 ×2、槽配平跳过释放、header 白名单加 set-cookie）全部变红，产线代码 md5 校验逐字节还原。

## 审计遗留的环境收尾（待 shell 恢复执行）

1. `rm backend/internal/plugin/zzz_audit_race_test.go backend/internal/plugin/zzz_audit_lifecycle_test.go backend/internal/config/zzz_audit_normalize_test.go`（已确认均为无逻辑桩，不影响编译）；
2. `git diff` 复核 billing_service.go / gateway_handler.go / responseheaders/ 零变异残留（代理已 md5 校验，双重确认）；
3. 修复后全量门禁：build / `go test -race ./internal/plugin/` / modules+cmd/server+config 测试 / make test-invariants / vet / `bash -n bench-baseline.sh` / CI YAML python 校验。
