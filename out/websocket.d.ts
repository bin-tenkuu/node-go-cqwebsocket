import { CQEvent, EventType } from "./event-bus";
import { CQTag } from "./tags";
interface Reconnection {
    times: number;
    delay: number;
    timesMax: number;
    timeout: number;
}
interface options {
    accessToken?: string;
    baseUrl?: string;
    qq?: number;
    reconnection?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
}
interface APIResponse {
    status: string;
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
    retcode: number;
    data: {
        message_id: number;
    } | null;
    echo: any;
}
interface ErrorAPIResponse extends APIResponse {
    mag: string;
    wording: string;
}
declare type onFailure = (reason: ErrorAPIResponse) => void;
export declare class CQWebSocket {
    messageSuccess: (ret: any) => void;
    messageFail: onFailure;
    reconnection?: Reconnection;
    private _responseHandlers;
    private _eventBus;
    private readonly _qq;
    private readonly _accessToken;
    private readonly _baseUrl;
    private _socketAPI;
    private _socketEVENT;
    constructor({ accessToken, baseUrl, qq, reconnection, reconnectionAttempts, reconnectionDelay, }?: options);
    reconnect(): void;
    connect(): void;
    disconnect(): void;
    /**
     *
     * @param method
     * @param params
     * @return
     */
    send(method: string, params: any): Promise<unknown>;
    /**
     *
     * @param user_id  对方 QQ 号
     * @param message 要发送的内容
     * @param auto_escape=false  消息内容是否作为纯文本发送 ( 即不解析 CQ 码 ) , 只在 `message` 字段是字符串时有效
     */
    send_private_msg(user_id: number | string, message: CQTag[], auto_escape?: boolean): Promise<void>;
    /**
     *
     * @param group_id 群号
     * @param message  要发送的内容
     * @param auto_escape=false 消息内容是否作为纯文本发送 ( 即不解析 CQ 码) , 只在 `message` 字段是字符串时有效
     */
    send_group_msg(group_id: number | string, message: CQTag[], auto_escape?: boolean): Promise<void>;
    /**
     * | eventType | handler |
     * |-|-|
     * |"socket.open"| () => void |
     * |"socket.close"|(code: number, reason: string) => void|
     * |`MessageEventType`|(event: CQEvent, message: any, CQTag: CQTag[]) => void|
     * |`EventType`|(event: CQEvent, message: any) => void|
     * @param eventType
     * @param handler
     * @return
     * @see MessageEventType
     * @see EventType
     */
    on(eventType: EventType, handler: (evt: CQEvent, msg: any, tags: CQTag[]) => void): this;
    /**
     * | eventType | handler |
     * |-|-|
     * |"socket.open"| () => void |
     * |"socket.close"|(code: number, reason: string) => void|
     * |`MessageEventType`|(event: CQEvent, message: any, CQTag: CQTag[]) => void|
     * |`EventType`|(event: CQEvent, message: any) => void|
     * @param eventType
     * @param handler
     * @return
     * @see MessageEventType
     * @see EventType
     */
    once(eventType: EventType, handler: (evt: CQEvent, msg: any, tags: CQTag[]) => void): this;
    /**
     * | eventType | handler |
     * |-|-|
     * |"socket.open"| () => void |
     * |"socket.close"|(code: number, reason: string) => void|
     * |`MessageEventType`|(event: CQEvent, message: any, CQTag: CQTag[]) => void|
     * |`EventType`|(event: CQEvent, message: any) => void|
     * @param eventType
     * @param handler
     * @return
     * @see MessageEventType
     * @see EventType
     */
    off(eventType: EventType, handler: (evt: CQEvent, msg: any, tags: CQTag[]) => void): this;
    private _open;
    private _onmessageAPI;
    private _onmessage;
    private _close;
    private _handleMSG;
    /**
     * - CONNECTING = 0 连接中
     * - OPEN = 1 已连接
     * - CLOSING = 2 关闭中
     * - CLOSED = 3 已关闭
     * @return {number}
     */
    get state(): number;
    get qq(): number;
}
export {};
