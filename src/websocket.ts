import {ICloseEvent, IMessageEvent, w3cwebsocket} from "websocket";
import {CQEvent, CQEventBus, EventType, MessageEventType} from "./event-bus";
import {CQTag, parse} from "./tags";


const shortid = require("shortid");

export class WebSocketCQ {
  public messageSuccess: onSuccess<any>;
  public messageFail: onFailure;

  public reconnection?: Reconnection;

  private _responseHandlers: Map<string, ResponseHandler>;
  private _eventBus: CQEventBus;

  private readonly _qq: number;
  private readonly _accessToken: string;
  private readonly _baseUrl: string;
  // @ts-ignore
  private _socketAPI: w3cwebsocket;
  // @ts-ignore
  private _socketEVENT: w3cwebsocket;

  constructor({
                // connectivity configs
                accessToken = "",
                baseUrl = "ws://127.0.0.1:6700",

                // application aware configs
                qq = -1,

                // Reconnection configs
                reconnection = true,
                reconnectionAttempts = 10,
                reconnectionDelay = 1000,
              }: options = {}) {
    /**
     *
     * @type {Map<string, {onSuccess:onSuccess,onFailure:onFailure}>}
     * @private
     */
    this._responseHandlers = new Map();
    this._eventBus = new CQEventBus();
    if (reconnection) {
      let reconnection = this.reconnection = {
        times: 0,
        timesMax: reconnectionAttempts,
        delay: reconnectionDelay,
        timeout: 0,
      };
      this._eventBus.on("socket.close", (code: number) => {
        if (code !== 1006) return;
        // @ts-ignore
        if (reconnection.times++ < this.reconnection.timesMax) {
          // @ts-ignore
          this.reconnection.timeout = setTimeout(() => {
            this.reconnect();
            // @ts-ignore
          }, this.reconnection.delay);
        } else {
          console.error("Number of reconnections exceeded");
        }
      });
    }

    this._qq = qq;
    this._accessToken = accessToken;
    this._baseUrl = baseUrl;

    this.messageSuccess = (ret) => {
      console.log(`发送成功`, ret.data);
      return ret.data;
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
      this._socketAPI = new w3cwebsocket(urlAPI);
      this._socketAPI.onopen = () => this._open("api");
      this._socketAPI.onclose = evt => this._close(evt, "api");
      this._socketAPI.onmessage = evt => this._onmessageAPI(evt);
    }
    {
      let urlEVENT = `${this._baseUrl}/event/?access_token=${this._accessToken}`;
      this._socketEVENT = new w3cwebsocket(urlEVENT);
      this._socketEVENT.onopen = () => this._open("event");
      this._socketEVENT.onclose = evt => this._close(evt, "event");
      this._socketEVENT.onmessage = evt => this._onmessage(evt);
    }
  }

  public disconnect() {
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
  send(method: string, params: any): Promise<APIResponse<any>> {
    return new Promise((resolve, reject) => {
      let reqId = shortid.generate();

      const onSuccess = (ctxt: APIResponse<any>) => {
        this._responseHandlers.delete(reqId);
        delete ctxt.echo;
        resolve(ctxt);
      };

      const onFailure: onFailure = (err) => {
        this._responseHandlers.delete(reqId);
        reject(err);
      };

      const message: APIRequest = {
        action: method,
        params: params,
        echo: reqId,
      };
      this._responseHandlers.set(reqId, {message, onSuccess, onFailure});

      this._eventBus.handle("api.preSend", message).then(() => {
        this._socketAPI.send(JSON.stringify(message));
      });

    });
  }

  /**
   * | eventType | handler |
   * |-|-|
   * |"socket.open"| (type: string) => void |
   * |"socket.close"|(code: number, reason: string, type: string) => void|
   * |"api.preSend"|(message: APIRequest) => void|
   * |`MessageEventType`|(event: CQEvent, message: any, CQTag: CQTag[]) => void|
   * |`EventType`|(event: CQEvent, message: any) => void|
   * @param eventType
   * @param handler
   * @return
   * @see MessageEventType
   * @see EventType
   */
  public on(eventType: EventType, handler: (...args: any) => void): this {
    this._eventBus.on(eventType, handler);
    return this;
  }

  /**
   * | eventType | handler |
   * |-|-|
   * |"socket.open"| (type: string) => void |
   * |"socket.close"|(code: number, reason: string, type: string) => void|
   * |"api.preSend"|(message: APIRequest) => void|
   * |`MessageEventType`|(event: CQEvent, message: any, CQTag: CQTag[]) => void|
   * |`EventType`|(event: CQEvent, message: any) => void|
   * @param eventType
   * @param handler
   * @return
   * @see MessageEventType
   * @see EventType
   */
  public once(eventType: EventType, handler: (evt: CQEvent, msg: any, tags: CQTag[]) => void): this {
    this._eventBus.once(eventType, handler);
    return this;
  }

  /**
   * | eventType | handler |
   * |-|-|
   * |"socket.open"| (type: string) => void |
   * |"socket.close"|(code: number, reason: string, type: string) => void|
   * |"api.preSend"|(message: APIRequest) => void|
   * |`MessageEventType`|(event: CQEvent, message: any, CQTag: CQTag[]) => void|
   * |`EventType`|(event: CQEvent, message: any) => void|
   * @param eventType
   * @param handler
   * @return
   * @see MessageEventType
   * @see EventType
   */
  public off(eventType: EventType, handler: (evt: CQEvent, msg: any, tags: CQTag[]) => void): this {
    this._eventBus.off(eventType, handler);
    return this;
  }

  private _open(data: SocketType) {
    return this._eventBus.handle("socket.open", data);
  }

  private _onmessageAPI(evt: IMessageEvent) {
    if (typeof evt.data !== "string") {
      return;
    }
    let json: ErrorAPIResponse<any> = JSON.parse(evt.data);
    if (json.echo) {
      let {onSuccess, onFailure} = this._responseHandlers.get(json.echo) || {};
      if (json.retcode < 100) {
        if (typeof onSuccess === "function") {
          onSuccess(json);
        }
      } else {
        if (typeof onFailure === "function") {
          onFailure(json);
        }
      }
      this._eventBus.handle("api.response", json).then();
      return;
    }
  }

  private _onmessage(evt: IMessageEvent) {
    if (typeof evt.data !== "string") {
      return;
    }
    let json: APIResponse<any> = JSON.parse(evt.data);
    return this._handleMSG(json);
  }

  private _close(evt: ICloseEvent, type: SocketType) {
    if (evt.code === 1000) {
      return this._eventBus.handle("socket.close", evt.code, evt.reason, type);
    } else {
      return this._eventBus.handle("socket.error", evt.code, evt.reason, type);
    }
  }

  private _handleMSG(json: any) {
    let post_type = json["post_type"];
    switch (post_type) {
      case "message": {
        let messageType = json["message_type"];
        let cqTags = parse(json.message);
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
  public get state() {
    return this._socketEVENT.readyState;
  }

  public get qq() {
    return this._qq;
  }
}

export type onSuccess<T> = (json: APIResponse<T>) => T;
export type onFailure = (reason: ErrorAPIResponse<any>) => void;
export type SocketType = "api" | "event"

export interface Reconnection {
  times: number;
  delay: number;
  timesMax: number;
  timeout: number
}

export interface options {
  accessToken?: string,
  baseUrl?: string,
  qq?: number,
  reconnection?: boolean,
  reconnectionAttempts?: number,
  reconnectionDelay?: number,
}

export interface APIRequest {
  action: string,
  params: CQTag[] | string,
  echo: any,
}

export interface MessageId {
  message_id: number
}

export interface APIResponse<T> {
  status: string,
  /**
   * |retcode|说明|
   * |-|-|
   * |0|同时 status 为 ok，表示操作成功|
   * |1|同时 status 为 async，表示操作已进入异步执行，具体结果未知|
   * |100|参数缺失或参数无效，通常是因为没有传入必要参数，某些接口中也可能因为参数明显无效（比如传入的 QQ 号小于等于 0，此时无需调用 酷Q 函数即可确定失败），此项和以下的 status 均为 failed|
   * |102|酷Q 函数返回的数据无效，一般是因为传入参数有效但没有权限，比如试图获取没有加入的群组的成员列表|
   * |103|操作失败，一般是因为用户权限不足，或文件系统异常、不符合预期|
   * |104|由于 酷Q 提供的凭证（Cookie 和 CSRF Token）失效导致请求 QQ 相关接口失败，可尝试清除 酷Q 缓存来解决|
   * |201|工作线程池未正确初始化（无法执行异步任务）|
   */
  retcode: number
  data: T | null
  echo: any
}

export interface ErrorAPIResponse<T> extends APIResponse<T> {
  data: null
  mag: string
  wording: string
}

export interface ResponseHandler {
  onSuccess: (json: APIResponse<any>) => void;
  onFailure: (reason: ErrorAPIResponse<any>) => void;
  message: APIRequest
}
