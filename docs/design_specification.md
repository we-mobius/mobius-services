# Design Specification

- utils: 工具函数（偏算法和实现）。
- common: 通用函数（偏辅助和应用）。
- config: 提供可配置部分的初始配置信息以及对配置信息的获取、更新等操作接口。
- const: 提供常量、规范数据的校验函数.
- _libs: 依赖管理。
- _data: 将应用视作一个整体，应用本身与外界进行数据的交换的逻辑均在 data 层，
         包括但不限于从任何服务端存取数据、从本地存储中存取数据、从环境中解析数据。
- _domains: 核心的数据处理逻辑。
  - repository: 接手来自 data 层的数据接口，统一转换为 observable 或 observer。
  - usecase?: 向外暴露 repository 封装好的 observable，处理多数据源与本地持久化存储的事宜。
- _models: 运行时的数据结构和关系模型
- _drivers: 整合 repository 或 usecase 和 model，暴露成套的可直接使用的 observable 和 observer。
- services: 整合导出业务强相关的数据和接口。
- adapters: 胶水。
- presenter: （视图层的常用逻辑）
- enhancements: 对第三方 SDK 的改造和增强。
  - wx: ...
  - vue: ...

前缀为 "_" 的不对外暴露。
