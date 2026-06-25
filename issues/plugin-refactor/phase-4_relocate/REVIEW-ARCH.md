# Phase-4 评审 — 架构合理性/演进视角（2026-06-12）

> 评审对象：SEAM-DESIGN v1。裁决见 SEAM-DESIGN v2【裁决记录】。

## 元问题立场

**Phase-4 第一刀应停在 C-C（测绘）+ ROADMAP 标 Deferred-until-pulled，不以 L1 推进。**

## 核心论证

- **循环依赖面真实且宽**：openai 集群（46 文件 65K 行含测试）子包化双向成环；反向边经 6 个核心文件结构级引用 openai 专属类型（ops 内嵌 struct、image_billing 签名、token_refresh 构造器、wire.Bind、ratelimit/admin 经 AccountRuntimeBlocker 接口）；
- **"零消费 GatewayService 方法"前提在子包视角失效**：同包语义为真，子包化后正向 178 符号 + 反向 57 符号双向锁死；
- **循环论证成立**：L2 触发=搬家完成、搬家收益=为 L2 铺路，自指；无外部拉动信号（无待实现模块/无 Host 扩容/无测试隔离困难）；
- **先例一致**：Phase-2 payment.provider.*（5 文件、更弱耦合）已 Deferred，Phase-4 无理由更激进；Phase-3 对 gateway.hook.* 用"可观测触发条件"是正确模式。

## 裁决表

| # | 裁决 |
|---|---|
| Q1 | C-C；L0 正交（可读性，不支撑架构目标，不作第一刀）；L1 否决 |
| Q2 | C-C 优先；C-A 前提被推翻（4 类硬环）；C-B 无架构价值 |
| Q3 | 不第一刀做、不单列前置——C-C 测绘后基于成本决定；AccountRuntimeBlocker 归属错误记为债务 |
| Q4 | 现有特征化不足以 gate 整包移动（但非主阻塞，主阻塞是循环依赖面）；测绘中清点白盒测试改造量 |
| Q5 | 是，应 Deferred + 可观测触发条件 |

## 架构债务记录

`AccountRuntimeBlocker` 定义在 openai 卫星文件，却被 ratelimit_service.go（热路径）与 admin_service.go 消费——命名与归属错误。应由消费者侧定义接口。修复属独立重构周期（重命名/契约调整 + 安全网），非搬家。
