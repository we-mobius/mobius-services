# Request

对于使用者来说，与请求相关的内容中有以下几点需要知晓：

- Mobius 的请求模块基于 axios 进行搭建，并对 axios 的基本功能进行了二次封装，二次封装的过程中没有涉及到任何 axios 自带 AOP 相关方法的使用，即你仍然可以直接从 Mobius.js 中通过 `import { axios } from '@we-mobius/mobius-services'` 导入原汁原味的 axios 进行使用，需要注意的是你在任何时刻对该 axios 实例进行的更改都会影响到 Mobius 相关模块的运作，除非你非常了解 Mobius 的运作机制和过程，否则不建议轻易使用。
- 封装好的请求模块叫 Biu，意即 biubiubiu~，封装所做的事情就是对传给 axios 的 RequestConfig 和 axios 请求完成之后返回的 Response 进行拦截和加工，加工的方式支持在 `makeCustomBiutor` 的基础上自定义，它接受两个函数参数，第一个是 Config 处理函数，第二个是 Response 处理函数，最终返回一个 Biutor 对象。Biutor 对象的包含 `maker` 和 `biu` 两个必需的属性，其中 `biu` 属性是封装过的发送 axios 请求的函数（config => Promise），其调用方式与 axios 无异，`maker` 属性是 `makeCustomBiutor` 本身。
- Mobius 的数据请求层（Data Layer）使用的是自定义 Biutor（`innerBiutor`），`innerBiutor` 内部维护了一个 Set，支持在后续程序运作的任何时刻为该 Biutor 添加加工 RequestConfig 的函数，执行顺序类似洋葱结构，先添加先执行，后添加的接受在其之前的操作结果。
  - 在 RequestService 中，统一为通过 `innerBiutor` 的请求添加了用于身份认证的 token，使用详情见下文。
- Biu 是一个简单的 Biutor 管理器，使用 scope 来区隔不同的 Biutor 实例，Biutor 在使用之前应该进行注册，注册方式为 `Biu.registerScope('inner', makeInnerBiutor())`，使用方式为 `Biu.scope('inner').biu(config)`，严格按照先注册后使用的方式进行编码可以有效提高代码和业务结构的可读性和可维护性。
  - 注册 Scope 的时候也可以直接使用既有的 Biutor，如： `Biu.registerScope('example', 'inner')`，这样可以获得一个与原始 Biutor 功能一致的一手（非二手） Biutor。

## RequestService

RequestService 中除了导出最基本的 axios、Biu、makeCustomBiutor 之外，还定义了 initRequest 函数，该函数接受一个 options 对象作为参数，其中一个 Boolean 选项是 `withToken`，开启之后所有通过 innerBiutor 的请求都会带上用于身份认证的 token，该 token 来自 Auth 模块。

需要注意的是，该操作当前是不可撤销或更改的一次性操作，如果没有特殊情况，建议在尽可能早的位置进行调用。

**由于该模块与 Auth 模块有些许交集，避免预料之外的错误，最好在 AuthService 相关操作之前执行，合理的调用顺序如下所示：**

```javascript
whenContentLoaded(async () => {
  // 其它操作

  initRequest({
    withToken: true // default to true
  })
  await initAuth()

  // 其它操作
})
```
