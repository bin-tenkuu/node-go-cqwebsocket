"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
const tags_1 = require("./tags");
/**
 * 返回当前时间
 * @returns {string} 当前时间
 */
function now() {
    return new Date().toLocaleString();
}
/**
 * @type {CQWebSocket}
 */
let bot = new _1.CQWebSocket({
    "accessToken": "user",
    "baseUrl": "ws://v.binsrc.club:6700",
    "qq": 2506019369,
    "reconnection": true,
    "reconnectionAttempts": 10,
    "reconnectionDelay": 5000,
});
bot.on("socket.error", (evt, code, err) => {
    console.warn(`${now()} 连接错误[${code}]: ${err}`);
});
bot.on("socket.open", () => {
    console.log(`${now()} 连接开启`);
});
bot.on("socket.close", (evt, code, desc) => {
    console.log(`${now()} 已关闭[${code}]: ${desc}`);
});
bot.messageSuccess = ret => success(ret);
bot.messageFail = reason => fail(reason);
function success(ret) {
    console.log(`${now()} 发送成功`, ret.data);
}
function fail(reason) {
    console.log(`${now()} 发送失败`, reason);
}
bot.connect();
bot.on("socket.open", () => {
    setTimeout(() => {
        bot.send_private_msg(2938137849, [tags_1.CQ.text("测试")]).then(() => {
            bot.disconnect();
        });
    }, 1000);
});
//# sourceMappingURL=test.js.map