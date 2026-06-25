# 完成报告: [TASK-005] 模块作者指南 + CLAUDE.md 更新

- **完成状态**: Success
- **关联任务规格**: [链接](../../../.claude/plugin-refactor/phases/phase-1_plugin-kernel/TASK-005_author_guide_docs.md)
- **完成日期**: 2026-06-11

## 1. 任务完成简报

《模块作者指南》（docs/plugin-architecture/MODULE-AUTHOR-GUIDE.md，约 380 行中文）落地，八章覆盖规格 §6 全部要求，所有代码示例摘自已落地真实代码（hello.go/imports.go/module.go/host.go），无"将来时"能力描述。CLAUDE.md 完成三处更新（GORM→Ent 修正、新增"插件模块开发"小节、项目结构补 plugin/modules 两行）。

## 2. 文件变更详情

### 创建的文件
- `docs/plugin-architecture/MODULE-AUTHOR-GUIDE.md` — 章节：概述与设计理念 / 模块结构与命名空间 / 生命周期契约（含 Start 半途逆序回滚、Stop 逆序+ctx deadline）/ Host 能力面与铁律 / 配置子树（enabled 三态、viper 含点 key 注意事项）/ 插装清单 / 测试要求（含 make test-invariants + bench compare 硬性 gate）/ job.hello 完整示例 + 新模块检查清单

### 修改的文件
- `CLAUDE.md` — ①ORM 修正为 Ent（全文 2 处 GORM 引用，含 Repository 示例代码改为 ent.Client 写法）；②新增"插件模块开发"小节（链接指南与 ROADMAP）；③项目结构树补充 internal/plugin/ 与 internal/modules/
- `.gitignore`（主控裁定补充）— 新增 `!docs/plugin-architecture/` 白名单：原 `docs/*` 忽略规则会导致指南无法入库，按现有白名单模式（docs/legal/ 同款）放行；CLAUDE.md 与 .claude/ 的忽略保持原样（用户刻意本地化，改动仍生效）

## 3. 发现的既有文档债务（未处理，登记备查）

1. CLAUDE.md 描述 ports 接口在 `service/ports/*.go`，实际端口接口直接定义于 `internal/service` 包（`service/ports/` 目录不存在）；`make wire` 目标实际为 `make generate`——均属既有过时描述，按"只改三点"纪律未动，建议后续单独梳理；
2. `internal/service/usage_log.go` 残留 2 处无实际作用的 `gorm:"column:..."` struct tag（go.mod 已无 gorm 依赖）。

## 4. 验证

- 指南代码示例与已落地 API 逐一对照（实施代理核对 + 主控抽查）；
- `git check-ignore` 确认指南文件已可跟踪；
- 纯文档任务，零代码改动。
