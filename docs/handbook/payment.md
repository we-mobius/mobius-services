# Payment

目前只支持接入微信支付。

- wepayPayment 依赖 mpAuthObservables 提供的 openid

## Payment Service

使用示例：

```javascript
// 初始化： 在使用之前需要进行初始化，initPayment 会准备好核心的支付流程，全局初始化一次即可
initWepayPayment()
// 调起支付：
startJSAPIWepay({
  deviceInfo: 'Mobius UI',
  goods: [{
    // id 或者 name & price 选其一即可，都传的情况下会优先使用 id
    id: '201601213007', // String(goodsId, len = 12)
    name: 'Thoughts - Mobius UI', // String(len <= 128)
    price: 1 // Number(unit = cent)
  }]
})
// 交易成功： 接收到订单状态之后处理其它业务
//   - 需要根据 tradeState 的 goods, attach, deviceInfo, tradeType 等信息甄别订单
//   - tradeState 的 newer 字段是最新的交易状态，需要自行获取
wepayPaymentObservables.type('trade_state').subscribe(tradeState => {
  console.warn(tradeState)
})
```

> 一般来说，以上调起支付和交易成功之后的业务处理可以组合为单个支付函数（与 Cycle 体系的 Driver 相似）
