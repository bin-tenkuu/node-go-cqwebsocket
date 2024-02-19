import { CQWebSocket } from './src/CQWebsocket'

const bot = new CQWebSocket({
  host: 'localhost',
  port: 8080,
  accessToken: ''
})

bot.on('socket.connecting', function () {
  console.log(`连接中[/api]`)
})

bot.on('socket.connectingEvent', function () {
  console.log(`连接中[/event]`)
})

bot.on('socket.error', function ({ context }) {
  console.log(`连接失败[/api]`)
  console.log(context)
})

bot.on('socket.errorEvent', function ({ context }) {
  console.log(`连接失败[/event]`)
  console.log(context)
})

bot.on('socket.open', async function () {
  console.log(`连接成功[/api]`)
})

bot.on('socket.openEvent', async function () {
  console.log(`连接成功[/event]`)
})

bot.on('message', async event => {
  console.log(event)
})

bot.on('notice', async event => {
  console.log(event)
})

bot.on('request', async event => {
  console.log(event)
})

bot.connect()
