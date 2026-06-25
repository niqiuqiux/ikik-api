# 阶段总结报告: Phase-4 平台代码搬家与域拆分 — Deferred

- **阶段状态**: Deferred（2026-06-12，双视角评审实测裁决）
- **交付物**: C-C 依赖测绘（本目录 + .claude/plugin-refactor/phases/phase-4_relocate/INVENTORY.md）

## 1. 裁决

Phase-4 原计划"把平台代码搬入独立包以铺路插件模块化"，经双视角评审**实测证伪可行性前提**，裁决：**整包搬家 Deferred，本阶段交付依赖测绘**。

## 2. 决定性证据（实测，非估算）

1. **规模认知硬伤**：摸底称"openai 7168 行单文件"，实为 **46 非测试文件 ~29K 行 + 69 白盒测试 ~35K 行**的完整子系统；
2. **循环依赖已编译器证实**（`go build` → `import cycle not allowed`）：正向 openai 引用 178 个 service 符号（64 未导出）、反向 service 引用 57 个 openai 符号；4 类骨架级反向硬耦合（ops_service 内嵌 struct / image_billing 签名吃 OpenAIForwardResult / token_refresh 构造器 / wire.Bind）+ 2 个接口（AccountRuntimeBlocker、OpenAI403CounterCache）定义在 openai 卫星却被 ratelimit/admin 核心消费；
3. **gate 缺失**：69 个 openai 测试 100% 白盒 `package service`，整包移动会让它们自己先编译不过——无稳定黑盒等价锚点；
4. **循环论证 + 无拉动**：L2 模块化触发=搬家完成、搬家收益=为 L2 铺路（自指）；无任何待实现 gateway.platform.* 模块、无 Host 扩容、无测试隔离困难；
5. **先例一致**：Phase-2 对 payment.provider.*（5 文件、更弱耦合）已 Deferred，Phase-4（46 文件、双向硬环）无理由更激进。

## 3. 重启触发条件（任一满足）

- 出现具体 gateway.platform.* 模块实现需求；
- openai 集群测试隔离产生可度量困难；
- service 包规模使 CI 编译时间成为可度量瓶颈。

## 4. ~~真实架构债务发现~~（已勘误撤回，见 [R6-VERIFICATION.md](./R6-VERIFICATION.md)）

评审声称的 `AccountRuntimeBlocker` 归属/命名错误经实施前核实**不成立**：接口本就定义在消费者侧（ratelimit_service.go:37）、命名平台中立、实现挂在 OpenAIGatewayService 是因为它守护的就是 OpenAI 调度器内部状态（非 openai 账号为设计内 no-op）。R6 重构项撤回——执行它是纯 churn。Phase-4 的 Deferred 总裁决不受影响（其余证据独立成立且经编译器实测）。

## 5. 经验

本阶段是"多轮审计制度"价值的最强体现：架构师把"搬家 ROI 是否循环论证"作为元问题主动提交评审，两个独立视角用编译器实测 + 符号级 grep 共同证伪了一个看似自然的下一步。**最优的架构决策有时是用证据证明某个动作现在不该做**——避免了一次 150+ 文件、零行为收益、必然成环的高风险改动。
