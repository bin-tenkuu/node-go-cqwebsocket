import {HandleEventType} from "./Interfaces";

type dom = {
  [key: string]: [] | dom
}

class Node {
  _child: { [key: string]: Node };
  _name: string;
  _handles: Function[];
  
  private constructor(name: string, parent?: Node) {
    this._name = name;
    this._child = {};
    this._handles = [];
    if (parent !== undefined) {
      parent._child[name] = this;
    }
  }
  
  child(key: string): Node | undefined {
    return this._child[key];
  }
  
  on(handle: Function): void {
    this._handles.push(handle);
  }
  
  off(handle: Function): void {
    let indexOf = this._handles.indexOf(handle);
    if (indexOf >= 0) {
      this._handles.splice(indexOf, 1);
    }
  }
  
  get handles(): Function[] {
    return this._handles;
  }
  
  static parseNode(obj: dom, parent: Node = new Node("root")): Node {
    Object.entries(obj).forEach(([k, v]) => {
      let node = new Node(k, parent);
      if (!(v instanceof Array)) {
        this.parseNode(v, node);
      }
    });
    return parent;
  }
}

export class CQEventBus {
  _EventMap: Node;
  _onceListeners: WeakMap<Function, Function>;
  
  constructor() {
    this._EventMap = Node.parseNode(<dom>{
      message: {
        private: [],
        group: [],
        discuss: [],
      },
      notice: {
        group_upload: [],
        group_admin: [],
        group_decrease: [],
        group_increase: [],
        group_ban: [],
        friend_add: [],
        group_recall: [],
        friend_recall: [],
        notify: {
          poke: {
            friend: [],
            group: [],
          },
          lucky_king: [],
          honor: [],
        },
        group_card: [],
        offline_file: [],
        client_status: [],
        essence: {
          add: [],
          delete: [],
        },
      },
      request: {
        friend: [],
        group: [],
      },
      socket: {
        open: [],
        error: [],
        close: [],
      },
      api: {
        response: [],
        preSend: [],
      },
      meta_event: {
        lifecycle: [],
        heartbeat: [],
      },
      message_sent: [],
    });
    this._onceListeners = new WeakMap();
  }
  
  on(eventType: HandleEventType, handler?: Function) {
    if (typeof handler !== "function") return handler;
    this.get(eventType).on(handler);
    return handler;
  }
  
  once(eventType: HandleEventType, handler?: Function) {
    if (typeof handler !== "function") return handler;
    const onceFunction = (...args: any) => {
      this.off(eventType, handler);
      handler?.(...args);
    };
    this._onceListeners.set(handler, onceFunction);
    this.on(eventType, onceFunction);
    return handler;
  }
  
  off(eventType: HandleEventType | string[], handler?: Function): void {
    if (typeof handler !== "function") return;
    let node = this.get(eventType);
    let fun = <Function>this._onceListeners.get(handler);
    fun = this._onceListeners.delete(handler) ? fun : handler;
    node.off(fun);
  }
  
  /** 有未受支持的消息类型时,将会返回最近的受支持的消息类型 */
  get(eventType: HandleEventType | string[]): Node {
    if (typeof eventType === "string") {
      eventType = eventType.split(".");
    }
    let node: Node | undefined = this._EventMap;
    for (let key of eventType) {
      let nodeP = node;
      node = node.child(key);
      if (node === undefined) {
        console.warn(`未受支持的方法类型：${eventType.join(".")}`);
        return nodeP;
      }
    }
    return node;
  }
  
  async handle(eventType: HandleEventType | string[], ...args: any[]): Promise<void> {
    if (typeof eventType === "string") {
      eventType = eventType.split(".");
    }
    let handles = this.get(eventType).handles;
    let event = new CQEvent();
    for (let handle of handles) {
      try {
        await handle(event, ...args);
        if (event.isCanceled) {
          break;
        }
      } catch (e) {
        console.error(e);
        this.off(eventType, handle);
      }
    }
  }
}

export class CQEvent {
  _isCanceled: boolean;
  
  constructor() {
    this._isCanceled = false;
  }
  
  get isCanceled(): boolean {
    return this._isCanceled;
  }
  
  stopPropagation(): void {
    this._isCanceled = true;
  }
}
