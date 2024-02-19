# go-cqwebsocket

## 介绍

针对 `go-cqhttp`  开发的 `SDK`, 跟随官方文档更新

本SDK中所有api基于 `go-cqhttp-v1.2.0`

在一定程度上兼容 `OpenShamrock-v1.0.8`

## 关于此SDK

关于 CQWebsocket 的 API 接口，以 [go-cqhttp 帮助中心 API](https://docs.go-cqhttp.org/api) 和 [OpenShamrock 帮助中心 API](https://whitechi73.github.io/OpenShamrock/api) 为准

同时提供 `send(...)` 方法以供未知接口的调用

## 在自己项目中引用

在项目根目录中运行 `npm install go-cqwebsocket`

## API

~~~ typescript
import {CQWebSocket, CQ} from "go-cqwebsocket"
~~~

### CQWebSocket

~~~ typescript
const bot = new CQWebSocket({options})
~~~

- 参数 `options`

| 可选参数     | 类型            | 默认值                  | 描述                                 |
| ------------ | --------------- | ----------------------- | ------------------------------------ |
| protocol     | `ws:` , `wss:`  | `"ws:"`                 | 协议                                 |
| host         | `string`        | `"127.0.0.1"`           | 地址                                 |
| port         | `number`        | `6700`                  | 端口                                 |
| accessToken  | `string`        | `""`                    | 校验口令                             |
| baseUrl      | `string`        | `"ws://127.0.0.1:6700"` | 完整链接, 当配置中有此项时, 优先使用 |
| clientConfig | `ClientOptions` | `undefined`             | ws 配置                              |

**注1：** `CQWebSocket` 中实现了对应的API,
查找&调用请参考 [go-cqhttp 帮助中心 API](https://docs.go-cqhttp.org/api) 和 [OpenShamrock 帮助中心 API](https://whitechi73.github.io/OpenShamrock/api)

**注2：** `CQWebSocket` 中实现了对应的Event,
查找请参考 [go-cqhttp 帮助中心 Event](https://docs.go-cqhttp.org/event) 和 [OpenShamrock 帮助中心 Event](https://whitechi73.github.io/OpenShamrock/event)

注册监听请使用 `bot.on(...)`, `bot.once(...)`, `bot.off(...)`, `bot.bind(...)`, `bot.unbind(...)`

**注3：** 实例属性 `errorEvent` 用于替代默认的 `error` 事件, 仅在事件运行出错时调用

**注4：** `自动重连` 功能请自行实现, 本 SDK 中已将两个连接的事件分开触发

------------------------------------

#### `CQ`

- `CQ.escape(str)` | `CQ.unescape(str)`：转义/反转义方法
- `CQ.text(...)` | `CQ.at(...)`等：便捷构建 CQ码 的方法
- `CQ.custom(...)` ：自定义 CQ码, 有不被识别的风险
- `CQ.parse(...)` ：将携带 CQ码 的 字符串 **或** 数组 转换为 CQTag数组

#### `Tags`

- 包含 `CQ` , 参考 `CQ`
- 包含所有 CQ码 的基类：`CQTag<T>`
- 包含所有已标明的 CQ码类型约束 , `typescript` 中可见

#### `Interfaces`

- 仅在 `typescript` 环境下可用, 包含整个 SDK 中 **几乎全部** 的接口和类型约束

## 相关文档

- [CQHTTP 插件](https://richardchien.gitee.io/coolq-http-api/docs/4.15/#/)
- [node-cq-websocket](https://github.com/momocow/node-cq-websocket/blob/master/README.md)
- [go-cqhttp 帮助中心](https://docs.go-cqhttp.org/)
- [OpenShamrock 帮助中心](https://whitechi73.github.io/OpenShamrock)
