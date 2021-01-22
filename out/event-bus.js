"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CQEvent = exports.CQEventBus = void 0;
class Node {
    constructor(name, parent) {
        this._name = name;
        this._child = {};
        this._handle = [];
        if (parent) {
            this._parent = parent;
            parent._child[name] = this;
        }
    }
    get hasParent() {
        return this._parent !== undefined;
    }
    /**
     * 当没有父节点时,将会返回自身
     */
    get parent() {
        return this._parent || this;
    }
    child(key) {
        return this._child[key];
    }
    on(handle) {
        this._handle.push(handle);
    }
    off(handle) {
        let indexOf = this._handle.indexOf(handle);
        if (indexOf >= 0) {
            this._handle.splice(indexOf, 1);
        }
    }
    get handle() {
        return this._handle;
    }
    static parseNode(obj, parent = new Node("root")) {
        Object.entries(obj).forEach(([k, v]) => {
            let node = new Node(k, parent);
            if (!(v instanceof Array)) {
                this.parseNode(v, node);
            }
        });
        return parent;
    }
}
class CQEventBus {
    constructor() {
        this._EventMap = Node.parseNode({
            message: {
                private: [],
                group: {
                    "@me": [],
                },
                discuss: {
                    "@me": [],
                },
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
                message: [],
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
    on(eventType, handler) {
        this.get(eventType).on(handler);
    }
    /**
     *
     * @param eventType
     * @param handler
     */
    once(eventType, handler) {
        const onceFunction = (...args) => {
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
    off(eventType, handler) {
        let node = this.get(eventType);
        let fun = this._onceListeners.get(handler);
        fun = this._onceListeners.delete(handler) ? fun : handler;
        node.off(fun);
    }
    /**
     * 有未受支持的消息类型时,将会放返回最近的受支持的消息类型
     * @param eventType
     * @return
     */
    get(eventType) {
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
    async handle(eventType, ...args) {
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
                }
                catch (e) {
                    console.error(e);
                    this.off(eventType, handle);
                }
            }
        }
    }
}
exports.CQEventBus = CQEventBus;
class CQEvent {
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
exports.CQEvent = CQEvent;
//# sourceMappingURL=event-bus.js.map