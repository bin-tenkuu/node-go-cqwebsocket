# go-cqwebsocket

针对 go-cqhttp 开发的 SDK, 跟随官方文档更新, 理论上有向其他 OneBot 实现兼容的能力

本SDK中所有api基于 `go-cqhttp-v1.0.0-rc1`

go-cqhttp 标准文档最后编辑日期： `2/10/2022, 8:19:21 AM`

# 关于此SDK

依赖 `go-cqhttp` 的 websocket 接口, 为 NodeJs 开发者提供一个搭建 QQ 聊天机器人的 SDK。

关于 `go-cqhttp`，见 [Mrs4s/go-cqhttp](https://github.com/Mrs4s/go-cqhttp)

关于 CQWebsocket 的 API 接口，以 [go-cqhttp 帮助中心 API](https://ishkong.github.io/go-cqhttp-docs/api/) 为准，同时提供 `send(...)`
方法以供未知接口的调用

> 本 SDK API 已趋于稳定, 项目中引用请使用 `4.0.0` 以上版本, 后续 API 将尽可能减少破坏性变化

> 本 SDK 仅为代码提示与方便调用，使用上有机会碰到 Bug，欢迎提交 PR 或 issue 回报。

# 开发者看板

本 SDK 尚未进行系统化测试, 全部交由实际使用环境中测试

## 在自己项目中引用

在项目根目录中运行 `npm install go-cqwebsocket`

## API

- javascript

```javascript
const {CQWebSocket, CQ} = require("go-cqwebsocket");
```

- typescript

```typescript
import {CQWebSocket, CQ} from "go-cqwebsocket"
```

------------------------------------

#### `let bot = new CQWebSocket({some options})`

- 参数 `options`

| 可选参数         | 类型                                       | 默认值                   | 描述                                                                                            |
|:-------------|:-----------------------------------------|:----------------------|:----------------------------------------------------------------------------------------------|
| protocol     | `ws:` , `wss:`                           | `"ws:"`               | 协议                                                                                            |
| host         | string                                   | `127.0.0.1`           | 地址                                                                                            |
| port         | number                                   | `6700`                | 端口                                                                                            |
| accessToken  | string                                   | ""                    | 校验口令, 参考[config.hjson](https://ishkong.github.io/go-cqhttp-docs/guide/adminApi.html#公共参数) 中配置 |
| baseUrl      | string                                   | `ws://127.0.0.1:6700` | 完整链接, 当配置中有此项时, 优先使用                                                                          |
| clientConfig | `ClientOptions` `http.ClientRequestArgs` | `undefined`           | ws 配置, 参考 IDE 内部提示                                                                            |

**注1：** `CQWebSocket` 中实现了 `go-cqhttp` 文档中全部 API,
查找&调用请参考 [go-cqhttp 帮助中心 API](https://ishkong.github.io/go-cqhttp-docs/api/)

**注2：** `CQWebSocket` 中实现了 `go-cqhttp` 文档中全部 Event,
查找请参考 [go-cqhttp 帮助中心 Event](https://ishkong.github.io/go-cqhttp-docs/event/) , 注册监听请使用 `bot.on(...)`, `bot.once(...)`
, `bot.off(...)`, `bot.bind(...)`, `bot.unbind(...)`

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

# 相关文档

- [node-cq-websocket](https://github.com/momocow/node-cq-websocket/blob/master/README.md)
- [go-cqhttp 帮助中心](https://ishkong.github.io/go-cqhttp-docs/)
- [go-cqhttp 帮助中心](https://docs.go-cqhttp.org/cqcode/)
- [CQHTTP 插件](https://richardchien.gitee.io/coolq-http-api/docs/4.15/#/)
