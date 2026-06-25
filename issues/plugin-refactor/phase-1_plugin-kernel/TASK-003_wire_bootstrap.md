# 完成报告: [TASK-003] Wire/启动接入 + 插装清单 + 示例模块

- **完成状态**: Success
- **关联任务规格**: [链接](../../../.claude/plugin-refactor/phases/phase-1_plugin-kernel/TASK-003_wire_bootstrap.md)
- **完成日期**: 2026-06-11

## 1. 任务完成简报

插件系统正式"通电"：内核经 Wire 装配进应用，main 启动时驱动模块 Build/Start、关闭时 runtime.Stop 在 cleanup 并行组首位（先于 Redis/Ent）执行；`modules/standard/imports.go` 成为唯一插装清单；`job.hello` 示例模块（默认 disabled）演示完整生命周期与私有配置。默认配置下零行为变更（专测 + Phase-0 安全网 42 包全绿佐证）。

## 2. 文件变更详情

### 创建的文件
- `backend/internal/plugin/wire.go` — ProviderSet：ProvideModuleConfig（ParseConfig 失败 fail-fast）/ ProvideHost（logger.L() + Config.Of + *ent.Client + *redis.Client）/ ProvideModuleRuntime
- `backend/internal/modules/standard/imports.go` — 唯一插装清单
- `backend/internal/modules/hello/hello.go` + `hello_test.go`（11 个测试）— `job.hello`：四生命周期接口 + 编译期断言，EnabledByDefault=false，私有配置 interval/greeting 带 Validate 校验

### 修改的文件
- `cmd/server/wire.go`（+20/-2）— Application.Runtime 字段、plugin.ProviderSet、provideCleanup 增参并在 parallelSteps 首位插入 PluginModuleRuntime 步骤
- `cmd/server/main.go`（+10）— 匿名 import standard；HTTP server 前 Build+Start，失败 log.Fatalf
- `cmd/server/wire_gen.go`（+24/-2）— **wire v0.7.0 工具生成**，复跑字节级一致
- `cmd/server/wire_gen_test.go`（+1）— provideCleanup 签名变更的连带修正（nil moduleRuntime，步骤有 nil 防御）

## 3. 关键证据

- **cleanup 顺序**：wire.go:125 PluginModuleRuntime（parallelSteps 首项）→ wire.go:322 runParallel 先于 :323 runSequential(infraSteps)，Redis :280 / Ent :286 在 infraSteps——模块 Stop 严格先于基础设施关闭；
- **默认零行为**：TestRuntimeDefaultConfigIsNoop（空 modules 下 Build/Start/Stop 全 no-op、零日志）；
- **启用后生命周期**：TestRuntimeEnabledHelloLifecycle（zap observer 断言启动/周期/停止日志与状态机）；
- **非法配置中止启动**：TestRuntimeInvalidHelloConfigAbortsBuild。

## 4. 裁定与裁量

- **规格冲突裁定**：规格 §8 原文"未知模块 ID 报错中止"与内核语义冲突，架构师裁定以内核为准（格式非法 fail-fast / 格式合法未注册忽略），规格文件已加注；
- hello 模块 Start 用独立 context（与启动 ctx 解耦，由 Stop 统一取消）；ProviderSet 拆三个 provider 使 modules 子树只解析一次。

## 5. 验证记录（主控复跑确认）

- `go build ./...` ✅；`go test ./internal/modules/... ./cmd/server/` ✅；`make test-invariants` 42 包全绿 ✅；
- 全量 `go test -tags=unit ./internal/...` 零失败；`go vet ./...`、golangci-lint（新增包）0 issues；
- wire 产物复跑字节级一致；`go generate ./ent` 零 diff。

## 6. 遗留事项

- **预存在问题**：`make generate` 中 `go run github.com/google/wire/cmd/wire`（无版本号）因 go.sum 缺 `github.com/google/subcommands` 条目失败（不依赖本次改动即可复现）。建议主线单独 PR：`go get github.com/google/wire/cmd/wire@v0.7.0` 或 Makefile 改带版本号调用；本任务按纪律未触碰 go.sum；
- 真实进程级冒烟（需 PG/Redis）留待 Phase-1 阶段验收时与 TASK-004 一并进行。
