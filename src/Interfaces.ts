import {CQEvent, NoticeEventType} from "./event-bus";
import {CQTag} from "./tags";

/**
 * @see send_msg
 */
export interface PrivateData {
  message_type?: "private"
  user_id: int64
  message: message
  auto_escape: boolean
}

/**
 * @see send_msg
 */
export interface GroupData {
  message_type?: "group"
  group_id: int64
  message: message
  auto_escape: boolean
}

/**
 * @see get_group_info
 * @see get_group_list
 */
export interface GroupInfo {
  group_id: number
  group_name: string
  member_count: number
  max_member_count: number
}

/**
 * @see get_msg
 */
export interface MessageInfo {
  /**
   * 当消息来源为 `group` 时，为 `true`
   */
  group: boolean
  /**
   * 当 [group]{@link group} == true 时, 有值, 否则为 `null`
   */
  group_id: number | null
  /**
   * 消息内容
   */
  message: string
  /**
   * 消息id
   */
  message_id: number
  /**
   * 消息来源 `private`，`group`, 等
   */
  message_type: string
  /**
   * 原始消息内容
   */
  raw_message: string
  /**
   * 消息真实id
   */
  real_id: number
  /**
   * 发送者
   */
  sender: LoginInfo
  /**
   * 发送时间
   */
  time: number
}

/**
 * @see get_login_info
 */
export interface LoginInfo {
  /**
   * QQ 号
   */
  user_id: number
  /**
   * 昵称
   */
  nickname: string
}

/**
 * @see get_stranger_info
 */
export interface StrangerInfo extends LoginInfo {
  /**
   * 性别, male 或 female 或 unknown
   */
  sex: string
  /**
   * 年龄
   */
  age: number
}

/**
 * @see get_friend_list
 */
export interface FriendInfo extends LoginInfo {
  /**
   * 备注名
   */
  remark: string
}

export interface GroupRenderInfo extends StrangerInfo {
  /**
   * 群名片／备注
   */
  card: string
  /**
   * 地区
   */
  area: string
  /**
   * 成员等级
   */
  level: string
  /**
   * 角色, owner 或 admin 或 member
   */
  role: string
  /**
   * 专属头衔
   */
  title: string
}

/**
 * @see get_group_member_info
 * @see get_group_member_list
 */
export interface GroupMemberInfo extends GroupRenderInfo {
  /**
   * 群号
   */
  group_id: number
  /**
   * 加群时间戳
   */
  join_time: number
  /**
   * 最后发言时间戳
   */
  last_sent_time: number
  /**
   * 是否不良记录成员
   */
  unfriendly: boolean
  /**
   * 专属头衔过期时间戳
   */
  title_expire_time: number
  /**
   * 是否允许修改群名片
   */
  card_changeable: boolean
}

/**
 * @see get_group_honor_info
 */
export interface GroupHonorInfo {
  /**
   * 群号
   */
  group_id: number
  /**
   * 当前龙王, 仅 type 为 talkative 或 all 时有数据
   */
  current_talkative: (HonorInfo & {
    /**
     * 持续天数
     */
    day_count: number
  })
  /**
   * 历史龙王, 仅 type 为 talkative 或 all 时有数据
   */
  talkative_list: HonorInfoList
  /**
   * 群聊之火, 仅 type 为 performer 或 all 时有数据
   */
  performer_list: HonorInfoList
  /**
   * 群聊炽焰, 仅 type 为 legend 或 all 时有数据
   */
  legend_list: HonorInfoList
  /**
   * 冒尖小春笋, 仅 type 为 strong_newbie 或 all 时有数据
   */
  strong_newbie_list: HonorInfoList
  /**
   * 快乐之源, 仅 type 为 emotion 或 all 时有数据
   */
  emotion_list: HonorInfoList
}

/**
 * @see GroupHonorInfo
 */
export interface HonorInfo extends LoginInfo {
  /**
   * 头像 URL
   */
  avatar: string
}

/**
 * @see GroupHonorInfo
 */
export type HonorInfoList = Array<HonorInfo & {
  /**
   * 荣誉描述
   */
  description: string
}>

export interface CanSend {
  /**
   * 是或否
   */
  yes: boolean
}

/**
 * @see get_version_info
 */
export interface VersionInfo {
  /**
   * 应用标识, 如 mirai-native
   */
  app_name: string
  /**
   * 应用版本, 如 1.2.3
   */
  app_version: string
  /**
   * OneBot 标准版本, 如 v11
   */
  protocol_version: string
}

/**
 * @see get_group_system_msg
 */
export interface GroupSystemMSG {
  /**
   * 邀请消息列表
   */
  invited_requests: {
    /**
     * 请求ID
     */
    request_id: number
    /**
     * 邀请者
     */
    invitor_uin: number
    /**
     * 邀请者昵称
     */
    invitor_nick: string
    /**
     * 群号
     */
    group_id: number
    /**
     * 群名
     */
    group_name: string
    /**
     * 是否已被处理
     */
    checked: boolean
    /**
     * 处理者, 未处理为0
     */
    actor: number
  }[] | null
  /**
   * 进群消息列表
   */
  join_requests: {
    /**
     * 请求ID
     */
    request_id: number
    /**
     * 请求者ID
     */
    requester_uin: number
    /**
     * 请求者昵称
     */
    requester_nick: string
    /**
     * 验证消息
     */
    message: string
    /**
     * 群号
     */
    group_id: number
    /**
     * 群名
     */
    group_name: string
    /**
     * 是否已被处理
     */
    checked: boolean
    /**
     * 处理者, 未处理为0
     */
    actor: number
  }[] | null
}

/**
 * @see get_group_file_system_info
 */
export interface GroupFileSystemInfo {
  /**
   * 文件总数
   */
  file_count: number
  /**
   * 文件上限
   */
  limit_count: number
  /**
   * 已使用空间
   */
  used_space: number
  /**
   * 空间上限
   */
  total_space: number
}

/**
 * @see get_group_root_files
 * @see get_group_files_by_folder
 * @see get_group_root_files
 */
export interface GroupRootFileSystemInfo {
  /**
   * 文件列表
   */
  files: GroupFileInfo[]
  /**
   * 文件夹列表
   */
  folders: GroupFolderInfo[]
}

/**
 * @see GroupRootFileSystemInfo
 */
export interface GroupFileInfo {
  /**
   * 文件ID
   */
  file_id: string
  /**
   * 文件名
   */
  file_name: string
  /**
   * 文件类型
   */
  busid: number
  /**
   * 文件大小
   */
  file_size: number
  /**
   * 上传时间
   */
  upload_time: number
  /**
   * 过期时间,永久文件恒为0
   */
  dead_time: number
  /**
   * 最后修改时间
   */
  modify_time: number
  /**
   * 下载次数
   */
  download_times: number
  /**
   * 上传者ID
   */
  uploader: number
  /**
   * 上传者名字
   */
  uploader_name: string
}

/**
 * @see GroupRootFileSystemInfo
 */
export interface GroupFolderInfo {
  /**
   * 文件夹ID
   */
  folder_id: string
  /**
   * 文件名
   */
  folder_name: string
  /**
   * 创建时间
   */
  create_time: number
  /**
   * 创建者
   */
  creator: number
  /**
   * 创建者名字
   */
  creator_name: string
  /**
   * 子文件数量
   */
  total_file_count: number
}
export interface FileUrl{
  /**
   * 文件下载链接
   */
  url:string
}
/**
 * @see get_status
 */
export interface Status {
  /**
   * 表示BOT是否在线
   */
  online: boolean
  /**
   * 同 [`online`]{@link online}
   */
  goold: boolean
  /**
   * 运行统计
   */
  stat: {
    /**
     * 收到的数据包总数
     */
    packet_received: number
    /**
     * 发送的数据包总数
     */
    packet_sent: number
    /**
     * 数据包丢失总数
     */
    packet_lost: number
    /**
     * 接受信息总数
     */
    message_received: number
    /**
     * 发送信息总数
     */
    message_sent: number
    /**
     * TCP 链接断开次数
     */
    disconnect_times: number
    /**
     * 账号掉线次数
     */
    lost_times: number
  }
}

/**
 * @see get_group_at_all_remain
 */
export interface GroupAtAllRemain {
  /**
   * 是否可以 @全体成员
   */
  can_at_all: boolean
  /**
   * 群内所有管理当天剩余 @全体成员 次数
   */
  remain_at_all_count_for_group: number
  /**
   * Bot 当天剩余 @全体成员 次数
   */
  remain_at_all_count_for_uin: number
}

/**
 * @see get_vip_info
 */
export interface VipInfo extends LoginInfo {
  /**
   * QQ 等级
   */
  level: number
  /**
   * 等级加速度
   */
  level_speed: number
  /**
   * 会员等级
   */
  vip_level: string
  /**
   * 会员成长速度
   */
  vip_growth_speed: number
  /**
   * 会员成长总值
   */
  vip_growth_total: number
}

export type message = CQTag<any>[] | string
export type int64 = number | string
export type MessageEventHandler<T> = (event: CQEvent, message: T, CQTag: CQTag<any>[]) => void;
export type EventHandler<T> = (event: CQEvent, message: T) => void;
export type onSuccess<T> = (json: APIResponse<T>) => void;
export type onFailure = (reason: ErrorAPIResponse) => void;
export type SocketType = "api" | "event"

export interface PostType {
  /** 事件发生的时间戳 */
  time: number
  /** 上报类型 */
  post_type: string
  /**  收到事件的机器人 QQ 号 */
  self_id: number

}

export interface RequestGroup extends PostType {
  request_type: string// group	请求类型
  sub_type: string// add、invite	请求子类型, 分别表示加群请求、邀请登录号入群
  group_id: number	// 群号
  user_id: number	// 发送请求的 QQ 号
  comment: string	// 验证信息
  flag: string	// 请求 flag, 在调用处理请求的 API 时需要传入
}

export interface RequestFriend extends PostType {
  /** friend  请求类型 */
  request_type: string
  /** 发送请求的 QQ 号 */
  user_id: number
  /** 验证信息 */
  comment: string
  /** 请求 flag, 在调用处理请求的 API 时需要传入 */
  flag: string
}

export interface heartbeat {
  /** 上报类型 */
  post_type: "meta_event"
  /**  元事件类型 */
  meta_event_type: "heartbeat"
  /**  状态信息 */
  status: object
  /**  到下次心跳的间隔，单位毫秒 */
  interval: number
}

export interface lifecycle {
  /**  meta_event  上报类型 */
  post_type: "meta_event"
  /** lifecycle  元事件类型 */
  meta_event_type: "lifecycle"
  /**   事件子类型，表示 WebSocket 连接成功 */
  sub_type: "connect"
}

export interface PrivateMessage extends PostType {
  /**  `private`  消息类型 */
  message_type: string
  /**  `friend`、`group`、`other`  消息子类型, 如果是好友则是 friend, 如果是群临时会话则是 group */
  sub_type: string
  /**  消息 ID */
  message_id: number
  /**  发送者 QQ 号 */
  user_id: number
  /**  消息内容 */
  message: string
  /**  原始消息内容 */
  raw_message: string
  /**  字体 */
  font: number
  /**  发送人信息 */
  sender: StrangerInfo

}

export interface GroupMessage extends PrivateMessage {
  /**  `group`  消息类型 */
  message_type: string
  /**  消息子类型, 正常消息是 normal, 匿名消息是 anonymous, 系统提示 ( 如「管理员已禁止群内匿名聊天」 ) 是 notice */
  sub_type: string
  /** 群号 */
  group_id: number
  /** 匿名信息, 如果不是匿名消息则为 null */
  anonymous: object
  /**  发送人信息 */
  sender: GroupRenderInfo
}

export interface Reconnection {
  times: number;
  delay: number;
  timesMax: number;
  timeout?: NodeJS.Timeout
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
  params: CQTag<any>[] | string,
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
  data: T
  echo: any
}

export interface ErrorAPIResponse extends APIResponse<null> {
  data: null
  mag: string
  wording: string
}

export interface ResponseHandler {
  onSuccess: onSuccess<any>;
  onFailure: onFailure;
  message: APIRequest
}

export type SocketHandle = {
  "message.private"?: MessageEventHandler<PrivateMessage>
  "message.group"?: MessageEventHandler<GroupMessage>
  "message.discuss"?: MessageEventHandler<any>

  "request.friend"?: EventHandler<RequestFriend>
  "request.group"?: EventHandler<RequestGroup>
  "request.group.add"?: EventHandler<RequestGroup>
  "request.group.invite"?: EventHandler<RequestGroup>

  "socket.open"?: EventHandler<SocketType>;
  "socket.close"?: (event: CQEvent, code: number, reason: string, type: SocketType) => void;
  "socket.error"?: (event: CQEvent, code: number, reason: string, type: SocketType) => void;

  "api.preSend"?: EventHandler<APIRequest>;
  "api.response"?: EventHandler<APIResponse<any>>;

  "meta_event.lifecycle"?: EventHandler<lifecycle>
  "meta_event.heartbeat"?: EventHandler<heartbeat>
} & {
  [key in NoticeEventType]?: Function;
}


export interface PromiseRes<T> extends Promise<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: ErrorAPIResponse) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ): Promise<TResult1 | TResult2>;

  catch<TResult = never>(onrejected?: ((reason: ErrorAPIResponse) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
}