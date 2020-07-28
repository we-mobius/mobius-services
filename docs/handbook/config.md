# Config

Config 支持三种持久化方式，分别是 Runtime\Local\Server，Runtime 即只在运行时存储，关闭网页或应用重新打开之后上次的配置信息即失效，Local 保存在本地的 LocalStorage 中，用于在多次访问之间保持配置信息的一致性，Server 保存在云端，用于在多浏览器、多设备、多应用之间保持配置信息的一致性。

> Runtime\Local\Server 三者之间是一种渐进增强的关系，即配置为 Local 会同时在 Local 和 Runtime 进行持久化，配置为 Server 会同时在 Server、Local、Runtime 进行持久化。

Config 模块拥有自管理的特性，即 Config 模块相关的配置信息也可以由 Config 模块本身进行管理，并且在变更过程中无需进行应用的重启。为了实现多种持久化方式和自管理特性，Config 模块在实现策略上选择了多轮初始化的方式，即：

- 从 defaultConfig 出发，根据 defaultConfig 的 config 模块相关配置进行持久化 config 的获取，获取完成之后将持久化 config 反哺到 runtimeConfig 中，runtimeConfig 是 defaultConfig 的 Proxy，会自动更新 defaultConfig，这是第一轮初始化，完成之后应用各个部分的 config 初步保持一致；
- 第二轮初始化会将开发者通过 `initConfig` 指定的 config 信息更新到系统中；
- 如果前两轮中涉及到 `server` 类型的 Config 持久化方式，同时又因为其它原因（请求要附带 token，而此时 token 还没有就绪）导致与 Config 服务端沟通失败，则此时持久化只会保持在 Local 级别，为了解决这个问题， Mobius 会在将来 token 准备就绪的任何时候再次拉取 ServerConfig 并将其结果合并到 Local 和 Runtime。如果此时还涉及到其它因素，比如将 Server 端持久化的能力作为增值功能，则相关获取权限需要服务端另作处理。

**由于应用的其它任何部分都有可能涉及到相关配置项的引用，所以强烈建议将配置的初始化工作放在所有业务功能初始化之前，示例如下：**

```javascript
whenContentLoaded(async () => {
  // 可以执行不依赖 config 的业务功能

  await initConfig({ })
  initRequest({
    withToken: true // default to true
  })
  await initAuth()

  // 执行其它业务功能
})
```

## ConfigService

ConfigService 中导出的能力包括：`makeConfigObserver`, `configObservables`, `initConfig`, `getConfig`。

`getConfig`（path => config value）可以随时获得 runtime 最新的配置。
