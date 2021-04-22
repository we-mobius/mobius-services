# Design Specification

- utils: 工具函数（偏算法和实现）
- common: 通用函数（偏辅助和应用）
- _libs: 依赖管理
- data: 将应用视作一个整体，应用本身与外界进行数据的交换的逻辑均在 data 层，
         包括但不限于从任何服务端存取数据、从本地存储中存取数据、从环境中解析数据
- domains: 核心的数据处理逻辑
  - const: 提供常量、规范数据的校验函数
  - config: 提供可配置部分的初始配置信息以及对配置信息的获取、更新等操作接口
  - entity: 数据侧的数据结构和关系模型
  - model: 运行时的数据结构和关系模型
  - mapper: 运行时和数据侧的相互转换
  - usecase: 整合业务接口，处理多数据源读取事宜
  - driver: 整合 usecase，暴露成套的可直接使用的 Atom
  - service: 服务整合
- adapters: 与框架结合的胶水层
- enhancements: 对第三方 SDK 的改造和增强
  - wx: ...
  - vue: ...

前缀为 "_" 的不对外暴露。
