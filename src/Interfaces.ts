import {CQEvent} from "./event-bus";
import {CQTag, node, nodeID} from "./tags";

/** @see send_msg */
export interface PrivateData {
  message_type?: "private"
  user_id: int64
  message: message
  auto_escape: boolean
}

/** @see send_msg */
export interface GroupData {
  message_type?: "group"
  group_id: int64
  message: message
  auto_escape: boolean
}

/** @see get_forward_msg */
export interface ForwardData {
  /** 消息数组 */
  messages: {
    /** CQ码字符串 */
    content: string;
    sender: LoginInfo;
    time: number
  }[];
}

/** @see get_image */
export interface QQImageData {
  /**图片源文件大小*/
  size: number
  /**图片文件原名*/
  filename: string
  /**图片下载地址*/
  url: string
}

/**
 * @see get_group_info
 * @see get_group_list
 */
export interface GroupInfo extends GroupId {
  /** 群名称 */
  group_name: string
  /** 成员数 */
  member_count: number
  /** 最大成员数（群容量） */
  max_member_count: number
}

/** @see get_msg */
export interface MessageInfo extends MessageId {
  /** 当消息来源为 `group` 时，为 `true` */
  group: boolean
  /** 当 [group]{@link group} == true 时, 有值, 否则为 `null` */
  group_id: number | null
  /** 消息内容 */
  message: string
  /** 消息来源 `private`，`group`, 等 */
  message_type: string
  /** 原始消息内容 */
  raw_message: string
  /** 消息真实id */
  real_id: number
  /** 发送者 */
  sender: LoginInfo
  /** 发送时间 */
  time: number
}

/** @see get_login_info */
export interface LoginInfo extends UserId {
  /** 昵称 */
  nickname: string
}

/** @see get_stranger_info */
export interface StrangerInfo extends LoginInfo {
  /** 性别*/
  sex: "male" | "female" | "unknown"
  /** 年龄 */
  age: number
}

/** @see get_friend_list */
export interface FriendInfo extends LoginInfo {
  /** 备注名 */
  remark: string
}

export interface GroupRenderInfo extends StrangerInfo {
  /** 群名片／备注 */
  card: string
  /** 地区 */
  area: string
  /** 成员等级 */
  level: string
  /** 角色, owner 或 admin 或 member */
  role: string
  /** 专属头衔 */
  title: string
}

/**
 * @see get_group_member_info
 * @see get_group_member_list
 */
export interface GroupMemberInfo extends GroupRenderInfo, GroupId {
  /** 加群时间戳 */
  join_time: number
  /** 最后发言时间戳 */
  last_sent_time: number
  /** 是否不良记录成员 */
  unfriendly: boolean
  /** 专属头衔过期时间戳 */
  title_expire_time: number
  /** 是否允许修改群名片 */
  card_changeable: boolean
}

/** @see get_group_honor_info */
export interface GroupHonorInfo extends GroupId {
  /** 当前龙王, 仅 type 为 talkative 或 all 时有数据 */
  current_talkative: (HonorInfo & {
    /** 持续天数 */
    day_count: number
  })
  /** 历史龙王, 仅 type 为 talkative 或 all 时有数据 */
  talkative_list: HonorInfoList
  /** 群聊之火, 仅 type 为 performer 或 all 时有数据 */
  performer_list: HonorInfoList
  /** 群聊炽焰, 仅 type 为 legend 或 all 时有数据 */
  legend_list: HonorInfoList
  /** 冒尖小春笋, 仅 type 为 strong_newbie 或 all 时有数据 */
  strong_newbie_list: HonorInfoList
  /** 快乐之源, 仅 type 为 emotion 或 all 时有数据 */
  emotion_list: HonorInfoList
}

/** @see GroupHonorInfo */
export interface HonorInfo extends LoginInfo {
  /** 头像 URL */
  avatar: string
}

/**
 * @see get_cookies
 * @see get_credentials
 */
export interface CookiesData {
  /** Cookies */
  cookies: string
}

/**
 * @see get_csrf_token
 * @see get_credentials
 */
export interface CSRFTokenData {
  /** CSRF Token */
  token: number
}

/**@see get_record*/
export interface RecordFormatData {
  /** 转换后的语音文件路径 */
  file: string
}

/** @see GroupHonorInfo */
export type HonorInfoList = Array<HonorInfo & {
  /** 荣誉描述 */
  description: string
}>

/**
 * @see can_send_image
 * @see can_send_record
 */
export interface CanSend {
  /** 是或否 */
  yes: boolean
}

/** @see get_version_info */
export interface VersionInfo {
  /** 应用标识, 如 mirai-native */
  app_name: string
  /** 应用版本, 如 1.2.3 */
  app_version: string
  /** OneBot 标准版本, 如 v11 */
  protocol_version: string
}

/**@see get_word_slices*/
export interface WordSlicesData {
  /**词组*/
  slices: string[]
}

/** @see get_group_system_msg */
export interface GroupSystemMSG {
  /** 邀请消息列表 */
  invited_requests: InvitedRequests[] | null
  /** 进群消息列表 */
  join_requests: JoinRequests[] | null
}

/** @see GroupSystemMSG */
export interface GroupSystemRequests extends GroupId {
  /** 请求ID */
  request_id: number
  /** 群名 */
  group_name: string
  /** 处理者, 未处理为0 */
  actor: number
  /** 是否已被处理 */
  checked: boolean
}

/** 邀请消息列表 */
export interface InvitedRequests extends GroupSystemRequests {
  /** 邀请者 */
  invitor_uin: number
  /** 邀请者昵称 */
  invitor_nick: string
}

/** 进群消息列表 */
export interface JoinRequests extends GroupSystemRequests {
  /** 请求者ID */
  requester_uin: number
  /** 请求者昵称 */
  requester_nick: string
  /** 验证消息 */
  message: string
}

/** @see get_group_file_system_info */
export interface GroupFileSystemInfo {
  /** 文件总数 */
  file_count: number
  /** 文件上限 */
  limit_count: number
  /** 已使用空间 */
  used_space: number
  /** 空间上限 */
  total_space: number
}

/**
 * @see get_group_root_files
 * @see get_group_files_by_folder
 * @see get_group_root_files
 */
export interface GroupRootFileSystemInfo {
  /** 文件列表 */
  files: GroupFileInfo[]
  /** 文件夹列表 */
  folders: GroupFolderInfo[]
}

/** @see GroupRootFileSystemInfo */
export interface GroupFileInfo {
  /** 文件ID */
  file_id: string
  /** 文件名 */
  file_name: string
  /** 文件类型 */
  busid: number
  /** 文件大小 */
  file_size: number
  /** 上传时间 */
  upload_time: number
  /** 过期时间,永久文件恒为0 */
  dead_time: number
  /** 最后修改时间 */
  modify_time: number
  /** 下载次数 */
  download_times: number
  /** 上传者ID */
  uploader: number
  /** 上传者名字 */
  uploader_name: string
}

/** @see GroupRootFileSystemInfo */
export interface GroupFolderInfo {
  /** 文件夹ID */
  folder_id: string
  /** 文件名 */
  folder_name: string
  /** 创建时间 */
  create_time: number
  /** 创建者 */
  creator: number
  /** 创建者名字 */
  creator_name: string
  /** 子文件数量 */
  total_file_count: number
}

/**@see get_group_file_url*/
export interface FileUrl {
  /** 文件下载链接 */
  url: string
}

/** @see get_status */
export interface Status {
  /** 表示BOT是否在线 */
  online: boolean
  /** 同 [`online`]{@link online} */
  good: boolean
  /** 运行统计 */
  stat: {
    /** 收到的数据包总数 */
    packet_received: number
    /** 发送的数据包总数 */
    packet_sent: number
    /** 数据包丢失总数 */
    packet_lost: number
    /** 接受信息总数 */
    message_received: number
    /** 发送信息总数 */
    message_sent: number
    /** TCP 链接断开次数 */
    disconnect_times: number
    /** 账号掉线次数 */
    lost_times: number
  }
}

/** @see get_group_at_all_remain */
export interface GroupAtAllRemain {
  /** 是否可以 @全体成员 */
  can_at_all: boolean
  /** 群内所有管理当天剩余 @全体成员 次数 */
  remain_at_all_count_for_group: number
  /** Bot 当天剩余 @全体成员 次数 */
  remain_at_all_count_for_uin: number
}

/** @see get_vip_info */
export interface VipInfo extends LoginInfo {
  /** QQ 等级 */
  level: number
  /** 等级加速度 */
  level_speed: number
  /** 会员等级 */
  vip_level: string
  /** 会员成长速度 */
  vip_growth_speed: number
  /** 会员成长总值 */
  vip_growth_total: number
}

/** 上报事件 */
export interface PostType {
  /** 事件发生的时间戳 */
  time: number
  /** 上报类型 */
  post_type: string
  /**  收到事件的机器人 QQ 号 */
  self_id: number
}

/** 类型分支 */
export interface SubType {
  sub_type: string
}

/** 消息类型 */
export interface MessageType extends PostType, SubType, MessageId, UserId {
  post_type: "message"
  message_type: string
  /**  消息内容 */
  message: string
  /**  原始消息内容 */
  raw_message: string
  /**  字体 */
  font: number
}

/** 私聊消息 */
export interface PrivateMessage extends MessageType {
  message_type: "private"
  /** 消息子类型, 如果是好友则是 friend, 如果是群临时会话则是 group */
  sub_type: "friend" | "group" | "other"
  /**  发送人信息 */
  sender: StrangerInfo
}

/** 群消息 */
export interface GroupMessage extends MessageType, GroupId {
  message_type: "group"
  /** 消息子类型, 正常消息是 normal, 匿名消息是 anonymous, 系统提示 ( 如「管理员已禁止群内匿名聊天」 ) 是 notice */
  sub_type: "normal" | "anonymous" | "notice"
  /** 匿名信息, 如果不是匿名消息则为 null */
  anonymous: object
  /**  发送人信息 */
  sender: GroupRenderInfo
}

/** 请求类型 */
export interface RequestType extends PostType {
  post_type: "request"
  request_type: string
}

/** 加群请求／邀请 */
export interface RequestGroup extends RequestType, SubType, GroupId, UserId {
  request_type: "group"
  /** 请求子类型, 分别表示加群请求、邀请登录号入群 */
  sub_type: "add" | "invite"
  /** 验证信息 */
  comment: string
  /** 请求 flag, 在调用处理请求的 API 时需要传入 */
  flag: string
}

/** 加好友请求 */
export interface RequestFriend extends RequestType, UserId {
  request_type: "friend"
  /** 验证信息 */
  comment: string
  /** 请求 flag, 在调用处理请求的 API 时需要传入 */
  flag: string
}

export interface MetaEventType extends PostType {
  post_type: "meta_event"
  meta_event_type: string
}

/** 心跳 */
export interface HeartBeat extends MetaEventType {
  meta_event_type: "heartbeat"
  /**  状态信息 */
  status: Status
  /**  到下次心跳的间隔，单位毫秒 */
  interval: number
}

/** 生命周期 */
export interface LifeCycle extends MetaEventType, SubType {
  meta_event_type: "lifecycle"
  /**   事件子类型，表示 WebSocket 连接成功 */
  sub_type: "connect"
}

/** @see CQWebSocket.constructor */
export interface CQWebSocketOptions {
  accessToken?: string,
  baseUrl?: string,
  qq?: number,
  reconnection?: boolean,
  reconnectionAttempts?: number,
  reconnectionDelay?: number,
}

/** API 消息发送报文 */
export interface APIRequest {
  action: string,
  params: CQTag<any>[] | string,
  echo: any,
}

/**
 * 消息 ID
 * @see send_private_msg
 * @see send_group_msg
 * @see send_group_forward_msg
 * @see send_msg
 */
export interface MessageId {
  /** 目标消息 ID */
  message_id: number
}

/** 群号 */
export interface GroupId {
  /** 群号 */
  group_id: number
}

/** 目标 QQ 号,(发送者) */
export interface UserId {
  /** 目标 QQ 号,(发送者) */
  user_id: number
}

/** API 消息回复报文 */
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

/** API 消息回复错误报文 */
export interface ErrorAPIResponse extends APIResponse<null> {
  data: null
  msg: string
  wording: string
}

/** 通知类型 */
export interface NoticeType extends PostType {
  post_type: "notice"
  notice_type: string
}

/** 群文件上传 */
export interface GroupUpload extends NoticeType, GroupId, UserId {
  notice_type: "group_upload"
  /** 文件信息 */
  file: {
    /** 文件 ID */
    id: string
    /** 文件名 */
    name: string
    /** 文件大小 ( 字节数 ) */
    size: number
    /** busid ( 目前不清楚有什么作用 ) */
    busid: number
  }
}

/** 群管理员变动 */
export interface GroupAdmin extends NoticeType, SubType, GroupId, UserId {
  notice_type: "group_admin"
  /** set、unset  事件子类型, 分别表示设置和取消管理员 */
  sub_type: "set" | "unset"
}

/** 群成员减少 */
export interface GroupDecrease extends NoticeType, SubType, GroupId, UserId {
  notice_type: "group_decrease"
  /** 事件子类型, 分别表示主动退群、成员被踢、登录号被踢 */
  sub_type: "leave" | "kick" | "kick_me"
  /** 操作者 QQ 号 ( 如果是主动退群, 则和 [user_id]{@link GroupDecrease.user_id} 相同 ) */
  operator_id: number
}

/** 群成员增加 */
export interface GroupIncrease extends NoticeType, SubType, GroupId, UserId {
  notice_type: "group_increase"
  /** 事件子类型, 分别表示管理员已同意入群、管理员邀请入群 */
  sub_type: "approve" | "invite"
  /** 操作者 QQ 号 */
  operator_id: number
}

/** 群禁言 */
export interface GroupBan extends NoticeType, SubType, GroupId, UserId {
  notice_type: "group_ban"
  /** 事件子类型, 分别表示禁言、解除禁言 */
  sub_type: "ban" | "lift_ban"
  /** 操作者 QQ 号 */
  operator_id: number
  /** 禁言时长, 单位秒 */
  duration: number
}

/** 好友添加 */
export interface FriendAdd extends NoticeType, UserId {
  notice_type: "friend_add"
}

/** 群消息撤回 */
export interface GroupRecall extends NoticeType, MessageId, GroupId, UserId {
  /** group_recall  通知类型 */
  notice_type: "group_recall"
  /** 操作者 QQ 号 */
  operator_id: number
}

/** 好友消息撤回 */
export interface FriendRecall extends NoticeType, MessageId, UserId {
  /** friend_recall  通知类型 */
  notice_type: "friend_recall"
}

/** 好友戳一戳 */
export interface NotifyPokeFriend extends NoticeType, SubType, UserId {
  notice_type: "notify"
  sub_type: "poke"
  /** 发送者 QQ 号 */
  sender_id: number
  /** 被戳者 QQ 号 */
  target_id: number
}

/** 群内戳一戳 */
export interface NotifyPokeGroup extends NoticeType, GroupId, UserId {
  notice_type: "notify"
  sub_type: "poke"
  /** 被戳者 QQ 号 */
  target_id: number
}

/** 群红包运气王提示 */
export interface NotifyLuckyKing extends NoticeType, SubType, GroupId, UserId {
  notice_type: "notify"
  sub_type: "lucky_king"
  /** 运气王id */
  target_id: number
}

/** 群成员荣誉变更提示 */
export interface NotifyHonor extends NoticeType, SubType, GroupId, UserId {
  notice_type: "notify"
  sub_type: "honor"
  /** talkative:龙王 performer:群聊之火 emotion:快乐源泉  荣誉类型 */
  honor_type: "talkative" | "performer" | "emotion" | string
}

/** 群成员名片更新 */
export interface GroupCard extends NoticeType, GroupId, UserId {
  notice_type: "group_card"
  /** 新名片 */
  card_new: number
  /** 旧名片 */
  card_old: number
}

/** 接收到离线文件 */
export interface OfflineFile extends NoticeType, UserId {
  notice_type: "offline_file"
  /** 文件数据 */
  file: {
    /** 文件名 */
    name: string
    /** 文件大小 */
    size: number
    /** 下载链接 */
    url: string
  }
}

/** @see get_online_clients */
export interface Device {
  /**客户端ID*/
  app_id: number
  /**设备名称*/
  device_name: string
  /**设备类型*/
  device_kind: string
}

/** 其他客户端在线状态 */
export interface Client_status extends NoticeType {
  notice_type: "client_status"
  /** 客户端信息 */
  client: Device
  /** 当前是否在线 */
  online: boolean
}

/** @see get_essence_msg_list */
export interface EssenceMessage {
  /**发送者QQ 号*/
  sender_id: number
  /**发送者昵称*/
  sender_nick: string
  /**消息发送时间*/
  sender_time: number
  /**操作者QQ 号*/
  operator_id: number
  /**操作者昵称*/
  operator_nick: string
  /**精华设置时间*/
  operator_time: number
  /**消息ID*/
  message_id: number
}

/**@see ocr_image*/
export interface OCRImage {
  /**OCR结果*/
  texts: {
    /**文本*/
    text: string
    /**置信度*/
    confidence: number
    /**坐标*/
    coordinates: [number, number]
  }[]
  /**语言*/
  language: string
}

/**@see download_file*/
export interface DownloadFile {
  /**下载文件的绝对路径*/
  file: string
}

/**@see check_url_safely*/
export interface URLSafely {
  /**安全等级, 1: 安全 2: 未知 3: 危险*/
  level: number
}

export type message = CQTag<any>[] | string
export type messageNode = CQTag<node> | CQTag<nodeID>
export type int64 = number | string
export type MessageEventHandler<T> = (this: void, event: CQEvent, message: T, tags: CQTag<any>[]) => void
export type EventHandler<T> = (this: void, event: CQEvent, message: T) => void
export type ResponseHandle = (this: void, event: CQEvent, response: APIResponse<any>,
                              sourceMSG: APIRequest,
) => void
export type SocketType = "api" | "event"
export type HandleEventType = keyof SocketHandle
export type RequestGroupType = "request.group" | "request.group.add" | "request.group.invite"
export type SocketClose = "socket.close" | "socket.error"
export type GroupAdminType = "notice.group_admin" | "notice.group_admin.set" | "notice.group_admin.unset"
export type GroupDecreaseType = "notice.group_decrease" | "notice.group_decrease.leave" | "notice.group_decrease.kick"
    | "notice.group_decrease.kick_me"
export type GroupIncreaseType = "notice.group_increase" | "notice.group_increase.approve"
    | "notice.group_increase.invite"
export type GroupBanType = "notice.group_ban" | "notice.group_ban.ban" | "notice.group_ban.lift_ban"
export type SocketHandle = {
  "message.private"?: MessageEventHandler<PrivateMessage>
  "message.group"?: MessageEventHandler<GroupMessage>
  "message.discuss"?: MessageEventHandler<any>
  
  "request.friend"?: EventHandler<RequestFriend>
  
  "socket"?: EventHandler<SocketType>
  "socket.open"?: EventHandler<SocketType>
  
  "api.preSend"?: EventHandler<APIRequest>
  "api.response"?: ResponseHandle
  
  "meta_event.lifecycle"?: EventHandler<LifeCycle>
  "meta_event.heartbeat"?: EventHandler<HeartBeat>
  
  "notice.group_upload"?: EventHandler<GroupUpload>
  "notice.friend_add"?: EventHandler<FriendAdd>
  "notice.group_recall"?: EventHandler<GroupRecall>
  "notice.friend_recall"?: EventHandler<FriendRecall>
  "notice.notify.poke.friend"?: EventHandler<NotifyPokeFriend>
  "notice.notify.poke.group"?: EventHandler<NotifyPokeGroup>
  "notice.notify.lucky_king"?: EventHandler<NotifyLuckyKing>
  "notice.notify.honor"?: EventHandler<NotifyHonor>
  "notice.group_card"?: EventHandler<GroupCard>
  "notice.offline_file"?: EventHandler<OfflineFile>
  "notice.client_status"?: EventHandler<Client_status>
} & {
  [key in SocketClose]?: (this: void, event: CQEvent, type: SocketType, code: number, reason: string) => void
} & {
  [key in RequestGroupType]?: EventHandler<RequestGroup>
} & {
  [key in GroupAdminType]?: EventHandler<GroupAdmin>
} & {
  [key in GroupDecreaseType]?: EventHandler<GroupDecrease>
} & {
  [key in GroupIncreaseType]?: EventHandler<GroupIncrease>
} & {
  [key in GroupBanType]?: EventHandler<GroupBan>
}

export interface PromiseRes<T> extends Promise<T> {
  then<S = T, F = never>(
      onFulfilled?: ((value: T) => S | Promise<S>) | null,
      onRejected?: ((reason: ErrorAPIResponse) => F | Promise<F>) | null,
  ): Promise<S | F>
  
  catch<S = never>(onrejected?: ((reason: ErrorAPIResponse) => S | Promise<S>) | undefined | null): Promise<T | S>
}