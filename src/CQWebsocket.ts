// noinspection JSUnusedGlobalSymbols

import { EventEmitter } from 'events'
import http from 'http'
import WebSocket, { ClientOptions, Data } from 'ws'
import {
  APIRequest,
  APIResponse,
  CanSend,
  CookiesData,
  CQWebSocketOptions,
  CSRFTokenData,
  Device,
  DownloadFile,
  ErrorAPIResponse,
  ErrorEventHandle,
  EssenceMessage,
  EventHandle,
  FileUrl,
  ForwardData,
  FriendInfo,
  GroupAtAllRemain,
  GroupData,
  GroupFileSystemInfo,
  GroupHonorInfo,
  GroupInfo,
  GroupMemberInfo,
  GroupRootFileSystemInfo,
  GroupSystemMSG,
  ILogger,
  int64,
  LoginInfo,
  MessageId,
  MessageInfo,
  OCRImage,
  PartialSocketHandle,
  PrivateData,
  PromiseRes,
  QiDianAccountInfo,
  QQImageData,
  QuickOperation,
  RecordFormatData,
  SocketHandle,
  Status,
  StrangerInfo,
  URLSafely,
  Variants,
  VersionInfo,
  VipInfo,
  WordSlicesData,
  WSSendParam,
  WSSendReturn
} from './Interfaces'
import { CQ, CQTag, message, messageNode } from './tags'

type onSuccess<T> = (this: void, json: APIResponse<T>, message: APIRequest) => void
type onFailure = (this: void, reason: ErrorAPIResponse, message: APIRequest) => void
type ObjectEntries<T, K extends keyof T = keyof T> = [K, T[K]][]

interface ResponseHandler {
  onSuccess: (this: void, json: APIResponse<any>) => void
  onFailure: (this: void, reason: ErrorAPIResponse) => void
  message: APIRequest
  sendTime: [number, number]
}

/**
 * 本类中所有api基于 `go-cqhttp-v1.0.0-rc1` <br/>
 * go-cqhttp标准文档最后编辑日期： `2/10/2022, 8:19:21 AM` <br/>
 * **注：** 标记为 `@protected` 的方法为__未被支持__方法，禁止使用 <br/>
 * **注2：** 标记为 `@deprecated` 的方法为__隐藏 API__，并非过时方法，__不__建议一般用户使用，不正确的使用可能造成程序运行不正常
 */
export class CQWebSocket {
  private static sendTimeout(this: CQWebSocket) {
    for (const [k, v] of this._responseHandlers.entries()) {
      const hrtime: number = process.hrtime(v.sendTime)[0]
      if (hrtime > this._sendTimeout) {
        this._responseHandlers.delete(k)
        v.onFailure({
          data: null,
          echo: undefined,
          msg: '',
          retcode: 500,
          status: 'TIMEOUT',
          wording: '发送超时'
        })
      }
    }
  }

  /**消息发送成功时自动调用*/
  public messageSuccess: onSuccess<any>
  /**消息发送失败时自动调用*/
  public messageFail: onFailure
  private _logger: ILogger
  private _responseHandlers: Map<string, ResponseHandler>
  private _eventBus: CQEventBus

  private readonly _sendTimeout: number
  private readonly _accessToken: string
  private readonly _baseUrl: string
  private readonly _clientConfig?: ClientOptions | http.ClientRequestArgs
  private readonly _debug: boolean
  private _socket?: WebSocket
  private _socketEvent?: WebSocket
  private _sendTimeoutTimer?: NodeJS.Timer

  // noinspection JSCommentMatchesSignature
  /**
   * @param {boolean} debug 是否启用 DEBUG 模式
   */
  constructor(
    {
      protocol = 'ws:',
      host = '127.0.0.1',
      port = 6700,
      accessToken = '',
      baseUrl,
      clientConfig,
      sendTimeout = 20
    }: CQWebSocketOptions = {},
    debug = false
  ) {
    this._logger = console
    this._debug = Boolean(debug)
    this._sendTimeout = sendTimeout
    this._responseHandlers = new Map()
    this._eventBus = new CQEventBus(this)
    this._accessToken = accessToken
    this._baseUrl = baseUrl ?? `${protocol}//${host}:${port}`
    this._clientConfig = clientConfig
    this.messageSuccess = ret => this.logger.info(`发送成功:${ret.echo}`)
    this.messageFail = reason => this.logger.info(`发送失败[${reason.retcode}]:${reason.wording}`)
    this.errorEvent = error => this.logger.error('调用API失败', error)
    this._socket = this._socketEvent = undefined
  }

  /**
   * 发送私聊消息
   * @param user_id  对方 QQ 号
   * @param message 要发送的内容
   * @param auto_escape 消息内容是否作为纯文本发送(即不解析 CQ 码),只在 message 字段是字符串时有效
   */
  public send_private_msg(
    user_id: int64,
    message: message,
    auto_escape = false
  ): PromiseRes<MessageId> {
    return this.send('send_private_msg', { user_id: +user_id, message, auto_escape })
  }

  /**
   * 发送群消息
   * @param group_id 群号
   * @param message  要发送的内容
   * @param auto_escape 消息内容是否作为纯文本发送(即不解析 CQ 码),只在 message 字段是字符串时有效
   */
  public send_group_msg(
    group_id: int64,
    message: message,
    auto_escape = false
  ): PromiseRes<MessageId> {
    return this.send('send_group_msg', { group_id: +group_id, message, auto_escape })
  }

  /**
   * 发送合并转发(群)
   * @param group_id 群号
   * @param messages 自定义转发消息
   */
  public send_group_forward_msg(group_id: int64, messages: messageNode): PromiseRes<MessageId> {
    return this.send('send_group_forward_msg', { group_id: +group_id, messages })
  }

  /**
   * 发送消息
   * @param data
   */
  public send_msg(data: PrivateData | GroupData): PromiseRes<MessageId> {
    return this.send('send_msg', data)
  }

  /**
   * 撤回消息
   * @param message_id 消息 ID
   */
  public delete_msg(message_id: number): PromiseRes<void> {
    return this.send('delete_msg', { message_id })
  }

  /**
   * 获取消息
   * @param message_id 消息 ID
   */
  public get_msg(message_id: number): PromiseRes<MessageInfo> {
    return this.send('get_msg', { message_id })
  }

  /**
   * 获取合并转发内容
   * @param message_id 消息id
   */
  public get_forward_msg(message_id: string): PromiseRes<ForwardData> {
    return this.send('get_forward_msg', { message_id })
  }

  /**
   * 获取图片信息
   * @param file 图片缓存文件名
   */
  public get_image(file: string): PromiseRes<QQImageData> {
    return this.send('get_image', { file })
  }

  /**
   * 群组踢人
   * @param group_id 群号
   * @param user_id 要踢的 QQ 号
   * @param reject_add_request 拒绝此人的加群请求
   */
  public set_group_kick(
    group_id: int64,
    user_id: int64,
    reject_add_request = false
  ): PromiseRes<void> {
    return this.send('set_group_kick', {
      group_id: +group_id,
      user_id: +user_id,
      reject_add_request
    })
  }

  /**
   * 群组单人禁言
   * @param group_id 群号
   * @param user_id 要禁言的 QQ 号
   * @param duration 禁言时长, 单位秒, 0 表示取消禁言
   */
  public set_group_ban(group_id: int64, user_id: int64, duration = 30 * 60): PromiseRes<void> {
    return this.send('set_group_ban', { group_id: +group_id, user_id: +user_id, duration })
  }

  /**
   * 群组匿名用户禁言
   * @param group_id 群号
   * @param anonymous 选一，优先, 要禁言的匿名用户对象（群消息上报的 anonymous 字段）
   * @param duration 禁言时长, 单位秒, 无法取消匿名用户禁言
   * @param anonymous_flag 选一, 要禁言的匿名用户的 flag（需从群消息上报的数据中获得）
   */
  public set_group_anonymous_ban(
    group_id: int64,
    anonymous: any,
    duration = 30 * 60,
    anonymous_flag?: string
  ): PromiseRes<void> {
    return this.send('set_group_anonymous_ban', {
      group_id: +group_id,
      anonymous,
      duration,
      anonymous_flag
    })
  }

  /**
   * 群组全员禁言
   * @param group_id 群号
   * @param enable 是否禁言
   */
  public set_group_whole_ban(group_id: int64, enable = true): PromiseRes<void> {
    return this.send('set_group_whole_ban', { group_id: +group_id, enable })
  }

  /**
   * 群组设置管理员
   * @param group_id 群号
   * @param user_id 要设置管理员的 QQ 号
   * @param enable true 为设置, false 为取消
   */
  public set_group_admin(group_id: int64, user_id: int64, enable = true): PromiseRes<void> {
    return this.send('set_group_admin', { group_id: +group_id, user_id: +user_id, enable })
  }

  /**
   * 群组匿名
   * @protected
   * @param group_id 群号
   * @param enable 是否允许匿名聊天
   */
  protected set_group_anonymous(group_id: int64, enable = true): PromiseRes<void> {
    return this.send('set_group_anonymous', { group_id: +group_id, enable })
  }

  /**
   * 设置群名片(群备注)
   * @param group_id 群号
   * @param user_id 要设置的 QQ 号
   * @param card 群名片内容, 不填或空字符串表示删除群名片
   */
  public set_group_card(group_id: int64, user_id: int64, card = ''): PromiseRes<void> {
    return this.send('set_group_card', { group_id: +group_id, user_id: +user_id, card })
  }

  /**
   * 设置群名
   * @param group_id 群号
   * @param group_name 新群名
   */
  public set_group_name(group_id: int64, group_name = ''): PromiseRes<void> {
    return this.send('set_group_name', { group_id: +group_id, group_name })
  }

  /**
   * 退出群组
   * @param group_id 群号
   * @param is_dismiss 是否解散, 如果登录号是群主, 则仅在此项为 true 时能够解散
   */
  public set_group_leave(group_id: int64, is_dismiss = false): PromiseRes<void> {
    return this.send('set_group_leave', { group_id: +group_id, is_dismiss })
  }

  /**
   * 设置群组专属头衔
   * @param group_id 群号
   * @param user_id 要设置的 QQ 号
   * @param special_title 专属头衔, 不填或空字符串表示删除专属头衔
   * @param duration 专属头衔有效期, 单位秒, -1 表示永久, 不过此项似乎没有效果, 可能是只有某些特殊的时间长度有效, 有待测试
   */
  public set_group_special_title(
    group_id: int64,
    user_id: int64,
    special_title = '',
    duration = -1
  ): PromiseRes<void> {
    return this.send('set_group_special_title', {
      group_id: +group_id,
      user_id: +user_id,
      special_title,
      duration
    })
  }

  /**
   * 处理加好友请求
   * @param flag 加好友请求的 flag（需从上报的数据中获得）
   * @param approve 是否同意请求
   * @param remark 添加后的好友备注（仅在同意时有效）
   */
  public set_friend_add_request(flag: string, approve = true, remark = ''): PromiseRes<void> {
    return this.send('set_friend_add_request', { flag, approve, remark })
  }

  /**
   * 处理加群请求／邀请
   * @param flag 加好友请求的 flag（需从上报的数据中获得）
   * @param sub_type add 或 invite, 请求类型（需要和上报消息中的 sub_type 字段相符）
   * @param approve 是否同意请求／邀请
   * @param reason 拒绝理由（仅在拒绝时有效）
   */
  public set_group_add_request(
    flag: string,
    sub_type: string,
    approve = true,
    reason = ''
  ): PromiseRes<void> {
    return this.send('set_group_add_request', { flag, sub_type, type: sub_type, approve, reason })
  }

  /**获取登录号信息*/
  public get_login_info(): PromiseRes<LoginInfo> {
    return this.send('get_login_info', {})
  }

  /**获取企点账号信息,该API只有企点协议可用*/
  public qidian_get_account_info(): PromiseRes<QiDianAccountInfo> {
    return this.send('qidian_get_account_info', {})
  }

  /**
   * 获取陌生人信息
   * @param user_id QQ 号
   * @param no_cache 是否不使用缓存（使用缓存可能更新不及时, 但响应更快）
   */
  public get_stranger_info(user_id: int64, no_cache = false): PromiseRes<StrangerInfo> {
    return this.send('get_stranger_info', { user_id: +user_id, no_cache })
  }

  /**获取好友列表*/
  public get_friend_list(): PromiseRes<FriendInfo[]> {
    return this.send('get_friend_list', {})
  }

  /**
   * 删除好友
   * @param user_id 好友 QQ 号
   */
  public delete_friend(user_id: number): PromiseRes<void> {
    return this.send('delete_friend', { user_id })
  }

  /**
   * 获取群信息
   * 如果机器人尚未加入群, `group_create_time`, `group_level`, `max_member_count` 和 `member_count` 将会为0
   * @param group_id 群号
   * @param no_cache 是否不使用缓存（使用缓存可能更新不及时, 但响应更快）
   */
  public get_group_info(group_id: int64, no_cache = false): PromiseRes<GroupInfo> {
    return this.send('get_group_info', { group_id: +group_id, no_cache })
  }

  /**获取群列表*/
  public get_group_list(): PromiseRes<GroupInfo[]> {
    return this.send('get_group_list', {})
  }

  /**
   * 获取群成员信息
   * @param group_id 群号
   * @param user_id QQ 号
   * @param no_cache 是否不使用缓存（使用缓存可能更新不及时, 但响应更快）
   */
  public get_group_member_info(
    group_id: int64,
    user_id: int64,
    no_cache = false
  ): PromiseRes<GroupMemberInfo> {
    return this.send('get_group_member_info', { group_id: +group_id, user_id: +user_id, no_cache })
  }

  /**
   * 获取群成员列表
   *
   * **注：** 获取列表时和获取单独的成员信息时, 某些字段可能有所不同
   *
   * 例如：`area`、`title` 等字段在获取列表时无法获得, 具体应以[单独的成员信息]{@link get_group_member_info}为准。
   * @param group_id 群号
   * @see  get_group_member_info
   */
  public get_group_member_list(group_id: int64): PromiseRes<GroupMemberInfo[]> {
    return this.send('get_group_member_list', { group_id: +group_id })
  }

  /**
   * 获取群荣誉信息
   * @param group_id 群号
   * @param type 要获取的群荣誉类型, 可传入 `talkative`, `performer`, `legend`, `strong_newbie`, `emotion`
   *             以分别获取单个类型的群荣誉数据, 或传入 `all` 获取所有数据
   */
  public get_group_honor_info(group_id: int64, type: string): PromiseRes<GroupHonorInfo> {
    return this.send('get_group_honor_info', { group_id: +group_id, type })
  }

  /**
   * 获取 Cookies
   * @protected
   * @param domain 需要获取 cookies 的域名
   */
  protected get_cookies(domain: string): PromiseRes<CookiesData> {
    return this.send('get_cookies', { domain })
  }

  /**
   * 获取 CSRF Token
   * @protected
   */
  protected get_csrf_token(): PromiseRes<CSRFTokenData> {
    return this.send('get_csrf_token', {})
  }

  /**
   * 获取 QQ 相关接口凭证
   * @protected
   * @param domain 需要获取 cookies 的域名
   */
  protected get_credentials(domain: string): PromiseRes<CookiesData & CSRFTokenData> {
    return this.send('get_credentials', { domain })
  }

  /**
   * 获取语音
   * @protected
   * @param file 收到的语音文件名（消息段的 file 参数）
   * @param out_format 要转换到的格式, 目前支持 mp3、amr、wma、m4a、spx、ogg、wav、flac
   */
  protected get_record(file: string, out_format: string): PromiseRes<RecordFormatData> {
    return this.send('get_record', { file, out_format })
  }

  /**检查是否可以发送图片*/
  public can_send_image(): PromiseRes<CanSend> {
    return this.send('can_send_image', {})
  }

  /**检查是否可以发送语音*/
  public can_send_record(): PromiseRes<CanSend> {
    return this.send('can_send_record', {})
  }

  /**获取版本信息*/
  public get_version_info(): PromiseRes<VersionInfo> {
    return this.send('get_version_info', {})
  }

  /**
   * 重启 go-cqhttp
   * @param delay 要延迟的毫秒数, 如果默认情况下无法重启, 可以尝试设置延迟为 2000 左右
   */
  public set_restart(delay = 0): PromiseRes<void> {
    return this.send('set_restart', { delay })
  }

  /**
   * 清理缓存
   * @protected
   */
  protected clean_cache(): PromiseRes<void> {
    return this.send('clean_cache', {})
  }

  /**
   * 设置群头像<br/>
   * **[1]** 目前这个API在登录一段时间后因cookie失效而失效, 请考虑后使用
   * @param group_id 群号
   * @param file 图片文件名,支持以下几种格式：<br/>
   * - 绝对路径, 例如 `file:///C:\\anyUri\fileName.png`, 格式使用 [`file` URI]{@link https://tools.ietf.org/html/rfc8089}<br/>
   * - 网络 URL, 例如 `http://anyUrl/name.jpg`<br/>
   * - Base64 编码, 例如 `base64://anyString`
   * @param cache 表示是否使用已缓存的文件,通过网络 URL 发送时有效, `1` 表示使用缓存, `0` 关闭关闭缓存, 默认 为 `1`
   */
  public set_group_portrait(group_id: int64, file: string, cache = 1): PromiseRes<void> {
    return this.send('set_group_portrait', { group_id: +group_id, file, cache })
  }

  /**
   * 获取中文分词(隐藏 API)
   * @deprecated
   * @param content 内容
   */
  public get_word_slices(content: string): PromiseRes<WordSlicesData> {
    return this.send('.get_word_slices', { content })
  }

  /**
   * 图片OCR
   * @param image 图片ID
   */
  public ocr_image(image: string): PromiseRes<OCRImage> {
    return this.send('ocr_image', { image })
  }

  /**获取群系统消息, 如果列表不存在任何消息, 将返回 `null`*/
  public get_group_system_msg(): PromiseRes<GroupSystemMSG | null> {
    return this.send('get_group_system_msg', {})
  }

  /**
   * 上传群文件<br/>
   * 在不提供 folder 参数的情况下默认上传到根目录 只能上传本地文件, 需要上传 http 文件的话请先调用 download_file API下载
   * @param group_id 群号
   * @param file 本地文件路径
   * @param name 储存名称
   * @param folder 父目录ID
   */
  public upload_group_file(
    group_id: int64,
    file: string,
    name: string,
    folder?: string
  ): PromiseRes<void> {
    return this.send('upload_group_file', { group_id: +group_id, file, name, folder })
  }

  /**
   * 获取群文件系统信息
   * @param group_id 群号
   */
  public get_group_file_system_info(group_id: int64): PromiseRes<GroupFileSystemInfo> {
    return this.send('get_group_file_system_info', { group_id: +group_id })
  }

  /**
   * 获取群根目录文件列表
   * @param group_id 群号
   */
  public get_group_root_files(group_id: int64): PromiseRes<GroupRootFileSystemInfo> {
    return this.send('get_group_root_files', { group_id: +group_id })
  }

  /**
   * 获取群子目录文件列表
   * @param group_id 群号
   * @param folder_id 文件夹ID 参考 [GroupFolderInfo]{@link GroupFolderInfo.folder_id} 对象
   */
  public get_group_files_by_folder(
    group_id: int64,
    folder_id: string
  ): PromiseRes<GroupRootFileSystemInfo> {
    return this.send('get_group_files_by_folder', { group_id: +group_id, folder_id })
  }

  /**
   * 获取群文件资源链接
   * @param group_id 群号
   * @param file_id 文件ID 参考 [GroupFileInfo]{@link GroupFileInfo.file_id} 对象
   * @param busid 文件类型 参考 [GroupFileInfo]{@link GroupFileInfo.busid} 对象
   * @return 返回下载链接
   */
  public get_group_file_url(group_id: int64, file_id: string, busid: number): PromiseRes<FileUrl> {
    return this.send('get_group_file_url', { group_id: +group_id, file_id, busid })
  }

  /**
   * 获取状态
   *
   * **注意**：所有统计信息都将在重启后重制
   */
  public get_status(): PromiseRes<Status> {
    return this.send('get_status', {})
  }

  /**
   * 获取群 @全体成员 剩余次数
   * @param group_id 群号
   */
  public get_group_at_all_remain(group_id: int64): PromiseRes<GroupAtAllRemain> {
    return this.send('get_group_at_all_remain', { group_id: +group_id })
  }

  /**
   * 对事件执行快速操作(隐藏 API)
   * @param context 事件数据对象, 可做精简, 如去掉 message 等无用字段
   * @param operation 快速操作对象, 例如 `{ "ban": true, "reply": "请不要说脏话"}`
   * @deprecated
   */
  public handle_quick_operation<T extends keyof QuickOperation>(
    context: SocketHandle[T],
    operation: QuickOperation[T]
  ): PromiseRes<void> {
    return this.send('.handle_quick_operation', { context, operation })
  }

  /**
   * 获取VIP信息
   * @param user_id QQ 号
   */
  public get_vip_info(user_id: int64): PromiseRes<VipInfo> {
    return this.send('_get_vip_info', { user_id: +user_id })
  }

  /**
   * 发送群公告
   * @param group_id QQ 号
   * @param content 公告内容
   */
  public send_group_notice(group_id: int64, content: string): PromiseRes<void> {
    return this.send('_send_group_notice', { group_id: +group_id, content })
  }

  /**
   * 重载事件过滤器
   * @param file 事件过滤器文件
   */
  public reload_event_filter(file: string): PromiseRes<void> {
    return this.send('reload_event_filter', { file })
  }

  /**
   * 下载文件到缓存目录<br/>
   * 通过这个API下载的文件能直接放入CQ码作为图片或语音发送 调用后会阻塞直到下载完成后才会返回数据，请注意下载大文件时的超时
   * @param url 链接地址
   * @param thread_count 下载线程数
   * @param headers 自定义请求头
   * 格式：<br/>* 字符串:`User-Agent=YOUR_UA[\r\n]Referer=https://www.baidu.com`</br>
   * * JSON数组:`["User-Agent=YOUR_UA","Referer=https://www.baidu.com"]`
   */
  public download_file(
    url: string,
    thread_count: number,
    headers: string | string[]
  ): PromiseRes<DownloadFile> {
    return this.send('download_file', { url, thread_count, headers })
  }

  /**
   * 获取当前账号在线客户端列表
   * @param no_cache 是否无视缓存
   */
  public get_online_clients(no_cache?: boolean): PromiseRes<Device[]> {
    return this.send('get_online_clients', { no_cache })
  }

  /**
   * 获取群消息历史记录
   * @param message_seq 起始消息序号, 可通过 `get_msg` 获得, 不提供起始序号将默认获取最新的消息
   * @param group_id 群号
   * @return 从起始序号开始的前19条消息
   */
  public get_group_msg_history(group_id: int64, message_seq?: number): PromiseRes<message[]> {
    return this.send('get_group_msg_history', { message_seq: message_seq, group_id: +group_id })
  }

  /**
   * 设置精华消息
   * @param message_id 消息ID
   */
  public set_essence_msg(message_id: int64): PromiseRes<void> {
    return this.send('set_essence_msg', { message_id: +message_id })
  }

  /**
   * 移出精华消息
   * @param message_id 消息ID
   */
  public delete_essence_msg(message_id: int64): PromiseRes<void> {
    return this.send('delete_essence_msg', { message_id: +message_id })
  }

  /**
   * 获取精华消息列表
   * @param group_id 群号
   */
  public get_essence_msg_list(group_id: int64): PromiseRes<EssenceMessage[]> {
    return this.send('get_essence_msg_list', { group_id: +group_id })
  }

  /**
   * 检查链接安全性
   * @param url 需要检查的链接
   */
  public check_url_safely(url: string): PromiseRes<URLSafely> {
    return this.send('check_url_safely', { url })
  }

  /**
   * 获取在线机型
   * @param model 机型名称
   */
  public get_model_show(model: string): PromiseRes<Variants[]> {
    return this.send('_get_model_show', { model })
  }

  /**
   * 设置在线机型
   * @param model 机型名称
   * @param model_show
   */
  public set_model_show(model: string, model_show: string): PromiseRes<void> {
    return this.send('_set_model_show', { model, model_show })
  }

  /**
   * @protected
   */
  protected create_group_file_folder() {}

  /**
   * @protected
   */
  protected delete_group_folder() {}

  /**
   * @protected
   */
  protected delete_group_file() {}

  // 以下为连接API /////////////////////////////////////////////////////////////////////////////////////////////////////

  /**重连*/
  public reconnect(): void {
    this.disconnect()
    this.connect()
  }

  /**连接*/
  public connect(): void {
    {
      const url = `${this._baseUrl}/api?access_token=${this._accessToken}`
      this._socket = new WebSocket(url, undefined, this._clientConfig)
      this._socket
        .on('open', () => {
          this._eventBus.emit('socket.open', undefined)
        })
        .on('close', (code, reason) => {
          this._close(false, code, reason.toString())
          this._socket = undefined
        })
        .on('message', data => {
          this._onmessage(data)
        })
        .on('error', data => {
          this._eventBus.emit('socket.error', data.toString())
        })
    }
    {
      const url = `${this._baseUrl}/event?access_token=${this._accessToken}`
      this._socketEvent = new WebSocket(url, undefined, this._clientConfig)
      this._socketEvent
        .on('open', () => {
          this._eventBus.emit('socket.openEvent', undefined)
        })
        .on('close', (code, reason) => {
          this._close(true, code, reason.toString())
          this._socketEvent = undefined
        })
        .on('message', data => {
          this._onmessageEvent(data)
        })
        .on('error', data => {
          this._eventBus.emit('socket.errorEvent', data.toString())
        })
    }
    this._sendTimeoutTimer = setInterval(
      CQWebSocket.sendTimeout.bind(this),
      1000 * this._sendTimeout
    )
  }

  /**断开*/
  public disconnect(): void {
    if (this._socket !== undefined) {
      this._socket.close(1000)
      this._socket = undefined
    }
    if (this._socketEvent !== undefined) {
      this._socketEvent.close(1000)
      this._socketEvent = undefined
    }
    if (this._sendTimeoutTimer !== undefined) {
      clearInterval(this._sendTimeoutTimer as NodeJS.Timeout)
      this._sendTimeoutTimer = undefined
    }
  }

  /**
   * 发送消息
   * @param method api名称
   * @param params 消息内容
   * @return api调用结果
   */
  public send<T extends keyof WSSendParam>(
    method: T,
    params: WSSendParam[T]
  ): Promise<WSSendReturn[T]> {
    if (this._socket === undefined) {
      return Promise.reject(<ErrorAPIResponse>{
        data: null,
        echo: undefined,
        msg: '',
        retcode: 500,
        status: 'NO CONNECTED',
        wording: '无连接'
      })
    }
    if (this._socket.readyState === WebSocket.CLOSING) {
      return Promise.reject(<ErrorAPIResponse>{
        data: null,
        echo: undefined,
        msg: '',
        retcode: 501,
        status: 'CONNECT CLOSING',
        wording: '连接关闭'
      })
    }
    const echo = this.getECHO()
    const message: APIRequest = {
      action: method,
      params: params,
      echo: echo
    }
    if (this._debug) {
      this.logger.debug(message)
    }
    return new Promise<WSSendReturn[T]>((resolve, reject) => {
      const onSuccess: ResponseHandler['onSuccess'] = resp => {
        this._responseHandlers.delete(echo)
        return resolve(resp.data)
      }
      const onFailure: ResponseHandler['onFailure'] = err => {
        this._responseHandlers.delete(echo)
        return reject(err)
      }
      this._responseHandlers.set(echo, {
        message,
        onSuccess,
        onFailure,
        sendTime: process.hrtime()
      })
      this._eventBus.emit('api.preSend', message)
      if (this._socket === undefined) {
        onFailure({
          data: null,
          echo: undefined,
          msg: '',
          retcode: 500,
          status: 'NO CONNECTED',
          wording: '无连接'
        })
      } else {
        this._socket.send(JSON.stringify(message))
      }
    })
  }

  /**
   * 注册监听方法，解除监听调用 [off]{@link off} 方法<br/>
   * 若要只执行一次，请调用 [once]{@link once} 方法
   * @param event
   * @param handle
   * @return 用于当作参数调用 [off]{@link off} 解除监听
   */
  public on<T extends keyof SocketHandle>(event: T, handle: EventHandle<T>): EventHandle<T> {
    this._eventBus.on(event, handle)
    return handle
  }

  /**
   * 只执行一次，执行后删除方法
   * @param event
   * @param handle
   * @return 用于当作参数调用 [off]{@link off} 解除监听
   */
  public once<T extends keyof SocketHandle>(event: T, handle: EventHandle<T>): EventHandle<T> {
    this._eventBus.once(event, handle)
    return handle
  }

  /**
   * 解除监听方法,注册监听调用 [on]{@link on} 方法,或 [once]{@link once} 方法
   * @param event
   * @param handle
   */
  public off<T extends keyof SocketHandle>(event: T, handle: EventHandle<T>): this {
    this._eventBus.off(event, handle)
    return this
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
  public bind(
    option: 'on' | 'once' | 'onceAll',
    event: PartialSocketHandle = {}
  ): PartialSocketHandle {
    let entries = Object.entries(event) as ObjectEntries<SocketHandle>
    if (option === 'onceAll') {
      entries = entries.map(([k, v]) => [
        k,
        (...args: any) => {
          this.unbind(event)
          // @ts-ignore
          v?.(...args)
        }
      ])
      event = Object.fromEntries(entries)
    }
    if (option === 'once') {
      entries.forEach(([k, v]) => this._eventBus.once(k, v))
    } else {
      entries.forEach(([k, v]) => this._eventBus.on(k, v))
    }
    return event
  }

  /**
   * 同时解除多种监听方法,注册监听调用 [bind]{@link bind} 方法
   * @param [event={}]
   */
  public unbind(event: PartialSocketHandle = {}): this {
    ;(Object.entries(event) as ObjectEntries<SocketHandle>).forEach(([k, v]) => {
      this._eventBus.off(k, v)
    })
    return this
  }

  private _onmessage(data: Data): void {
    if (typeof data !== 'string') {
      return
    }
    const json: ErrorAPIResponse = JSON.parse(data)
    if (this._debug) {
      this.logger.debug(json)
    }
    if (json.echo === undefined) {
      return
    }
    const handler = this._responseHandlers.get(json.echo)
    if (handler === undefined) {
      return
    }
    const message = handler.message
    if (json.retcode <= 1) {
      handler.onSuccess(json)
      this.messageSuccess(json, message)
    } else {
      handler.onFailure(json)
      this.messageFail(json, message)
    }
    this._eventBus.emit('api.response', { response: json, sourceMSG: message })
    return
  }

  private _onmessageEvent(data: Data): void {
    if (typeof data !== 'string') {
      return
    }
    const json: ErrorAPIResponse = JSON.parse(data)
    if (this._debug) {
      this.logger.debug(json)
    }
    this._eventBus.handleMSG(json)
    return
  }

  private _close(isEvent: boolean, code: number, reason: string): void {
    if (code !== 1000) {
      this._eventBus.emit(isEvent ? 'socket.errorEvent' : 'socket.error', { code, reason })
    }
    this._eventBus.emit(isEvent ? 'socket.closeEvent' : 'socket.close', { code, reason })
  }

  /**
   * 获取随机唯一ID <br/>
   * 原本实现为 `Date.now().toString(36);`, `Date.now() - Date.now() === 0` 故废弃 <br/>
   * 原本实现为 `shortid.generate()`,测试:1.1-1.9毫秒之间 <br/>
   * 现实现为 `process.hrtime().toString(36)`, 测试:0.3-0.9毫秒之间
   * @return "(36),(36)"
   */
  public getECHO(): string {
    const [s, ns] = process.hrtime()
    return s.toString(36) + ',' + ns.toString(36)
  }

  /**状态信息*/
  public get state(): Status {
    return this.socketData.status
  }

  /**获取当前登录账号的 QQ 号, 当获取失败时返回 `-1`*/
  public get qq(): number {
    return this.socketData.qq
  }

  public get socketData(): { qq: number; status: Status } {
    return this._eventBus.data
  }

  public get errorEvent(): ErrorEventHandle {
    return this._eventBus._errorEvent
  }

  /**设置当注册的事件运行失败时,的回调方法,记录出错的事件与方法*/
  public set errorEvent(value: ErrorEventHandle) {
    this._eventBus._errorEvent = value
  }

  [Symbol.toStringTag]() {
    return CQWebSocket.name
  }

  public get logger(): ILogger {
    return this._logger
  }

  public set logger(v) {
    this._logger = v == null ? console : v
  }

  public get debug(): boolean {
    return this._debug
  }
}

interface CQEventBus extends NodeJS.EventEmitter {
  addListener<K extends keyof SocketHandle>(type: K, handler: EventHandle<K>): this

  on<K extends keyof SocketHandle>(type: K, handler: EventHandle<K>): this

  once<K extends keyof SocketHandle>(type: K, handler: EventHandle<K>): this

  prependListener<K extends keyof SocketHandle>(type: K, handler: EventHandle<K>): this

  prependOnceListener<K extends keyof SocketHandle>(type: K, handler: EventHandle<K>): this

  removeListener<K extends keyof SocketHandle>(type: K, handler: EventHandle<K>): this

  off<K extends keyof SocketHandle>(type: K, handler: EventHandle<K>): this

  removeAllListeners(type?: keyof SocketHandle): this

  listeners<K extends keyof SocketHandle>(type: K): EventHandle<K>[]

  rawListeners<K extends keyof SocketHandle>(type: K): EventHandle<K>[]

  listenerCount<K extends keyof SocketHandle>(type: K): number
}

class CQEventBus extends EventEmitter implements NodeJS.EventEmitter {
  public _errorEvent: ErrorEventHandle
  public data: {
    qq: number
    status: Status
  }
  private readonly bot: CQWebSocket
  private declare _events: { [key in keyof SocketHandle]: Function | Function[] }
  private declare _eventsCount: number

  constructor(bot: CQWebSocket) {
    super({ captureRejections: true })
    this.bot = bot
    this.setMaxListeners(0)
    this._errorEvent = e => this.logger.error(e)
    this.data = {
      qq: -1,
      status: {
        good: false,
        online: false,
        stat: {
          packet_received: 0,
          packet_sent: 0,
          packet_lost: 0,
          message_received: 0,
          message_sent: 0,
          disconnect_times: 0,
          lost_times: 0
        }
      }
    }
  }

  public handleMSG(json: any): void | boolean {
    const post_type = json['post_type'] as
      | 'message'
      | 'notice'
      | 'request'
      | 'meta_event'
      | 'message_sent'
    if (Reflect.has(this, post_type)) {
      return this[post_type](json)
    } else if (this.bot.debug) {
      this.logger.warn(`未知的上报类型: ${post_type}`)
      return false
    }
  }

  emit<T extends keyof SocketHandle>(
    type: T,
    context: SocketHandle[T],
    cqTags: CQTag[] = []
  ): boolean {
    const handlers: Function | Function[] | undefined = this._events[type]
    if (handlers !== undefined) {
      const event = new CQEvent(this.bot, type, context, cqTags)
      if (typeof handlers === 'function') {
        const handler: EventHandle<T> = <EventHandle<T>>handlers
        try {
          handler(event)
          if (event.isCanceled) {
            return true
          }
        } catch (e) {
          if (--this._eventsCount === 0) {
            this._events = Object.create(null)
          } else {
            Reflect.deleteProperty(this._events, type)
          }
          this._errorEvent(e, type, handler)
        }
      } else {
        let i: number
        for (i = 0; i < handlers.length; i++) {
          const handler = <EventHandle<T>>handlers[i]
          try {
            handler(event)
            if (event.isCanceled) {
              return true
            }
          } catch (e) {
            if (i === 0) {
              handlers.shift()
            } else {
              handlers.splice(i, 1)
            }
            this._errorEvent(e, type, handler)
            i--
          }
        }
      }
    }
    const indexOf = type.lastIndexOf('.')
    if (indexOf > 0) {
      return this.emit(type.slice(0, indexOf) as T, context, cqTags)
    }
    return true
  }

  [Symbol.toStringTag]() {
    return CQEventBus.name
  }

  private message(json: any): void | boolean {
    const messageType = json['message_type']
    const cqTags = CQ.parse(json.message)
    switch (messageType) {
      case 'private':
        return this.emit('message.private', json, cqTags)
      case 'discuss':
        return this.emit('message.discuss', json, cqTags)
      case 'group':
        return this.emit('message.group', json, cqTags)
      default:
        if (this.bot.debug) {
          this.bot.logger.warn(`未知的消息类型: ${messageType}`)
        }
        return false
    }
  }

  private 'notice.notify'(json: any): void | boolean {
    const subType = json['sub_type']
    switch (subType) {
      case 'poke':
        if (Reflect.has(json, 'group_id')) {
          return this.emit('notice.notify.poke.group', json)
        } else {
          return this.emit('notice.notify.poke.friend', json)
        }
      case 'lucky_king':
        return this.emit('notice.notify.lucky_king', json)
      case 'honor':
        return this.emit('notice.notify.honor', json)
      default:
        if (this.bot.debug) {
          this.logger.warn(`未知的 notify 类型: ${subType}`)
        }
        return false
    }
  }

  private notice(json: any): void | boolean {
    const notice_type = json['notice_type']
    switch (notice_type) {
      case 'group_upload':
        return this.emit('notice.group_upload', json)
      case 'group_admin':
        return this.emit('notice.group_admin', json)
      case 'group_decrease':
        return this.emit('notice.group_decrease', json)
      case 'group_increase':
        return this.emit('notice.group_increase', json)
      case 'group_ban':
        return this.emit('notice.group_ban', json)
      case 'friend_add':
        return this.emit('notice.friend_add', json)
      case 'group_recall':
        return this.emit('notice.group_recall', json)
      case 'friend_recall':
        return this.emit('notice.friend_recall', json)
      case 'notify':
        return this['notice.notify'](json)
      case 'group_card':
        return this.emit('notice.group_card', json)
      case 'offline_file':
        return this.emit('notice.offline_file', json)
      case 'client_status':
        return this.emit('notice.client_status', json)
      case 'essence':
        return this.emit('notice.essence', json)
      default:
        if (this.bot.debug) {
          this.logger.warn(`未知的 notice 类型: ${notice_type}`)
        }
        return false
    }
  }

  private request(json: any): void | boolean {
    const request_type = json['request_type']
    switch (request_type) {
      case 'friend':
        return this.emit('request.friend', json)
      case 'group':
        return this.emit('request.group', json)
      default:
        if (this.bot.debug) {
          this.logger.warn(`未知的 request 类型: ${request_type}`)
        }
        return false
    }
  }

  private meta_event(json: any): void | boolean {
    const meta_event_type = json['meta_event_type']
    switch (meta_event_type) {
      case 'lifecycle':
        this.data.qq = json['self_id']
        return this.emit('meta_event.lifecycle', json)
      case 'heartbeat':
        this.data.status = json['status']
        return this.emit('meta_event.heartbeat', json)
      default:
        if (this.bot.debug) {
          this.logger.warn(`未知的 meta_event 类型: ${meta_event_type}`)
        }
        return false
    }
  }

  private message_sent(json: any): void | boolean {
    return this.emit('message_sent', json)
  }

  private get logger(): ILogger {
    return this.bot.logger
  }
}

/**事件总类*/
export class CQEvent<T extends keyof SocketHandle> {
  private _isCancel: boolean
  readonly bot: CQWebSocket
  readonly contextType: T
  readonly context: SocketHandle[T]
  /**非空,但仅在 `messageType` 情况下有内容*/
  readonly cqTags: CQTag[]

  constructor(bot: CQWebSocket, type: T, context: SocketHandle[T], cqTags: CQTag[] = []) {
    this._isCancel = false
    this.bot = bot
    this.contextType = type
    this.context = context
    this.cqTags = cqTags
  }

  /**
   * 是否已经停止冒泡
   * @see stopPropagation
   */
  get isCanceled(): boolean {
    return this._isCancel
  }

  /**停止冒泡,调用后停止后续方法的调用*/
  stopPropagation(): void {
    this._isCancel = true
  }

  [Symbol.toStringTag]() {
    return CQEvent.name
  }
}
