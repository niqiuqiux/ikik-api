# 完成报告: [TASK-002] Host / 配置子树 / Runtime 生命周期驱动 + 单测

- **完成状态**: Success
- **关联任务规格**: [链接](../../../.claude/plugin-refactor/phases/phase-1_plugin-kernel/TASK-002_host_runtime_config.md)
- **完成日期**: 2026-06-11

## 1. 任务完成简报

Host（Logger/ConfigOf/DB/Redis 四项能力面）、`modules:` 配置子树（ParseConfig/Of，mapstructure 解码与 viper 语义对齐）、Runtime（Build/Start/Stop/Snapshot 完整状态机）落地，单测覆盖 PHASE_PLAN §3 硬性清单全部条目（含最易写错的 Start 半途失败逆序回滚专测、Stop ctx deadline 专测）。Phase-0 安全网全绿。

## 2. 契约符合性与裁量决定

- Host：`*zap.Logger` / `*ent.Client` / `redis.UniversalClient`（项目实际类型），注释写明扩展须登记 ROADMAP；
- Runtime：Build 稳定序实例化 enabled 模块 → Provision → Validate（失败含模块 ID 中止，%w 可穿透）；Start 半途失败逆序 Stop 已启动模块；Stop 逆序、单失败 errors.Join 聚合继续、尊重 ctx deadline；Snapshot 返回 {ID, Enabled, State, Err(string)}；
- **关键发现**：`viper.Unmarshal` 会把含点的模块 ID 键（`modules.job.hello`）错误拆成嵌套两级——Modules 字段故标记 `mapstructure:"-"`，在 load() 中经 `viper.Get("modules")` 手工提取并做形状校验（`normalizeModulesSubtree`）；
- 未注册但格式合法的模块 ID 配置项放行（兼容不同编译变体共用配置文件），格式非法/enabled 类型错误报错（笔误尽早暴露）；
- 纯增量补充 `NewRuntimeWithRegistry`（测试隔离）；Build 失败不回卷已 Provision 模块（契约仅要求中止启动，进程退出兜底，已注释）。

## 3. 文件变更详情

### 创建的文件
- `backend/internal/plugin/host.go`（34 行）、`config.go`（113 行）、`runtime.go`（278 行）
- `backend/internal/plugin/config_test.go`（135 行）、`runtime_test.go`（366 行）
- `backend/internal/config/modules_config_test.go`（89 行，含"缺省时与现状完全等价"专测）

### 修改的文件
- `backend/internal/config/config.go`（+41 行纯增量：Modules 字段 + load() 提取 + normalizeModulesSubtree；零删改既有行）
- `backend/go.mod`（mapstructure 由 indirect 转直接依赖，未引入新依赖）

## 4. 验证记录（主控复跑确认）

- `go test -race -count=1 ./internal/plugin/` → ok；`go test -count=1 ./internal/config/`（全部既有测试）→ ok；
- `make test-invariants` → 41 包全绿；`go test -tags=unit -count=1 ./internal/...` → 零失败；
- `go vet`、golangci-lint（plugin/config 包）→ 0 issues；`go build ./...` + gofmt 通过。

## 5. 遗留事项

- modules 子树暂不支持环境变量逐键覆盖（viper AutomaticEnv 不合并进 Get("modules")），Phase-1 仅支持配置文件，需要时后续补充；
- go.mod 本身不完全 tidy（aws/smithy-go 标记、go.sum 冗余，与本任务无关），建议主线择机单独 `go mod tidy`。
