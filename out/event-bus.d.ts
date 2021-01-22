interface dom {
    [key: string]: [] | dom;
}
declare class Node {
    _child: {
        [key: string]: Node;
    };
    _parent?: Node;
    _name: string;
    _handle: Function[];
    constructor(name: string, parent?: Node);
    get hasParent(): boolean;
    /**
     * 当没有父节点时,将会返回自身
     */
    get parent(): Node;
    child(key: string): Node;
    on(handle: Function): void;
    off(handle: Function): void;
    get handle(): Function[];
    static parseNode(obj: dom, parent?: Node): Node;
}
export declare type MessageEventType = "message" | "message.private" | "message.group" | "message.group.@me" | "message.discuss" | "message.discuss.@me";
export declare type NoticeEventType = "notice" | "notice.group_upload" | "notice.group_admin.set" | "notice.group_admin.unset" | "notice.group_decrease.leave" | "notice.group_decrease.kick" | "notice.group_decrease.kick_me" | "notice.group_increase.approve" | "notice.group_increase.invite" | "notice.friend_add" | "notice.group_ban.ban" | "notice.group_ban.lift_ban" | "notice.notify";
export declare type RequestEventType = "request" | "request.friend" | "request.group.add" | "request.group.invite";
export declare type SocketEventType = "socket" | "socket.open" | "socket.message" | "socket.error" | "socket.close";
export declare type APIEventType = "api" | "api.response" | "api.preSend";
export declare type MetaEventType = "meta_event" | "meta_event.lifecycle" | "meta_event.heartbeat";
export declare type EventType = MessageEventType | NoticeEventType | RequestEventType | SocketEventType | APIEventType | MetaEventType;
export declare class CQEventBus {
    _EventMap: Node;
    _onceListeners: WeakMap<Function, Function>;
    constructor();
    /**
     *
     * @param eventType
     * @param handler
     */
    on(eventType: EventType, handler: Function): void;
    /**
     *
     * @param eventType
     * @param handler
     */
    once(eventType: EventType, handler: Function): void;
    /**
     *
     * @param eventType
     * @param handler
     */
    off(eventType: EventType | string[], handler: Function): void;
    /**
     * 有未受支持的消息类型时,将会放返回最近的受支持的消息类型
     * @param eventType
     * @return
     */
    get(eventType: EventType | string[]): Node;
    /**
     *
     * @param eventType
     * @param args
     * @return {Promise<void>}
     */
    handle(eventType: EventType | string[], ...args: any[]): Promise<void>;
}
export declare class CQEvent {
    _isCanceled: boolean;
    constructor();
    get isCanceled(): boolean;
    stopPropagation(): void;
}
export {};
