declare interface dom {
  [key: string]: [] | dom
}

export class Node {
  _child: { [key: string]: Node };
  _parent?: Node;
  _name: string;
  _handle: Function[];

  constructor(name: string, parent?: Node) {
    this._name = name;
    this._child = {};
    this._handle = [];
    if (parent) {
      this._parent = parent;
      parent._child[name] = this;
    }
  }

  get hasParent() {
    return this._parent !== undefined && this._parent !== this;
  }

  /**
   * 当没有父节点时,将会返回自身
   */
  get parent() {
    return this._parent || this;
  }

  child(key: string) {
    return this._child[key];
  }

  on(handle: Function) {
    this._handle.push(handle);
  }

  off(handle: Function) {
    let indexOf = this._handle.indexOf(handle);
    if (indexOf >= 0) {
      this._handle.splice(indexOf, 1);
    }
  }

  get handle() {
    return this._handle;
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
    this._EventMap = Node.parseNode({
      message: {
        private: [],
        group: [],
        discuss: [],
      },
      notice: {
        group_upload: [],
        group_admin: {
          set: [],
          unset: [],
        },
        group_decrease: {
          leave: [],
          kick: [],
          kick_me: [],
        },
        group_increase: {
          approve: [],
          invite: [],
        },
        friend_add: [],
        group_ban: {
          ban: [],
          lift_ban: [],
        },
        notify: [],
      },
      request: {
        friend: [],
        group: {
          add: [],
          invite: [],
        },
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
    });
    this._onceListeners = new WeakMap();
  }

  /**
   *
   * @param eventType
   * @param handler
   */
  on(eventType: EventType, handler?: Function) {
    if (!handler) return;
    this.get(eventType).on(handler);
  }

  /**
   *
   * @param eventType
   * @param handler
   */
  once(eventType: EventType, handler?: Function) {
    if (!handler) return;
    const onceFunction = (...args: any[]) => {
      this.off(eventType, handler);
      return handler(...args);
    };
    this._onceListeners.set(handler, onceFunction);
    this.on(eventType, onceFunction);
  }

  /**
   *
   * @param eventType
   * @param handler
   */
  off(eventType: EventType | string[], handler?: Function) {
    if (!handler) return;
    let node = this.get(eventType);
    let fun = <Function>this._onceListeners.get(handler);
    fun = this._onceListeners.delete(handler) ? fun : handler;
    node.off(fun);
  }

  /**
   * 有未受支持的消息类型时,将会放返回最近的受支持的消息类型
   * @param eventType
   * @return
   */
  get(eventType: EventType | string[]): Node {
    if (typeof eventType === "string") {
      eventType = eventType.split(".");
    }
    let node = this._EventMap;
    for (let key of eventType) {
      let nodeP = node;
      node = node.child(key);
      if (node === undefined) {
        console.warn(`未受支持的方法类型：${key}`);
        return nodeP;
      }
    }
    return node;
  }

  /**
   *
   * @param eventType
   * @param args
   * @return {Promise<void>}
   */
  async handle(eventType: EventType | string[], ...args: any[]): Promise<void> {
    if (typeof eventType === "string") {
      eventType = eventType.split(".");
    }
    for (let node = this.get(eventType); node.hasParent; node = node.parent) {
      let event = new CQEvent();
      for (let handle of node.handle) {
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
}

export class CQEvent {
  _isCanceled: boolean;

  constructor() {
    this._isCanceled = false;
  }

  get isCanceled() {
    return this._isCanceled;
  }

  stopPropagation() {
    this._isCanceled = true;
  }

}

export type MessageEventType = "message.private"
  | "message.group"
  | "message.discuss"
export type NoticeEventType = "notice"
  | "notice.group_upload"
  | "notice.group_admin.set"
  | "notice.group_admin.unset"
  | "notice.group_decrease.leave"
  | "notice.group_decrease.kick"
  | "notice.group_decrease.kick_me"
  | "notice.group_increase.approve"
  | "notice.group_increase.invite"
  | "notice.friend_add"
  | "notice.group_ban.ban"
  | "notice.group_ban.lift_ban"
  | "notice.notify"
export type RequestEventType = "request.friend" | "request.group.add" | "request.group.invite"
export type SocketEventType = "socket.open" | "socket.error" | "socket.close"
export type APIEventType = "api.response" | "api.preSend"
export type MetaEventType = "meta_event.lifecycle" | "meta_event.heartbeat"
export  type EventType =
  MessageEventType
  | NoticeEventType
  | RequestEventType
  | SocketEventType
  | APIEventType
  | MetaEventType
