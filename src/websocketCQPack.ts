import shortid from "shortid";
import {ICloseEvent, IMessageEvent, w3cwebsocket} from "websocket";
import {
  APIRequest, APIResponse, CQEvent, CQEventEmitter, CQWebSocketOptions, ErrorAPIResponse, ErrorEventHandle,
  HandleEventParam, HandleEventType, ObjectEntries, PromiseRes, SocketHandle, Status,
} from "./Interfaces";
import {CQ} from "./tags";

export class WebSocketCQPack {
  /**消息发送成功时自动调用*/
  public messageSuccess: onSuccess<any>;
  /**消息发送失败时自动调用*/
  public messageFail: onFailure;
  
  private _responseHandlers: Map<string, ResponseHandler>;
  private _eventBus: CQEventBus;
  
  private readonly _accessToken: string;
  private readonly _baseUrl: string;
  private readonly _debug: boolean;
  private _socket?: w3cwebsocket;
  
  constructor({
    // connectivity configs
    accessToken = "",
    baseUrl = "ws://127.0.0.1:6700",
  }: CQWebSocketOptions = {}, debug = false) {
    this._debug = Boolean(debug);
    this._responseHandlers = new Map();
    this._eventBus = new CQEventBus();
    this._accessToken = accessToken;
    this._baseUrl = baseUrl;
    this.messageSuccess = (ret) => console.log(`发送成功:${parseInt(ret.echo, 36)}`);
    this.messageFail = (reason) => console.log(`发送失败[${reason.retcode}]:${reason.wording}`);
    this.errorEvent = (error) => console.error("调用API失败", error);
  }
  
  /**重连*/
  public reconnect(): void {
    this.disconnect();
    this.connect();
  }
  
  /**连接*/
  public connect(): void {
    let urlAPI = `${this._baseUrl}/?access_token=${this._accessToken}`;
    this._socket = new w3cwebsocket(urlAPI);
    this._socket.onopen = () => this._open();
    this._socket.onclose = evt => {
      this._close(evt);
      this._socket = undefined;
    };
    this._socket.onmessage = evt => this._onmessage(evt);
  }
  
  /**断开*/
  public disconnect(): void {
    if (this._socket !== undefined) {
      this._socket.close(1000, "Normal connection closure");
      this._socket = undefined;
    }
  }
  
  /**
   * 发送消息
   * @param method api名称
   * @param params 消息内容
   * @return api调用结果
   */
  public send<T = any>(method: string, params: any): PromiseRes<T> {
    if (this._socket === undefined) {
      return Promise.reject(<ErrorAPIResponse>{
        data: null,
        echo: undefined,
        msg: "",
        retcode: 500,
        status: "NO CONNECTED",
        wording: "无连接",
      });
    }
    if (this._socket.readyState === w3cwebsocket.CLOSING) {
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
      this._eventBus.emit("api.preSend", message);
      if (this._socket === undefined) {
        onFailure({
          data: null,
          echo: undefined,
          msg: "",
          retcode: 500,
          status: "NO CONNECTED",
          wording: "无连接",
        }, message);
      } else {
        this._socket.send(JSON.stringify(message));
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
    let entries = Object.entries(event) as ObjectEntries<SocketHandle>;
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
    (Object.entries(event) as ObjectEntries<SocketHandle>).forEach(([k, v]) => {
      this._eventBus.off(k, v);
    });
    return this;
  }
  
  private _open(): void {
    this._eventBus.emit("socket.open");
  }
  
  private _onmessage(evt: IMessageEvent): void {
    if (typeof evt.data !== "string") {
      return;
    }
    let json: ErrorAPIResponse = JSON.parse(evt.data);
    if (this._debug) console.log(json);
    if (json.echo === undefined) {
      this._eventBus.handleMSG(json);
      return;
    }
    let handler = this._responseHandlers.get(json.echo);
    if (handler === undefined) return;
    let message = handler.message;
    if (json.retcode <= 1) {
      handler.onSuccess(json, message);
      this.messageSuccess(json, message);
    } else {
      handler.onFailure(json, message);
      this.messageFail(json, message);
    }
    this._eventBus.emit("api.response", json, message);
    return;
  }
  
  private _close(evt: ICloseEvent): void {
    if (evt.code === 1000) {
      this._eventBus.emit("socket.close", evt.code, evt.reason);
      return;
    }
    this._eventBus.emit("socket.error", evt.code, evt.reason);
  }
  
  /**
   * 获取随机ID <br/>
   * 原本实现为 `return Date.now().toString(36);`, 后发现异步环境下方法调用可以达到毫秒级以内, 故废弃
   */
  public static GetECHO(): string {
    return shortid.generate();
  }
  
  /**状态信息*/
  public get state(): Status | undefined {
    return this._eventBus.data.status;
  }
  
  /**获取当前登录账号的 QQ 号, 当获取失败时返回 `-1`*/
  public get qq(): number {
    return this._eventBus.data.qq ?? -1;
  }
  
  public get errorEvent(): ErrorEventHandle {
    return this._eventBus._errorEvent;
  }
  
  public set errorEvent(value: ErrorEventHandle) {
    this._eventBus._errorEvent = value;
  }
}

interface ResponseHandler {
  onSuccess: onSuccess<any>
  onFailure: onFailure
  message: APIRequest
}

type onSuccess<T> = (this: void, json: APIResponse<T>, message: APIRequest) => void
type onFailure = (this: void, reason: ErrorAPIResponse, message: APIRequest) => void

interface BotData {
  qq: number
  status: Status
}

export class CQEventBus extends CQEventEmitter<SocketHandle> {
  public _errorEvent: ErrorEventHandle;
  public data: Partial<BotData>;
  
  constructor() {
    super({captureRejections: true});
    this.setMaxListeners(0);
    this._errorEvent = (e) => {
      console.error(e);
    };
    this.data = {};
  }
  
  protected message(json: any): void | boolean {
    let messageType = json["message_type"];
    let cqTags = CQ.parse(json.message);
    switch (messageType) {
      case "private":
        return this.emit("message.private", json, cqTags);
      case "discuss":
        return this.emit("message.discuss", json, cqTags);
      case "group":
        return this.emit("message.group", json, cqTags);
      default:
        return console.warn(`未知的消息类型: ${messageType}`);
    }
  }
  
  protected "notice.notify"(json: any): void | boolean {
    let subType = json["sub_type"];
    switch (subType) {
      case "poke":
        if (Reflect.has(json, "group_id")) {
          return this.emit("notice.notify.poke.group", json);
        } else {
          return this.emit("notice.notify.poke.friend", json);
        }
      case "lucky_king":
        return this.emit("notice.notify.lucky_king", json);
      case "honor":
        return this.emit("notice.notify.honor", json);
      default:
        return console.warn(`未知的 notify 类型: ${subType}`);
    }
  }
  
  protected notice(json: any): void | boolean {
    let notice_type = json["notice_type"];
    switch (notice_type) {
      case "group_upload":
        return this.emit("notice.group_upload", json);
      case "group_admin":
        return this.emit("notice.group_admin", json);
      case "group_decrease":
        return this.emit("notice.group_decrease", json);
      case "group_increase":
        return this.emit("notice.group_increase", json);
      case "group_ban":
        return this.emit("notice.group_ban", json);
      case "friend_add":
        return this.emit("notice.friend_add", json);
      case "group_recall":
        return this.emit("notice.group_recall", json);
      case "friend_recall":
        return this.emit("notice.friend_recall", json);
      case "notify":
        return this["notice.notify"](json);
      case "group_card":
        return this.emit("notice.group_card", json);
      case "offline_file":
        return this.emit("notice.offline_file", json);
      case "client_status":
        return this.emit("notice.client_status", json);
      case "essence":
        return this.emit("notice.essence", json);
      default:
        return console.warn(`未知的 notice 类型: ${notice_type}`);
    }
  }
  
  protected request(json: any): void | boolean {
    let request_type = json["request_type"];
    switch (request_type) {
      case "friend":
        return this.emit("request.friend", json);
      case "group":
        return this.emit("request.group", json);
      default:
        return console.warn(`未知的 request 类型: ${request_type}`);
    }
  }
  
  protected meta_event(json: any): void | boolean {
    let meta_event_type = json["meta_event_type"];
    switch (meta_event_type) {
      case "lifecycle":
        this.data.qq = json["self_id"];
        return this.emit("meta_event.lifecycle", json);
      case "heartbeat":
        this.data.status = json["status"];
        return this.emit("meta_event.heartbeat", json);
      default:
        return console.warn(`未知的 meta_event 类型: ${meta_event_type}`);
    }
  }
  
  protected message_sent(json: any): void | boolean {
    return this.emit("message_sent", json);
  }
  
  public handleMSG(json: any): void | boolean {
    let post_type = json["post_type"];
    if (Reflect.has(this, post_type)) {
      return (<any>this)[post_type](json);
    } else {
      return console.warn(`未知的上报类型: ${post_type}`);
    }
  }
  
  emit<T extends HandleEventType>(type: T, ...args: HandleEventParam<SocketHandle, T>): boolean {
    let event = new CQEvent();
    const handlers: Function | Function[] | undefined = this._events[type];
    if (handlers === undefined) return false;
    if (typeof handlers === "function") {
      try {
        handlers(event, ...args);
      } catch (e) {
        Reflect.deleteProperty(this._events, type);
        this._errorEvent(e, type, handlers as SocketHandle[T]);
      }
    } else {
      let len = handlers.length;
      for (let i = 0; i < len; i++) {
        try {
          handlers[i](event, ...args);
          if (event.isCanceled) {
            break;
          }
        } catch (e) {
          let func = handlers.splice(i, 1)[0];
          this._errorEvent(e, type, func as SocketHandle[T]);
          len--;
          i--;
        }
      }
    }
    return true;
  }
}