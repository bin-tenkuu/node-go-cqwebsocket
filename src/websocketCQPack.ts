import shortid from "shortid";
import {ICloseEvent, IMessageEvent, w3cwebsocket} from "websocket";
import {CQEventBus} from "./event-bus";
import {
  APIRequest, APIResponse, CQWebSocketOptions, ErrorAPIResponse, HandleEventType, PromiseRes, SocketHandle, SocketType,
} from "./Interfaces";
import {CQ} from "./tags";

export class WebSocketCQPack {
  public messageSuccess: <T>(json: T) => void;
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
              }: CQWebSocketOptions = {}, debug?: true) {
    this._debug = Boolean(debug);
    this._responseHandlers = new Map();
    this._eventBus = new CQEventBus();
    if (reconnection) {
      this.reconnection = {
        times: 0,
        timesMax: reconnectionAttempts,
        delay: reconnectionDelay,
      };
      this._eventBus.on("socket.close", (code: number) => {
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
    this.messageSuccess = (ret) => console.log(`发送成功`, ret);
    this.messageFail = (reason) => console.log(`发送失败`, reason);
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
      this._socketAPI.onclose = evt => this._close(evt, "api").then(() => {
        this._socketAPI = undefined;
      });
      this._socketAPI.onmessage = evt => this._onmessageAPI(evt);
    }
    {
      let urlEVENT = `${this._baseUrl}/event/?access_token=${this._accessToken}`;
      this._socketEVENT = new w3cwebsocket(urlEVENT);
      this._socketEVENT.onopen = () => this._open("event");
      this._socketEVENT.onclose = evt => this._close(evt, "event").then(() => {
        this._socketEVENT = undefined;
      });
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
    if (this._socketAPI == undefined) {
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
    let echo = shortid.generate();
    let message: APIRequest = {
      action: method,
      params: params,
      echo: echo,
    };
    if (this._debug) {
      console.log(message);
    }
    return new Promise<T>((resolve, reject) => {
      let onSuccess = (resp: APIResponse<T>) => {
        this._responseHandlers.delete(echo);
        delete resp.echo;
        resolve(resp.data);
      };
      let onFailure: onFailure = (err) => {
        this._responseHandlers.delete(echo);
        reject(err);
      };
      this._responseHandlers.set(echo, {message, onSuccess, onFailure});
      this._eventBus.handle("api.preSend", message).then(() => {
        if (this._socketAPI == undefined) {
          onFailure({
            data: null,
            echo: undefined,
            msg: "",
            retcode: 500,
            status: "NO CONNECTED",
            wording: "无连接",
          });
        } else {
          this._socketAPI.send(JSON.stringify(message));
        }
      });
      
    });
  }
  
  /**
   * 注册监听方法，解除监听调用 [off]{@link off} 方法<br/>
   * 若要只执行一次，请调用 [once]{@link once} 方法
   * @param event
   * @param handle
   * @return 用于当作参数调用 [off]{@link off} 解除监听
   */
  public on<T extends HandleEventType>(event: T, handle: SocketHandle[T]): Function | undefined {
    return this._eventBus.on(event, handle);
  }
  
  /**
   * 只执行一次，执行后删除方法
   * @param event
   * @param handle
   * @return 用于当作参数调用 [off]{@link off} 解除监听
   */
  public once<T extends HandleEventType>(event: T, handle: SocketHandle[T]): Function | undefined {
    return this._eventBus.once(event, handle);
  }
  
  /**
   * 解除监听方法,注册监听调用 [on]{@link on} 方法,或 [once]{@link once} 方法
   * @param event
   * @param handle
   */
  public off(event: HandleEventType, handle?: Function): void {
    this._eventBus.off(event, handle);
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
  public bind(option: "on" | "once" | "onceAll", event: SocketHandle = {}): SocketHandle {
    let entries = Object.entries(event);
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
    if (option == "once") {
      entries.forEach(([k, v]) => this._eventBus.once(<HandleEventType>k, v));
    } else {
      entries.forEach(([k, v]) => this._eventBus.on(<HandleEventType>k, v));
    }
    return event;
  }
  
  /**
   * 同时解除多种监听方法,注册监听调用 [bind]{@link bind} 方法
   * @param [event={}]
   */
  public unbind(event: SocketHandle = {}): void {
    Object.entries(event).forEach(([k, v]) => {
      this._eventBus.off(<HandleEventType>k, v);
    });
  }
  
  private _open(data: SocketType): Promise<void> {
    return this._eventBus.handle("socket.open", data);
  }
  
  private _onmessageAPI(evt: IMessageEvent): void {
    if (typeof evt.data !== "string") {
      return;
    }
    let json: ErrorAPIResponse = JSON.parse(evt.data);
    if (json.echo) {
      let {onSuccess, onFailure, message} = this._responseHandlers.get(json.echo) || {};
      if (json.retcode === 0) {
        if (typeof onSuccess === "function") {
          onSuccess(json);
        }
      } else {
        if (typeof onFailure === "function") {
          onFailure(json);
        }
      }
      this._eventBus.handle("api.response", json, message).then();
      return;
    }
  }
  
  private _onmessage(evt: IMessageEvent): void | Promise<void> {
    if (typeof evt.data !== "string") {
      return;
    }
    let json: APIResponse<any> = JSON.parse(evt.data);
    return this._handleMSG(json);
  }
  
  private _close(evt: ICloseEvent, type: SocketType): Promise<void> {
    if (evt.code === 1000) {
      return this._eventBus.handle("socket.close", type, evt.code, evt.reason);
    }
    return this._eventBus.handle("socket.error", type, evt.code, evt.reason);
  }
  
  private _handleMSG(json: any): void | Promise<void> {
    let post_type = json["post_type"];
    switch (post_type) {
      case "message": {
        let messageType = json["message_type"];
        let cqTags = CQ.parse(json.message);
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
          case "group_recall":
          case "friend_recall":
            return this._eventBus.handle([post_type, notice_type], json);
          case "notify": {
            let subType = json["sub_type"];
            switch (subType) {
              case "poke":
                if ("group_id" in json) {
                  return this._eventBus.handle([post_type, notice_type, subType, "group"], json);
                } else {
                  return this._eventBus.handle([post_type, notice_type, subType, "friend"], json);
                }
              case "lucky_king":
              case "honor":
                return this._eventBus.handle([post_type, notice_type, subType], json);
              default:
                return console.warn(`未知的 notify 类型: ${subType}`);
            }
          }
          case "group_card":
          case "offline_file":
          case "client_status":
            return this._eventBus.handle([post_type, notice_type], json);
          case "essence": {
            let subType = json["sub_type"];
            switch (subType) {
              case "add":
              case "delete":
                return this._eventBus.handle([post_type, notice_type, subType], json);
              default:
                return console.warn(`未知的 notice.essence 类型: ${subType}`);
            }
          }
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
   */
  public get state(): number {
    if (this._socketAPI == undefined) {
      return w3cwebsocket.CLOSED;
    }
    return this._socketAPI.readyState;
  }
  
  public get qq(): number {
    return this._qq;
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

type onSuccess<T> = (this: void, json: APIResponse<T>) => void
type onFailure = (this: void, reason: ErrorAPIResponse) => void
