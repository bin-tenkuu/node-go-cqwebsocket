"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CQWebSocket = void 0;
const websocket_1 = require("websocket");
const event_bus_1 = require("./event-bus");
const tags_1 = require("./tags");
const shortid = require("shortid");
class CQWebSocket {
    constructor({ 
    // connectivity configs
    accessToken = "", baseUrl = "ws://127.0.0.1:6700", 
    // application aware configs
    qq = -1, 
    // Reconnection configs
    reconnection = true, reconnectionAttempts = 10, reconnectionDelay = 1000, } = {}) {
        /**
         *
         * @type {Map<string, {onSuccess:onSuccess,onFailure:onFailure}>}
         * @private
         */
        this._responseHandlers = new Map();
        this._eventBus = new event_bus_1.CQEventBus();
        if (reconnection) {
            let reconnection = this.reconnection = {
                times: 0,
                timesMax: reconnectionAttempts,
                delay: reconnectionDelay,
                timeout: 0,
            };
            this._eventBus.on("socket.close", (code) => {
                if (code !== 1006)
                    return;
                // @ts-ignore
                if (reconnection.times++ < this.reconnection.timesMax) {
                    // @ts-ignore
                    this.reconnection.timeout = setTimeout(() => {
                        this.reconnect();
                        // @ts-ignore
                    }, this.reconnection.delay);
                }
                else {
                    console.error("Number of reconnections exceeded");
                }
            });
        }
        this._qq = qq;
        this._accessToken = accessToken;
        this._baseUrl = baseUrl;
        this.messageSuccess = (ret) => {
            console.log(`发送成功`, ret.data);
        };
        this.messageFail = (reason) => {
            console.log(`发送失败`, reason);
        };
    }
    reconnect() {
        this.connect();
    }
    connect() {
        {
            let urlAPI = `${this._baseUrl}/api/?access_token=${this._accessToken}`;
            this._socketAPI = new websocket_1.w3cwebsocket(urlAPI);
            this._socketAPI.onopen = () => this._open("api");
            this._socketAPI.onclose = evt => this._close(evt, "api");
            this._socketAPI.onmessage = evt => this._onmessageAPI(evt);
        }
        {
            let urlEVENT = `${this._baseUrl}/event/?access_token=${this._accessToken}`;
            this._socketEVENT = new websocket_1.w3cwebsocket(urlEVENT);
            this._socketEVENT.onopen = () => this._open("event");
            this._socketEVENT.onclose = evt => this._close(evt, "event");
            this._socketEVENT.onmessage = evt => this._onmessage(evt);
        }
    }
    disconnect() {
        if (this.reconnection) {
            clearTimeout(this.reconnection.timeout);
            this.reconnection.timeout = 0;
        }
        this._socketEVENT.close(1000, "Normal connection closure");
    }
    /**
     *
     * @param method
     * @param params
     * @return
     */
    send(method, params) {
        return new Promise((resolve, reject) => {
            let reqId = shortid.generate();
            const onSuccess = (ctxt) => {
                this._responseHandlers.delete(reqId);
                delete ctxt.echo;
                resolve(ctxt);
            };
            const onFailure = (err) => {
                this._responseHandlers.delete(reqId);
                reject(err);
            };
            this._responseHandlers.set(reqId, { onSuccess, onFailure });
            const apiRequest = {
                action: method,
                params: params,
                echo: reqId,
            };
            this._eventBus.handle("api.preSend", apiRequest).then(() => {
                this._socketAPI.send(JSON.stringify(apiRequest));
            });
        });
    }
    /**
     *
     * @param user_id  对方 QQ 号
     * @param message 要发送的内容
     * @param auto_escape=false  消息内容是否作为纯文本发送 ( 即不解析 CQ 码 ) , 只在 `message` 字段是字符串时有效
     */
    send_private_msg(user_id, message, auto_escape = false) {
        return this.send("send_private_msg", { user_id, message, auto_escape })
            .then(this.messageSuccess, this.messageFail);
    }
    /**
     *
     * @param group_id 群号
     * @param message  要发送的内容
     * @param auto_escape=false 消息内容是否作为纯文本发送 ( 即不解析 CQ 码) , 只在 `message` 字段是字符串时有效
     */
    send_group_msg(group_id, message, auto_escape = false) {
        return this.send("send_group_msg", { group_id, message, auto_escape })
            .then(this.messageSuccess, this.messageFail);
    }
    /**
     *
     * @param group_id 群号
     * @param messages 自定义转发消息
     */
    send_group_forward_msg(group_id, messages) {
        return this.send("send_group_forward_msg", { group_id, messages })
            .then(this.messageSuccess, this.messageFail);
    }
    /**
     * | eventType | handler |
     * |-|-|
     * |"socket.open"| (type: string) => void |
     * |"socket.close"|(code: number, reason: string, type: string) => void|
     * |`MessageEventType`|(event: CQEvent, message: any, CQTag: CQTag[]) => void|
     * |`EventType`|(event: CQEvent, message: any) => void|
     * @param eventType
     * @param handler
     * @return
     * @see MessageEventType
     * @see EventType
     */
    on(eventType, handler) {
        this._eventBus.on(eventType, handler);
        return this;
    }
    /**
     * | eventType | handler |
     * |-|-|
     * |"socket.open"| (type: string) => void |
     * |"socket.close"|(code: number, reason: string, type: string) => void|
     * |`MessageEventType`|(event: CQEvent, message: any, CQTag: CQTag[]) => void|
     * |`EventType`|(event: CQEvent, message: any) => void|
     * @param eventType
     * @param handler
     * @return
     * @see MessageEventType
     * @see EventType
     */
    once(eventType, handler) {
        this._eventBus.once(eventType, handler);
        return this;
    }
    /**
     * | eventType | handler |
     * |-|-|
     * |"socket.open"| (type: string) => void |
     * |"socket.close"|(code: number, reason: string, type: string) => void|
     * |`MessageEventType`|(event: CQEvent, message: any, CQTag: CQTag[]) => void|
     * |`EventType`|(event: CQEvent, message: any) => void|
     * @param eventType
     * @param handler
     * @return
     * @see MessageEventType
     * @see EventType
     */
    off(eventType, handler) {
        this._eventBus.off(eventType, handler);
        return this;
    }
    _open(data) {
        return this._eventBus.handle("socket.open", data);
    }
    _onmessageAPI(evt) {
        if (typeof evt.data !== "string") {
            return;
        }
        let json = JSON.parse(evt.data);
        if (json.echo) {
            let { onSuccess, onFailure } = this._responseHandlers.get(json.echo) || {};
            if (json.retcode < 100) {
                if (typeof onSuccess === "function") {
                    onSuccess(json);
                }
            }
            else {
                if (typeof onFailure === "function") {
                    onFailure(json);
                }
            }
            this._eventBus.handle("api.response", json).then();
            return;
        }
    }
    _onmessage(evt) {
        if (typeof evt.data !== "string") {
            return;
        }
        let json = JSON.parse(evt.data);
        return this._handleMSG(json);
    }
    _close(evt, type) {
        if (evt.code === 1000) {
            return this._eventBus.handle("socket.close", evt.code, evt.reason, type);
        }
        else {
            return this._eventBus.handle("socket.error", evt.code, evt.reason, type);
        }
    }
    _handleMSG(json) {
        let post_type = json["post_type"];
        switch (post_type) {
            case "message": {
                let messageType = json["message_type"];
                let cqTags = tags_1.parse(json.message);
                switch (messageType) {
                    case "private":
                    case "discuss":
                    case "group":
                        return this._eventBus.handle([post_type, messageType], json, cqTags);
                    default:
                        return console.warn(`未知的消息类型: ${messageType}`);
                }
            }
            case "notice": {
                let notice_type = json["notice_type"];
                switch (notice_type) {
                    case "group_upload":
                        return this._eventBus.handle([post_type, notice_type], json);
                    case "group_admin": {
                        let subType = json["sub_type"];
                        switch (subType) {
                            case "set":
                            case "unset":
                                return this._eventBus.handle([post_type, notice_type, subType], json);
                            default:
                                return console.warn(`未知的 notice.group_admin 类型: ${subType}`);
                        }
                    }
                    case "group_decrease": {
                        let subType = json["sub_type"];
                        switch (subType) {
                            case "leave":
                            case "kick":
                            case "kick_me":
                                return this._eventBus.handle([post_type, notice_type, subType], json);
                            default:
                                return console.warn(`未知的 notice.group_decrease 类型: ${subType}`);
                        }
                    }
                    case "group_increase": {
                        let subType = json["sub_type"];
                        switch (subType) {
                            case "approve":
                            case "invite":
                                return this._eventBus.handle([post_type, notice_type, subType], json);
                            default:
                                return console.warn(`未知的 notice.group_increase 类型: ${subType}`);
                        }
                    }
                    case "group_ban": {
                        let subType = json["sub_type"];
                        switch (subType) {
                            case "ban":
                            case "lift_ban":
                                return this._eventBus.handle([post_type, notice_type, subType], json);
                            default:
                                return console.warn(`未知的 notice.group_ban 类型: ${subType}`);
                        }
                    }
                    case "friend_add":
                        return this._eventBus.handle([post_type, notice_type], json);
                    case "group_recall":
                        return console.warn(`制作中 group_recall 类型`);
                    case "friend_recall":
                        return console.warn(`制作中 friend_recall 类型`);
                    case "notify": {
                        let subType = json["sub_type"];
                        switch (subType) {
                            case "poke":
                                return console.warn(`制作中 notify.poke 类型`);
                            case "lucky_king":
                                return console.warn(`制作中 notify.lucky_king 类型`);
                            case "honor":
                                return console.warn(`制作中 notify.honor 类型`);
                            default:
                                return console.warn(`未知的 notify 类型: ${subType}`);
                        }
                    }
                    case "group_card":
                        return console.warn(`制作中 group_card 类型`);
                    case "offline_file":
                        return console.warn(`制作中 offline_file 类型`);
                    default:
                        return console.warn(`未知的 notice 类型: ${notice_type}`);
                }
            }
            case "request": {
                let request_type = json["request_type"];
                switch (request_type) {
                    case "friend":
                        return this._eventBus.handle([post_type, request_type], json);
                    case "group": {
                        let subType = json["sub_type"];
                        switch (subType) {
                            case "add":
                            case "invite":
                                return this._eventBus.handle([post_type, request_type, subType], json);
                            default:
                                return console.warn(`未知的 request.group 类型: ${subType}`);
                        }
                    }
                    default:
                        return console.warn(`未知的 request 类型: ${request_type}`);
                }
            }
            case "meta_event": {
                let meta_event_type = json["meta_event_type"];
                switch (meta_event_type) {
                    case "lifecycle":
                    case "heartbeat":
                        return this._eventBus.handle([post_type, meta_event_type], json);
                    default:
                        return console.warn(`未知的 meta_event 类型: ${meta_event_type}`);
                }
            }
            default:
                return console.warn(`未知的上报类型: ${post_type}`);
        }
    }
    /**
     * - CONNECTING = 0 连接中
     * - OPEN = 1 已连接
     * - CLOSING = 2 关闭中
     * - CLOSED = 3 已关闭
     * @return {number}
     */
    get state() {
        return this._socketEVENT.readyState;
    }
    get qq() {
        return this._qq;
    }
}
exports.CQWebSocket = CQWebSocket;
//# sourceMappingURL=websocket.js.map