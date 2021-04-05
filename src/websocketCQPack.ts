import shortid from "shortid";
import {ICloseEvent, IMessageEvent, w3cwebsocket} from "websocket";
import {CQEventBus} from "./event-bus";
import {
  APIRequest, APIResponse, CQWebSocketOptions, ErrorAPIResponse, ErrorEventHandle, HandleEventType, PromiseRes,
  SocketHandle, SocketHandleArray, SocketType,
} from "./Interfaces";
import {CQ} from "./tags";

export class WebSocketCQPack {
  /**消息发送成功时调用*/
  public messageSuccess: onSuccess<any>;
  /**消息发送失败时调用*/
  public messageFail: onFailure;
  
  public reconnection?: Reconnection;
  
  private _responseHandlers: Map<string, ResponseHandler>;
  private _eventBus: CQEventBus;
  
  private readonly _qq: number;
  private readonly _accessToken: string;
  private readonly _baseUrl: string;
  private readonly _debug: boolean;
  private _socketAPI?: w3cwebsocket;
  private _socketEVENT?: w3cwebsocket;
  
  constructor({
    // connectivity configs
    accessToken = "",
    baseUrl = "ws://127.0.0.1:6700",
    
    // application aware configs
    qq = -1,
    
    // Reconnection configs
    reconnection = false,
    reconnectionAttempts = 10,
    reconnectionDelay = 1000,
  }: CQWebSocketOptions = {}, debug = false) {
    this._debug = Boolean(debug);
    this._responseHandlers = new Map();
    this._eventBus = new CQEventBus();
    if (reconnection) {
      this.reconnection = {
        times: 0,
        timesMax: reconnectionAttempts,
        delay: reconnectionDelay,
      };
      this._eventBus.on("socket.close", (e, _, code: number) => {
        if (code !== 1006) return;
        if (!this.reconnection || this.reconnection.timeout) return;
        if (this.reconnection.times++ < this.reconnection.timesMax) {
          this.reconnection.timeout = setTimeout(() => {
            this.reconnect();
          }, this.reconnection.delay);
        } else {
          console.error("Number of reconnections exceeded");
        }
      });
    }
    this._qq = qq;
    this._accessToken = accessToken;
    this._baseUrl = baseUrl;
    this.messageSuccess = (ret) => console.log(`发送成功:${parseInt(ret.echo, 36)}`);
    this.messageFail = (reason) => console.log(`发送失败[${reason.retcode}]:${reason.wording}`);
  }
  
  public reconnect(): void {
    this.disconnect();
    this.connect();
  }
  
  public connect(): void {
    {
      let urlAPI = `${this._baseUrl}/api/?access_token=${this._accessToken}`;
      this._socketAPI = new w3cwebsocket(urlAPI);
      this._socketAPI.onopen = () => this._open("api");
      this._socketAPI.onclose = evt => {
        this._close(evt, "api");
        this._socketAPI = undefined;
      };
      this._socketAPI.onmessage = evt => this._onmessageAPI(evt);
    }
    {
      let urlEVENT = `${this._baseUrl}/event/?access_token=${this._accessToken}`;
      this._socketEVENT = new w3cwebsocket(urlEVENT);
      this._socketEVENT.onopen = () => this._open("event");
      this._socketEVENT.onclose = evt => {
        this._close(evt, "event");
        this._socketEVENT = undefined;
      };
      this._socketEVENT.onmessage = evt => this._onmessage(evt);
    }
    if (this._debug) {
      this._socketAPI.onmessage = evt => {
        console.log(evt);
        this._onmessageAPI(evt);
      };
      this._socketEVENT.onmessage = evt => {
        console.log(evt);
        this._onmessage(evt);
      };
    }
  }
  
  public disconnect(): void {
    if (this.reconnection && this.reconnection.timeout) {
      clearTimeout(this.reconnection.timeout);
      this.reconnection.timeout = undefined;
    }
    if (this._socketAPI !== undefined) {
      this._socketAPI.close(1000, "Normal connection closure");
      this._socketAPI = undefined;
    }
    if (this._socketEVENT !== undefined) {
      this._socketEVENT.close(1000, "Normal connection closure");
      this._socketEVENT = undefined;
    }
  }
  
  public send<T = any>(method: string, params: any): PromiseRes<T> {
    if (this._socketAPI === undefined) {
      return Promise.reject(<ErrorAPIResponse>{
        data: null,
        echo: undefined,
        msg: "",
        retcode: 500,
        status: "NO CONNECTED",
        wording: "无连接",
      });
    }
    if (this.state === w3cwebsocket.CLOSING) {
      return Promise.reject(<ErrorAPIResponse>{
        data: null,
        echo: undefined,
        msg: "",
        retcode: 501,
        status: "CONNECT CLOSING",
        wording: "连接关闭",
      });
    }
    let echo = WebSocketCQPack.GetECHO();
    let message: APIRequest = {
      action: method,
      params: params,
      echo: echo,
    };
    if (this._debug) {
      console.log(message);
    }
    return new Promise<T>((resolve, reject) => {
      let onSuccess: onSuccess<T> = (resp: APIResponse<T>) => {
        this._responseHandlers.delete(echo);
        return resolve(resp.data);
      };
      let onFailure: onFailure = (err) => {
        this._responseHandlers.delete(echo);
        return reject(err);
      };
      this._responseHandlers.set(echo, {message, onSuccess, onFailure});
      this._eventBus.handle("api.preSend", message);
      if (this._socketAPI === undefined) {
        onFailure({
          data: null,
          echo: undefined,
          msg: "",
          retcode: 500,
          status: "NO CONNECTED",
          wording: "无连接",
        }, message);
      } else {
        this._socketAPI.send(JSON.stringify(message));
      }
    });
  }
  
  /**
   * 注册监听方法，解除监听调用 [off]{@link off} 方法<br/>
   * 若要只执行一次，请调用 [once]{@link once} 方法
   * @param event
   * @param handle
   * @return 用于当作参数调用 [off]{@link off} 解除监听
   */
  public on<T extends HandleEventType>(event: T, handle: SocketHandle[T]): SocketHandle[T] {
    this._eventBus.on(event, handle);
    return handle;
  }
  
  /**
   * 只执行一次，执行后删除方法
   * @param event
   * @param handle
   * @return 用于当作参数调用 [off]{@link off} 解除监听
   */
  public once<T extends HandleEventType>(event: T, handle: SocketHandle[T]): SocketHandle[T] {
    this._eventBus.once(event, handle);
    return handle;
  }
  
  /**
   * 解除监听方法,注册监听调用 [on]{@link on} 方法,或 [once]{@link once} 方法
   * @param event
   * @param handle
   */
  public off<T extends HandleEventType>(event: T, handle: SocketHandle[T]): this {
    this._eventBus.off(event, handle);
    return this;
  }
  
  /**
   * 同时注册多种监听方法,解除监听调用 [unbind]{@link unbind} 方法<br/>
   * 当 `option` 参数为 `onceAll` 时, 也可以手动调用返回值中任意一个方法来解除监听
   * @param option -
   *  - `on` : 相当于为每个方法调用一次 [on]{@link on}<br/>
   *  - `once` : 相当于为每个方法调用一次 [once]{@link once}<br/>
   *  - `onceAll` : 只执行一次，执行后删除本次 `event` 中所有键对应的方法<br/>
   *  - 其他 : 相当于 `on`
   * @param [event={}]
   * @return 用于当作参数调用 [unbind]{@link unbind} 解除监听
   */
  public bind(option: "on" | "once" | "onceAll", event: Partial<SocketHandle> = {}): Partial<SocketHandle> {
    let entries = Object.entries(event) as SocketHandleArray;
    if (option === "onceAll") {
      entries = entries.map(([k, v]) => [
        k, (...args: any) => {
          this.unbind(event);
          // @ts-ignore
          v?.(...args);
        },
      ]);
      event = Object.fromEntries(entries);
    }
    if (option === "once") {
      entries.forEach(([k, v]) => this._eventBus.once(k, v));
    } else {
      entries.forEach(([k, v]) => this._eventBus.on(k, v));
    }
    return event;
  }
  
  /**
   * 同时解除多种监听方法,注册监听调用 [bind]{@link bind} 方法
   * @param [event={}]
   */
  public unbind(event: Partial<SocketHandle> = {}): this {
    (Object.entries(event) as SocketHandleArray).forEach(([k, v]) => {
      this._eventBus.off(k, v);
    });
    return this;
  }
  
  private _open(data: SocketType): void {
    this._eventBus.handle("socket.open", data);
  }
  
  private _onmessageAPI(evt: IMessageEvent): void {
    if (typeof evt.data !== "string") {
      return;
    }
    let json: ErrorAPIResponse = JSON.parse(evt.data);
    if (json.echo) {
      let handler = this._responseHandlers.get(json.echo);
      if (handler === undefined) return;
      if (json.retcode === 0) {
        if (typeof handler.onSuccess === "function") {
          handler.onSuccess(json, handler.message);
          this.messageSuccess(json, handler.message);
        }
      } else {
        if (typeof handler.onFailure === "function") {
          handler.onFailure(json, handler.message);
          this.messageFail(json, handler.message);
        }
      }
      this._eventBus.handle("api.response", json, handler.message);
      return;
    }
  }
  
  private _onmessage(evt: IMessageEvent): void {
    if (typeof evt.data !== "string") {
      return;
    }
    this._handleMSG(JSON.parse(evt.data));
  }
  
  private _close(evt: ICloseEvent, type: SocketType): void {
    if (evt.code === 1000) {
      this._eventBus.handle("socket.close", type, evt.code, evt.reason);
      return;
    }
    this._eventBus.handle("socket.error", type, evt.code, evt.reason);
  }
  
  public static GetECHO(): string {
    // 异步环境下,可以重复,废弃
    // return Date.now().toString(36);
    return shortid.generate();
  }
  
  private _handleMSG(json: any): void | boolean {
    let post_type = json["post_type"];
    switch (post_type) {
      case "message": {
        let messageType = json["message_type"];
        let cqTags = CQ.parse(json.message);
        switch (messageType) {
          case "private":
            return this._eventBus.handle("message.private", json, cqTags);
          case "discuss":
            return this._eventBus.handle("message.discuss", json, cqTags);
          case "group":
            return this._eventBus.handle("message.group", json, cqTags);
          default:
            return console.warn(`未知的消息类型: ${messageType}`);
        }
      }
      case "notice": {
        let notice_type = json["notice_type"];
        switch (notice_type) {
          case "group_upload":
            return this._eventBus.handle("notice.group_upload", json);
          case "group_admin":
            return this._eventBus.handle("notice.group_admin", json);
          case "group_decrease":
            return this._eventBus.handle("notice.group_decrease", json);
          case "group_increase":
            return this._eventBus.handle("notice.group_increase", json);
          case "group_ban":
            return this._eventBus.handle("notice.group_ban", json);
          case "friend_add":
            return this._eventBus.handle("notice.friend_add", json);
          case "group_recall":
            return this._eventBus.handle("notice.group_recall", json);
          case "friend_recall":
            return this._eventBus.handle("notice.friend_recall", json);
          case "notify": {
            let subType = json["sub_type"];
            switch (subType) {
              case "poke":
                if ("group_id" in json) {
                  return this._eventBus.handle("notice.notify.poke.group", json);
                } else {
                  return this._eventBus.handle("notice.notify.poke.friend", json);
                }
              case "lucky_king":
                return this._eventBus.handle("notice.notify.lucky_king", json);
              case "honor":
                return this._eventBus.handle("notice.notify.honor", json);
              default:
                return console.warn(`未知的 notify 类型: ${subType}`);
            }
          }
          case "group_card":
            return this._eventBus.handle("notice.group_card", json);
          case "offline_file":
            return this._eventBus.handle("notice.offline_file", json);
          case "client_status":
            return this._eventBus.handle("notice.client_status", json);
          case "essence":
            return this._eventBus.handle("notice.essence", json);
          default:
            return console.warn(`未知的 notice 类型: ${notice_type}`);
        }
      }
      case "request": {
        let request_type = json["request_type"];
        switch (request_type) {
          case "friend":
            return this._eventBus.handle("request.friend", json);
          case "group":
            return this._eventBus.handle("request.group", json);
          default:
            return console.warn(`未知的 request 类型: ${request_type}`);
        }
      }
      case "meta_event": {
        let meta_event_type = json["meta_event_type"];
        switch (meta_event_type) {
          case "lifecycle":
            return this._eventBus.handle("meta_event.lifecycle", json);
          case "heartbeat":
            return this._eventBus.handle("meta_event.heartbeat", json);
          default:
            return console.warn(`未知的 meta_event 类型: ${meta_event_type}`);
        }
      }
      case "message_sent":
        return this._eventBus.handle("message_sent", json);
      default:
        return console.warn(`未知的上报类型: ${post_type}`);
    }
  }
  
  /**
   * - CONNECTING = 0 连接中
   * - OPEN = 1 已连接
   * - CLOSING = 2 关闭中
   * - CLOSED = 3 已关闭
   */
  public get state(): number {
    if (this._socketAPI === undefined) {
      return w3cwebsocket.CLOSED;
    }
    return this._socketAPI.readyState;
  }
  
  public get qq(): number {
    return this._qq;
  }
  
  public get errorEvent(): ErrorEventHandle {
    return this._eventBus._errorEvent;
  }
  
  public set errorEvent(value: ErrorEventHandle) {
    this._eventBus._errorEvent = value;
  }
}

interface Reconnection {
  times: number
  delay: number
  timesMax: number
  timeout?: NodeJS.Timeout
}

interface ResponseHandler {
  onSuccess: onSuccess<any>
  onFailure: onFailure
  message: APIRequest
}

type onSuccess<T> = (this: void, json: APIResponse<T>, message: APIRequest) => void
type onFailure = (this: void, reason: ErrorAPIResponse, message: APIRequest) => void
