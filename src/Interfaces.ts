import { ClientOptions, PerMessageDeflateOptions } from 'ws'
import { CQEvent } from './CQWebsocket'
import { message, messageNode, Tag } from './tags'

export interface Message {
  /**要发送的内容*/
  message: message
}

/**@see send_msg*/
export interface PrivateData extends Message {
  message_type?: 'private'
  user_id: int64
  auto_escape: boolean
}

/**@see send_msg*/
export interface GroupData extends GroupId, Message {
  message_type?: 'group'
  auto_escape: boolean
}

/**@see get_forward_msg*/
export interface ForwardData {
  /**消息数组*/
  messages: {
    /**CQ码字符串*/
    content: string
    sender: LoginInfo
    time: int32
  }[]
}

/**@see get_image*/
export interface QQImageData extends FileUrl {
  /**图片源文件大小*/
  size: int32
  /**图片文件原名*/
  filename: string
}

/**
 * @see get_group_info
 * @see get_group_list
 */
export interface GroupInfo extends GroupId {
  /**群名称*/
  group_name: string
  /**群备注, 0 如果机器人尚未加入群*/
  group_memo: string
  /**群创建时间, 0 如果机器人尚未加入群*/
  group_create_time: uint32
  /**群等级, 0 如果机器人尚未加入群*/
  group_level: uint32
  /**成员数*/
  member_count: int32
  /**最大成员数(群容量)*/
  max_member_count: int32
}

/**@see get_msg*/
export interface MessageInfo extends MessageId {
  /**当消息来源为 `group` 时,为 `true`*/
  group: boolean
  /**当 [group]{@link group} == true 时, 有值, 否则为 `null`*/
  group_id: int64 | null
  /**消息内容*/
  message: message
  /**消息来源 `private`,`group`, 等*/
  message_type: 'group' | 'private'
  /**原始消息内容*/
  raw_message: message
  /**消息真实id*/
  real_id: int32
  /**发送者*/
  sender: LoginInfo
  /**发送时间*/
  time: int32
}

/**@see get_login_info*/
export interface LoginInfo extends UserId {
  /**昵称*/
  nickname: string
}

/**@see get_unidirectional_friend_list*/
export interface SourceInfo extends LoginInfo {
  /**添加途径*/
  source: string
}

/**@see qidian_get_account_info*/
export interface QiDianAccountInfo {
  /** 父账号ID*/
  master_id: int64
  /** 用户昵称*/
  ext_name: string
  /** 账号创建时间*/
  create_time: int64
}

/**@see get_stranger_info*/
export interface StrangerInfo extends LoginInfo {
  /**性别*/
  sex: 'male' | 'female' | 'unknown'
  /**年龄*/
  age: int32
  /**qid ID身份卡*/
  qid: string
  /**等级*/
  level: int32
  /**等级*/
  login_days: int32
}

/**@see get_friend_list*/
export interface FriendInfo extends LoginInfo {
  /**备注名*/
  remark: string
}

export interface GroupRenderInfo extends StrangerInfo {
  /**群名片／备注*/
  card: string
  /**地区*/
  area: string
  /**成员等级*/
  level: int32
  /**角色, owner 或 admin 或 member*/
  role: 'owner' | 'member' | 'admin'
  /**专属头衔*/
  title: string
}

/**
 * @see get_group_member_info
 * @see get_group_member_list
 */
export interface GroupMemberInfo extends GroupRenderInfo, GroupId {
  /**加群时间戳*/
  join_time: int32
  /**最后发言时间戳*/
  last_sent_time: int32
  /**是否不良记录成员*/
  unfriendly: boolean
  /**专属头衔过期时间戳*/
  title_expire_time: int64
  /**是否允许修改群名片*/
  card_changeable: boolean
  /**禁言到期时间*/
  shut_up_timestamp: int64
}

/**@see get_group_honor_info*/
export interface GroupHonorInfo extends GroupId {
  /**当前龙王, 仅 type 为 talkative 或 all 时有数据*/
  current_talkative: HonorInfo & {
    /**持续天数*/
    day_count: int32
  }
  /**历史龙王, 仅 type 为 talkative 或 all 时有数据*/
  talkative_list: HonorInfoList
  /**群聊之火, 仅 type 为 performer 或 all 时有数据*/
  performer_list: HonorInfoList
  /**群聊炽焰, 仅 type 为 legend 或 all 时有数据*/
  legend_list: HonorInfoList
  /**冒尖小春笋, 仅 type 为 strong_newbie 或 all 时有数据*/
  strong_newbie_list: HonorInfoList
  /**快乐之源, 仅 type 为 emotion 或 all 时有数据*/
  emotion_list: HonorInfoList
}

/**@see GroupHonorInfo*/
export interface HonorInfo extends LoginInfo {
  /**头像 URL*/
  avatar: string
}

/**
 * @see get_cookies
 * @see get_credentials
 */
export interface CookiesData {
  /**Cookies*/
  cookies: string
}

/**
 * @see get_csrf_token
 * @see get_credentials
 */
export interface CSRFTokenData {
  /**CSRF Token*/
  token: number
}

export interface FileStr {
  file: string
}

/**@see get_record*/
export interface RecordFormatData extends FileStr {
  /**转换后的语音文件路径*/
  file: string
}

/**@see GroupHonorInfo*/
export type HonorInfoList = Array<
  HonorInfo & {
    /**荣誉描述*/
    description: string
  }
>

/**
 * @see can_send_image
 * @see can_send_record
 */
export interface CanSend {
  /**是或否*/
  yes: boolean
}

export interface GroupAddRequest {
  master_id: int64
  ext_name: string
  create_time: int64
}

/**@see get_version_info*/
export interface VersionInfo {
  /**应用标识, 如 go-cqhttp 固定值*/
  app_name: 'go-cqhttp'
  /**应用版本, 如 v0.9.40-fix4*/
  app_version: string
  /**应用完整名称*/
  app_full_name: string
  /**协议号 */
  protocol_name: number
  /**OneBot 标准版本, 如 v11*/
  protocol_version: string
  /**原Coolq版本 固定值*/
  coolq_edition: 'pro'
  coolq_directory: string
  /**是否为go-cqhttp 固定值*/
  'go-cqhttp': true
  /**4.15.0	固定值*/
  plugin_version: string
  /**99	固定值*/
  plugin_build_number: 99
  /**release	固定值*/
  plugin_build_configuration: 'release'
  /**运行时版本 */
  runtime_version: string
  /**运行时系统 */
  runtime_os: string
  /**应用版本, 如 v0.9.40-fix4*/
  version: string
}

/**@see get_word_slices*/
export interface WordSlicesData {
  /**词组*/
  slices: string[]
}

/**@see get_group_system_msg*/
export interface GroupSystemMSG {
  /**邀请消息列表*/
  invited_requests: InvitedRequests[] | null
  /**进群消息列表*/
  join_requests: JoinRequests[] | null
}

/**@see GroupSystemMSG*/
export interface GroupSystemRequests extends GroupId {
  /**请求ID*/
  request_id: int64
  /**群名*/
  group_name: string
  /**处理者, 未处理为0*/
  actor: int64
  /**是否已被处理*/
  checked: boolean
}

/**邀请消息列表*/
export interface InvitedRequests extends GroupSystemRequests {
  /**邀请者*/
  invitor_uin: int64
  /**邀请者昵称*/
  invitor_nick: string
}

/**进群消息列表*/
export interface JoinRequests extends GroupSystemRequests {
  /**请求者ID*/
  requester_uin: int64
  /**请求者昵称*/
  requester_nick: string
  /**验证消息*/
  message: string
}

/** @see get_group_file_system_info*/
export interface GroupFileSystemInfo {
  /**文件总数*/
  file_count: int32
  /**文件上限*/
  limit_count: int32
  /**已使用空间*/
  used_space: int64
  /**空间上限*/
  total_space: int64
}

/**
 * @see get_group_root_files
 * @see get_group_files_by_folder
 * @see get_group_root_files
 */
export interface GroupRootFileSystemInfo {
  /**文件列表*/
  files: GroupFileInfo[]
  /**文件夹列表*/
  folders: GroupFolderInfo[]
}

/**@see GroupRootFileSystemInfo*/
export interface GroupFileInfo extends GroupId {
  /**文件ID*/
  file_id: string
  /**文件名*/
  file_name: string
  /**文件类型*/
  busid: int32
  /**文件大小*/
  file_size: int64
  /**上传时间*/
  upload_time: int64
  /**过期时间,永久文件恒为0*/
  dead_time: int64
  /**最后修改时间*/
  modify_time: int64
  /**下载次数*/
  download_times: int32
  /**上传者ID*/
  uploader: int64
  /**上传者名字*/
  uploader_name: string
}

/**@see GroupRootFileSystemInfo*/
export interface GroupFolderInfo extends GroupId {
  /**文件夹ID*/
  folder_id: string
  /**文件名*/
  folder_name: string
  /**创建时间*/
  create_time: int64
  /**创建者*/
  creator: int64
  /**创建者名字*/
  creator_name: string
  /**子文件数量*/
  total_file_count: int32
}

/**@see get_group_file_url*/
export interface FileUrl {
  /**文件下载链接*/
  url: string
}

/**@see get_status*/
export interface Status {
  /**表示BOT是否在线*/
  online: boolean
  /**同 [`online`]{@link online}*/
  good: boolean
  /**运行统计*/
  stat: {
    /**收到的数据包总数*/
    packet_received: uint64
    /**发送的数据包总数*/
    packet_sent: uint64
    /**数据包丢失总数*/
    packet_lost: uint32
    /**接受信息总数*/
    message_received: uint64
    /**发送信息总数*/
    message_sent: uint64
    /**TCP 链接断开次数*/
    disconnect_times: uint32
    /**账号掉线次数*/
    lost_times: uint32
    /**最后一条消息时间 */
    last_message_time: int64
  }
}

/**@see get_group_at_all_remain*/
export interface GroupAtAllRemain {
  /**是否可以 @全体成员*/
  can_at_all: boolean
  /**群内所有管理当天剩余 @全体成员 次数*/
  remain_at_all_count_for_group: int16
  /**Bot 当天剩余 @全体成员 次数*/
  remain_at_all_count_for_uin: int16
}

/**@see _get_group_notice */
export interface GroupNotice {
  sender_id: int64
  publish_time: int64
  message: {
    text: string
    images: {
      width: string
      height: string
      id: string
    }[]
  }
}

/**类型分支*/
export interface SubType {
  sub_type: string
}

/**上报事件*/
export interface PostType {
  /**事件发生的时间戳*/
  time: int64
  /**上报类型*/
  post_type: 'message' | 'message_sent' | 'request' | 'notice' | 'meta_event'
  /**收到事件的机器人 QQ 号*/
  self_id: int64
}

/**消息类型*/
export interface MessageType extends PostType, SubType, MessageId, UserId {
  post_type: 'message'
  message_type: string
  /**消息内容*/
  message: string | Tag[]
  /**原始消息内容*/
  raw_message: string
  /**字体*/
  font: int
  /**发送人信息*/
  sender: StrangerInfo
}

/**私聊消息*/
export interface PrivateMessage extends MessageType {
  message_type: 'private'
  /**消息子类型, 如果是好友则是 friend, 如果是群临时会话则是 group, 如果是在群中自身发送则是 group_self*/
  sub_type: 'friend' | 'group' | 'group_self' | 'other'
  /**临时会话来源
   * 0	群聊
   * 1	QQ咨询
   * 2	查找
   * 3	QQ电影
   * 4	热聊
   * 6	验证消息
   * 7	多人聊天
   * 8	约会
   * 9	通讯录
   */
  temp_source: number
}

/**群消息*/
export interface GroupMessage extends MessageType, GroupId {
  message_type: 'group'
  /**消息子类型, 正常消息是 normal, 匿名消息是 anonymous, 系统提示(如「管理员已禁止群内匿名聊天」)是 notice*/
  sub_type: 'normal' | 'anonymous' | 'notice'
  /**匿名信息, 如果不是匿名消息则为 null*/
  anonymous: object
  /**发送人信息*/
  sender: GroupRenderInfo
}

/**请求类型*/
export interface RequestType extends PostType {
  post_type: 'request'
  request_type: string
}

/**加群请求／邀请*/
export interface RequestGroup extends RequestType, SubType, GroupId, UserId {
  request_type: 'group'
  /**请求子类型, 分别表示加群请求、邀请登录号入群*/
  sub_type: 'add' | 'invite'
  /**验证信息*/
  comment: string
  /**请求 flag, 在调用处理请求的 API 时需要传入*/
  flag: string
}

/**加好友请求*/
export interface RequestFriend extends RequestType, UserId {
  request_type: 'friend'
  /**验证信息*/
  comment: string
  /**请求 flag, 在调用处理请求的 API 时需要传入*/
  flag: string
}

export interface MetaEventType extends PostType {
  post_type: 'meta_event'
  meta_event_type: string
}

/**心跳*/
export interface HeartBeat extends MetaEventType {
  meta_event_type: 'heartbeat'
  /**状态信息*/
  status: Status
  /**到下次心跳的间隔,单位毫秒*/
  interval: number
}

/**生命周期*/
export interface LifeCycle extends MetaEventType, SubType {
  meta_event_type: 'lifecycle'
  /**事件子类型,表示 WebSocket 连接成功*/
  sub_type: 'connect'
}

/**@see CQWebSocket.constructor*/
export type CQWebSocketOptions = {
  /**@default "ws:"*/
  protocol?: 'ws:' | 'wss:'
  /**@default "127.0.0.1"*/
  host?: string
  /**@default 6700*/
  port?: number
  /**@default ""*/
  accessToken?: string
  /**基础链接*/
  baseUrl?: string
  /**@default 20s*/
  sendTimeout?: number
  clientConfig?: {
    /**握手请求的超时事件（单位：毫秒）*/
    handshakeTimeout?: number
    /**Enable/disable `permessage-deflate`*/
    perMessageDeflate?: boolean | PerMessageDeflateOptions
    /**Value of the `Sec-WebSocket-Version` header.*/
    protocolVersion?: number
    /**Value of the `Origin` or `Sec-WebSocket-Origin` header 取决于 the protocolVersion.*/
    origin?: string
    /**自定义请求头 */
    headers?: { [key: string]: string }
  } & (ClientOptions | {})
}

/**API 消息发送报文*/
export interface APIRequest {
  action: string
  params: any
  echo: any
}

/**
 * 消息 ID
 * @see send_private_msg
 * @see send_group_msg
 * @see send_group_forward_msg
 * @see send_private_forward_msg
 * @see send_msg
 */
export interface MessageId {
  /**目标消息 ID*/
  message_id: int32
}

export interface ForwardId extends MessageId {
  /**目标消息 ID*/
  forward_id: string
}

export interface GroupId {
  /**群号*/
  group_id: int64
}

export interface UserId {
  /**目标 QQ 号,(发送者)*/
  user_id: int64
}

export interface SenderId {
  /**发送者 QQ 号*/
  sender_id: int64
}

export interface OperatorId {
  /**操作者ID*/
  operator_id: int64
}

/**API 消息回复报文*/
export interface APIResponse<T> {
  status: string
  /**
   * |retcode|说明|
   * |-|-|
   * |0|同时 `status` 为 `ok`,表示操作成功|
   * |1|同时 `status` 为 `async`,表示操作已进入异步执行,具体结果未知|
   * |100|参数缺失或参数无效,通常是因为没有传入必要参数,某些接口中也可能因为参数明显无效(比如传入的 QQ 号小于等于 0,此时无需调用 酷Q 函数即可确定失败),此项和以下的 `status` 均为 `failed`|
   * |102|酷Q 函数返回的数据无效,一般是因为传入参数有效但没有权限,比如试图获取没有加入的群组的成员列表|
   * |103|操作失败,一般是因为用户权限不足,或文件系统异常、不符合预期|
   * |104|由于 酷Q 提供的凭证(Cookie 和 CSRF Token)失效导致请求 QQ 相关接口失败,可尝试清除 酷Q 缓存来解决|
   * |201|工作线程池未正确初始化(无法执行异步任务)|
   */
  retcode: number
  data: T
  echo: any
}

/**API 消息回复错误报文*/
export interface ErrorAPIResponse extends APIResponse<null> {
  data: null
  msg: string
  wording: string
}

/**通知类型*/
export interface NoticeType extends PostType {
  post_type: 'notice'
  notice_type: string
}

/**群文件上传*/
export interface GroupUpload extends NoticeType, GroupId, UserId {
  notice_type: 'group_upload'
  /**文件信息*/
  file: {
    /**文件 ID*/
    id: string
    /**文件名*/
    name: string
    /**文件大小(字节数)*/
    size: int64
    /**busid(目前不清楚有什么作用)*/
    busid: int64
  }
}

/**群管理员变动*/
export interface GroupAdmin extends NoticeType, SubType, GroupId, UserId {
  notice_type: 'group_admin'
  /**set、unset  事件子类型, 分别表示设置和取消管理员*/
  sub_type: 'set' | 'unset'
}

/**群成员减少*/
export interface GroupDecrease extends NoticeType, SubType, GroupId, UserId, OperatorId {
  notice_type: 'group_decrease'
  /**事件子类型, 分别表示主动退群、成员被踢、登录号被踢*/
  sub_type: 'leave' | 'kick' | 'kick_me'
  /**操作者 QQ 号(如果是主动退群, 则和 [user_id]{@link GroupDecrease.user_id} 相同 )*/
  operator_id: int64
}

/**群成员增加*/
export interface GroupIncrease extends NoticeType, SubType, GroupId, UserId, OperatorId {
  notice_type: 'group_increase'
  /**事件子类型, 分别表示管理员已同意入群、管理员邀请入群*/
  sub_type: 'approve' | 'invite'
}

/**群禁言*/
export interface GroupBan extends NoticeType, SubType, GroupId, UserId, OperatorId {
  notice_type: 'group_ban'
  /**事件子类型, 分别表示禁言、解除禁言*/
  sub_type: 'ban' | 'lift_ban'
  /**禁言时长, 单位秒*/
  duration: int64
}

/**好友添加*/
export interface FriendAdd extends NoticeType, UserId {
  notice_type: 'friend_add'
}

/**群消息撤回*/
export interface GroupRecall extends NoticeType, MessageId, GroupId, UserId, OperatorId {
  /**group_recall  通知类型*/
  notice_type: 'group_recall'
}

/**好友消息撤回*/
export interface FriendRecall extends NoticeType, MessageId, UserId {
  /**friend_recall  通知类型*/
  notice_type: 'friend_recall'
}

export interface NoticeNotifyType extends NoticeType, SubType {
  notice_type: 'notify'
}

export interface TargetId {
  /**被戳者 QQ 号*/
  target_id: int64
}

/**好友戳一戳*/
export interface NotifyPokeFriend extends NoticeNotifyType, UserId, SenderId, TargetId {
  sub_type: 'poke'
}

/**群内戳一戳*/
export interface NotifyPokeGroup extends NoticeNotifyType, UserId, GroupId, TargetId {
  sub_type: 'poke'
}

/**群红包运气王提示*/
export interface NotifyLuckyKing extends NoticeNotifyType, GroupId, UserId, TargetId {
  sub_type: 'lucky_king'
  /**红包发送者id*/
  user_id: int64
  /**运气王id*/
  target_id: int64
}

/**群成员荣誉变更提示*/
export interface NotifyHonor extends NoticeNotifyType, GroupId, UserId {
  sub_type: 'honor'
  /**talkative:龙王 performer:群聊之火 emotion:快乐源泉  荣誉类型*/
  honor_type: 'talkative' | 'performer' | 'emotion' | string
}

/**群成员名片更新*/
export interface GroupCard extends NoticeType, GroupId, UserId {
  notice_type: 'group_card'
  /**新名片*/
  card_new: string
  /**旧名片*/
  card_old: string
}

/**接收到离线文件*/
export interface OfflineFile extends NoticeType, UserId {
  notice_type: 'offline_file'
  /**文件数据*/
  file: {
    /**文件名*/
    name: string
    /**文件大小*/
    size: int64
  } & FileUrl
}

/**@see get_online_clients*/
export interface Device {
  /**客户端ID*/
  app_id: int64
  /**设备名称*/
  device_name: string
  /**设备类型*/
  device_kind: string
}

/**其他客户端在线状态*/
export interface ClientStatus extends NoticeType {
  notice_type: 'client_status'
  /**客户端信息*/
  client: Device
  /**当前是否在线*/
  online: boolean
}

export interface Essence extends NoticeType, MessageId, SenderId, OperatorId {
  notice_type: 'essence'
  /**添加为add,移出为delete*/
  sub_type: 'add' | 'delete'
}

/**@see get_essence_msg_list*/
export interface EssenceMessage extends MessageId, SenderId, OperatorId {
  /**发送者昵称*/
  sender_nick: string
  /**消息发送时间*/
  sender_time: int64
  /**操作者昵称*/
  operator_nick: string
  /**精华设置时间*/
  operator_time: int64
}

/**@see ocr_image*/
export interface OCRImage {
  /**OCR结果*/
  texts: {
    /**文本*/
    text: string
    /**置信度*/
    confidence: int32
    /**坐标*/
    coordinates: [number, number]
  }[]
  /**语言*/
  language: string
}

/**@see download_file*/
export interface DownloadFile extends FileStr {
  /**下载文件的绝对路径*/
  file: string
}

/**@see check_url_safely*/
export interface URLSafely {
  /**安全等级, 1: 安全 2: 未知 3: 危险*/
  level: 1 | 2 | 3
}

/**@see get_model_show*/
export interface Variants {
  model_show: string
  need_pay: boolean
}

export interface ResponseHandle {
  response: APIResponse<any>
  sourceMSG: APIRequest
}

export interface SocketResponse {
  code: number
  reason: string
}

export interface ListenerChangeType {
  type: keyof SocketHandle
  handler: EventHandle<keyof SocketHandle>
}

export type int = number
export type int16 = number
export type int32 = number
export type int64 = number
export type uint32 = number
export type uint64 = number

type NoCache = { no_cache?: boolean }
type Content = { content: string }
type Domain = { domain: string }
type Enable = { enable?: boolean }
type Duration = { duration?: uint32 }
type QuickOperationType<T extends keyof QuickOperation> = {
  context: SocketHandle[T]
  operation: QuickOperation[T]
}
export type ErrorEventHandle = <T extends keyof SocketHandle>(
  error: any,
  type: T,
  handler: EventHandle<T>
) => void
export type EventHandle<T extends keyof SocketHandle> = (this: void, event: CQEvent<T>) => void
export type PartialSocketHandle = { [key in keyof SocketHandle]?: EventHandle<key> }
export type SocketHandle = {
  'message.private': PrivateMessage
  'message.group': GroupMessage
  message: PrivateMessage | GroupMessage

  'request.friend': RequestFriend
  'request.group': RequestGroup
  request: RequestGroup | RequestFriend

  'socket.connecting': void
  'socket.connectingEvent': void
  'socket.open': void
  'socket.openEvent': void
  'socket.close': SocketResponse
  'socket.closeEvent': SocketResponse
  'socket.error': SocketResponse
  'socket.errorEvent': SocketResponse
  socket: SocketResponse | void

  'api.preSend': APIRequest
  'api.response': ResponseHandle
  api: ResponseHandle | APIRequest

  'meta_event.lifecycle': LifeCycle
  'meta_event.heartbeat': HeartBeat
  meta_event: HeartBeat | LifeCycle

  'notice.group_admin': GroupAdmin
  'notice.group_upload': GroupUpload
  'notice.group_decrease': GroupDecrease
  'notice.group_increase': GroupIncrease
  'notice.group_ban': GroupBan
  'notice.friend_add': FriendAdd
  'notice.group_recall': GroupRecall
  'notice.friend_recall': FriendRecall
  'notice.notify.poke.friend': NotifyPokeFriend
  'notice.notify.poke.group': NotifyPokeGroup
  'notice.notify.lucky_king': NotifyLuckyKing
  'notice.notify.honor': NotifyHonor
  'notice.notify': NotifyHonor | NotifyLuckyKing | NotifyPokeGroup | NotifyPokeFriend
  'notice.group_card': GroupCard
  'notice.offline_file': OfflineFile
  'notice.client_status': ClientStatus
  'notice.essence': Essence
  notice:
    | Essence
    | ClientStatus
    | OfflineFile
    | GroupCard
    | NotifyHonor
    | NotifyLuckyKing
    | NotifyPokeGroup
    | NotifyPokeFriend
    | FriendRecall
    | GroupRecall
    | FriendAdd
    | GroupBan
    | GroupIncrease
    | GroupDecrease
    | GroupUpload
    | GroupAdmin

  message_sent: any
}

export type QuickOperation = {
  'message.private': {
    /**要回复的内容*/
    reply?: message
  }
  'message.group': {
    /**要回复的内容*/
    reply?: message
    /**
     * 是否要在回复开头 at 发送者(自动添加), 发送者是匿名用户时无效
     * @default true
     */
    at_sender?: boolean
    /**
     * 撤回该条消息
     * @default false
     */
    delete?: boolean
    /**
     * 把发送者踢出群组(需要登录号权限足够), **不**拒绝此人后续加群请求, 发送者是匿名用户时无效
     * @default false
     */
    kick?: boolean
    /**
     * 把发送者禁言 ban_duration 指定时长, 对匿名用户也有效
     * @default false
     */
    ban?: boolean
    /**
     * 禁言时长
     * @default 30*60
     */
    ban_duration?: uint32
  }
  'request.friend': {
    /**
     * 是否同意请求
     * @default false
     */
    approve?: boolean
    /**
     * 添加后的好友备注(仅在同意时有效)
     * @default ""
     */
    remark?: string
  }
  'request.group': {
    /**
     * 是否同意请求／邀请
     * @default false
     */
    approve?: boolean
    /**
     * 拒绝理由(仅在拒绝时有效)
     * @default ""
     */
    reason?: string
  }
}

export type WSSendParam = {
  get_login_info: {}
  set_qq_profile: {
    nickname: string
    company: string
    email: string
    college: string
    personal_note: string
  }
  qidian_get_account_info: {}
  _get_model_show: { model: string }
  _set_model_show: { model: string; model_show: string }
  get_online_clients: NoCache
  get_stranger_info: NoCache & UserId
  get_friend_list: {}
  get_unidirectional_friend_list: {}
  delete_friend: UserId
  delete_unidirectional_friend: UserId
  send_private_msg: { group_id?: number; auto_escape?: boolean } & UserId & Message
  send_group_msg: { auto_escape?: boolean } & Message & GroupId
  send_msg: PrivateData | GroupData
  get_msg: MessageId
  delete_msg: MessageId
  mark_msg_as_read: MessageId
  get_forward_msg: { message_id: string; id: string }
  send_group_forward_msg: { messages: messageNode } & GroupId
  send_private_forward_msg: { messages: messageNode } & UserId
  get_group_msg_history: { message_seq?: int64 } & GroupId
  get_image: FileStr
  can_send_image: {}
  ocr_image: { image: string }
  get_record: { out_format: string } & FileStr
  can_send_record: {}
  set_friend_add_request: { flag: string; approve?: boolean; remark?: string }
  set_group_add_request: {
    flag: string
    sub_type: string
    approve?: boolean
    reason?: string
    type?: string
  }
  get_group_info: NoCache & GroupId
  get_group_list: NoCache
  get_group_member_info: NoCache & GroupId & UserId
  get_group_member_list: NoCache & GroupId
  get_group_honor_info: { type: string } & GroupId
  get_group_system_msg: {}
  get_essence_msg_list: GroupId
  get_group_at_all_remain: GroupId
  set_group_name: { group_name?: string } & GroupId
  set_group_portrait: { cache?: number } & GroupId & FileStr
  set_group_admin: Enable & GroupId & UserId
  set_group_card: { card?: string } & GroupId & UserId
  set_group_special_title: { special_title?: string } & GroupId & UserId & Duration
  set_group_ban: Duration & GroupId & UserId
  set_group_whole_ban: Enable & GroupId
  set_group_anonymous_ban: { anonymous: any; anonymous_flag?: string; flag?: string } & GroupId &
    Duration
  set_essence_msg: MessageId
  delete_essence_msg: MessageId
  send_group_sign: {}
  set_group_anonymous: Enable & GroupId
  _send_group_notice: { image: string } & Content & GroupId
  _get_group_notice: { group_id: int64 }
  set_group_kick: { reject_add_request?: boolean } & GroupId & UserId
  set_group_leave: { is_dismiss?: boolean } & GroupId
  upload_group_file: { name: string; folder?: string } & GroupId & FileStr
  delete_group_file: { file_id: string; busid: int32 } & GroupId
  create_group_file_folder: { name: string; parent_id: '/' } & GroupId
  delete_group_folder: { folder_id: string } & GroupId
  get_group_file_system_info: GroupId
  get_group_root_files: GroupId
  get_group_files_by_folder: { folder_id: string } & GroupId
  get_group_file_url: { file_id: string; busid: int32 } & GroupId
  upload_private_file: { name: string } & FileStr & UserId
  get_cookies: Domain
  get_csrf_token: {}
  get_credentials: Domain
  get_version_info: {}
  get_status: {}
  set_restart: { delay?: number }
  clean_cache: {}
  reload_event_filter: { file: string }
  download_file: { thread_count: int32; headers: string | string[] } & FileUrl
  check_url_safely: FileUrl
  '.get_word_slices': Content
  '.handle_quick_operation': QuickOperationType<keyof QuickOperation>
}

export type WSSendReturn = {
  get_login_info: LoginInfo
  set_qq_profile: void
  qidian_get_account_info: QiDianAccountInfo
  _get_model_show: Variants[]
  _set_model_show: void
  get_online_clients: Device[]
  get_stranger_info: StrangerInfo
  get_friend_list: FriendInfo[]
  get_unidirectional_friend_list: SourceInfo[]
  delete_friend: void
  delete_unidirectional_friend: void
  send_private_msg: MessageId
  send_group_msg: MessageId
  send_msg: MessageId
  get_msg: MessageInfo
  delete_msg: void
  mark_msg_as_read: void
  get_forward_msg: ForwardData
  send_group_forward_msg: ForwardId
  send_private_forward_msg: ForwardId
  get_group_msg_history: message[]
  get_image: QQImageData
  can_send_image: CanSend
  ocr_image: OCRImage
  get_record: RecordFormatData
  can_send_record: CanSend
  set_friend_add_request: void
  set_group_add_request: GroupAddRequest
  get_group_info: GroupInfo
  get_group_list: GroupInfo[]
  get_group_member_info: GroupMemberInfo
  get_group_member_list: GroupMemberInfo[]
  get_group_honor_info: GroupHonorInfo
  get_group_system_msg: GroupSystemMSG | null
  get_essence_msg_list: EssenceMessage[]
  get_group_at_all_remain: GroupAtAllRemain
  set_group_name: void
  set_group_portrait: void
  set_group_admin: void
  set_group_card: void
  set_group_special_title: void
  set_group_ban: void
  set_group_whole_ban: void
  set_group_anonymous_ban: void
  set_essence_msg: void
  delete_essence_msg: void
  send_group_sign: void
  set_group_anonymous: void
  _send_group_notice: void
  _get_group_notice: GroupNotice
  set_group_kick: void
  set_group_leave: void
  upload_group_file: void
  delete_group_file: void
  create_group_file_folder: void
  delete_group_folder: void
  get_group_file_system_info: GroupFileSystemInfo
  get_group_root_files: GroupRootFileSystemInfo
  get_group_files_by_folder: GroupRootFileSystemInfo
  get_group_file_url: FileUrl
  upload_private_file: void
  get_cookies: CookiesData
  get_csrf_token: CSRFTokenData
  get_credentials: CookiesData & CSRFTokenData
  get_version_info: VersionInfo
  get_status: Status
  set_restart: void
  clean_cache: void
  reload_event_filter: void
  download_file: DownloadFile
  check_url_safely: URLSafely
  '.get_word_slices': WordSlicesData
  '.handle_quick_operation': void
}

export interface ILogger {
  debug(...data: any[]): void

  error(...data: any[]): void

  info(...data: any[]): void

  trace(...data: any[]): void

  warn(...data: any[]): void
}

export interface PromiseRes<T> extends Promise<T> {
  then<S = T, F = never>(
    onFulfilled?: ((value: T) => S | Promise<S>) | null,
    onRejected?: ((reason: ErrorAPIResponse) => F | Promise<F>) | null
  ): Promise<S | F>

  catch<S = never>(
    onRejected?: ((reason: ErrorAPIResponse) => S | Promise<S>) | undefined | null
  ): Promise<T | S>
}
