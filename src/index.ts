import {
  CanSend, Device, DownloadFile, EssenceMessage, FileUrl, FriendInfo, GroupAtAllRemain, GroupData, GroupFileSystemInfo,
  GroupHonorInfo, GroupInfo, GroupMemberInfo, GroupRootFileSystemInfo, GroupSystemMSG, int64, LoginInfo, message,
  MessageId, MessageInfo, messageNode, OCRImage, PrivateData, PromiseRes, Status, StrangerInfo, VersionInfo, VipInfo,
} from "./Interfaces";
import {WebSocketCQPack} from "./websocketCQPack";

export * as Tags from "./tags";
export * as Interfaces from "./Interfaces";
export {
  CQ,
} from "./tags";

export class CQWebSocket extends WebSocketCQPack {
  /**
   * 发送私聊消息
   * @param user_id  对方 QQ 号
   * @param message 要发送的内容
   * @param auto_escape=false  消息内容是否作为纯文本发送 ( 即不解析 CQ 码 ) , 只在 `message` 字段是字符串时有效
   */
  public send_private_msg(user_id: int64, message: message, auto_escape = false): PromiseRes<MessageId> {
    return this.send("send_private_msg", {user_id, message, auto_escape});
  }
  
  /**
   * 发送群消息
   * @param group_id 群号
   * @param message  要发送的内容
   * @param auto_escape=false 消息内容是否作为纯文本发送 ( 即不解析 CQ 码) , 只在 `message` 字段是字符串时有效
   */
  public send_group_msg(group_id: int64, message: message, auto_escape = false): PromiseRes<MessageId> {
    return this.send("send_group_msg", {group_id, message, auto_escape});
  }
  
  /**
   * 发送合并转发 ( 群 )
   * @param group_id 群号
   * @param messages 自定义转发消息
   */
  public send_group_forward_msg(group_id: int64, messages: messageNode[]): PromiseRes<MessageId> {
    return this.send("send_group_forward_msg", {group_id, messages});
  }
  
  /**
   * 发送消息
   * @param data
   */
  public send_msg(data: PrivateData | GroupData): PromiseRes<MessageId> {
    return this.send("send_msg", data);
  }
  
  /**
   * 撤回消息
   * @param message_id 消息 ID
   */
  public delete_msg(message_id: number): PromiseRes<unknown> {
    return this.send("delete_msg", {message_id});
  }
  
  /**
   * 获取消息
   * @param message_id 消息 ID
   */
  public get_msg(message_id: number): PromiseRes<MessageInfo> {
    return this.send("get_msg", {message_id});
  }
  
  /**
   * 群组踢人
   * @param group_id 群号
   * @param user_id 要踢的 QQ 号
   * @param reject_add_request 拒绝此人的加群请求
   */
  public set_group_kick(group_id: int64, user_id: int64, reject_add_request = false): PromiseRes<unknown> {
    return this.send("set_group_kick", {group_id, user_id, reject_add_request});
  }
  
  /**
   * 群组单人禁言
   * @param group_id 群号
   * @param user_id 要禁言的 QQ 号
   * @param duration 禁言时长, 单位秒, 0 表示取消禁言
   */
  public set_group_ban(group_id: int64, user_id: int64, duration = 30 * 60): PromiseRes<unknown> {
    return this.send("set_group_ban", {group_id, user_id, duration});
  }
  
  /**
   * 群组全员禁言
   * @param group_id 群号
   * @param enable 是否禁言
   */
  public set_group_whole_ban(group_id: int64, enable = true): PromiseRes<unknown> {
    return this.send("set_group_whole_ban", {group_id, enable});
  }
  
  /**
   * 群组设置管理员
   * @param group_id 群号
   * @param user_id 要设置管理员的 QQ 号
   * @param enable true 为设置, false 为取消
   */
  public set_group_admin(group_id: int64, user_id: int64, enable = true): PromiseRes<unknown> {
    return this.send("set_group_admin", {group_id, user_id, enable});
  }
  
  /**
   * 设置群名片 ( 群备注 )
   * @param group_id 群号
   * @param user_id 要设置的 QQ 号
   * @param card 群名片内容, 不填或空字符串表示删除群名片
   */
  public set_group_card(group_id: int64, user_id: int64, card = ""): PromiseRes<unknown> {
    return this.send("set_group_card", {group_id, user_id, card});
  }
  
  /**
   * 设置群名
   * @param group_id 群号
   * @param group_name 新群名
   */
  public set_group_name(group_id: int64, group_name = ""): PromiseRes<unknown> {
    return this.send("set_group_name", {group_id, group_name});
  }
  
  /**
   * 退出群组
   * @param group_id 群号
   * @param is_dismiss 是否解散, 如果登录号是群主, 则仅在此项为 true 时能够解散
   */
  public set_group_leave(group_id: int64, is_dismiss = false): PromiseRes<unknown> {
    return this.send("set_group_leave", {group_id, is_dismiss});
  }
  
  /**
   * 设置群组专属头衔
   * @param group_id 群号
   * @param user_id 要设置的 QQ 号
   * @param special_title 专属头衔, 不填或空字符串表示删除专属头衔
   * @param duration 专属头衔有效期, 单位秒, -1 表示永久, 不过此项似乎没有效果, 可能是只有某些特殊的时间长度有效, 有待测试
   */
  public set_group_special_title(group_id: int64, user_id: int64, special_title: string,
                                 duration: int64,
  ): PromiseRes<unknown> {
    return this.send("set_group_special_title", {group_id, user_id, special_title, duration});
  }
  
  /**
   * 处理加好友请求
   * @param flag 加好友请求的 flag（需从上报的数据中获得）
   * @param approve 是否同意请求
   * @param remark 添加后的好友备注（仅在同意时有效）
   */
  public set_friend_add_request(flag: string, approve = true, remark = ""): PromiseRes<unknown> {
    return this.send("set_friend_add_request", {flag, approve, remark});
  }
  
  /**
   * 处理加群请求／邀请
   * @param flag 加好友请求的 flag（需从上报的数据中获得）
   * @param sub_type add 或 invite, 请求类型（需要和上报消息中的 sub_type 字段相符）
   * @param approve 是否同意请求
   * @param reason 添加后的好友备注（仅在同意时有效）
   */
  public set_group_add_request(flag: string, sub_type: string, approve = true,
                               reason = "",
  ): PromiseRes<unknown> {
    return this.send("set_group_add_request", {flag, sub_type, type: sub_type, approve, reason});
  }
  
  /** 获取登录号信息 */
  public get_login_info(): PromiseRes<LoginInfo> {
    return this.send("get_login_info", {});
  }
  
  /** 获取陌生人信息 */
  public get_stranger_info(): PromiseRes<StrangerInfo> {
    return this.send("get_stranger_info", {});
  }
  
  /** 获取好友列表 */
  public get_friend_list(): PromiseRes<FriendInfo[]> {
    return this.send("get_friend_list", {});
  }
  
  /**
   * 获取群信息
   * @param group_id 群号
   * @param no_cache 是否不使用缓存（使用缓存可能更新不及时, 但响应更快）
   */
  public get_group_info(group_id: int64, no_cache = false): PromiseRes<GroupInfo> {
    return this.send("get_group_info", {group_id, no_cache});
  }
  
  /** 获取群列表 */
  public get_group_list(): PromiseRes<GroupInfo[]> {
    return this.send("get_group_list", {});
  }
  
  /**
   * 获取群成员信息
   * @param group_id 群号
   * @param user_id QQ 号
   * @param no_cache 是否不使用缓存（使用缓存可能更新不及时, 但响应更快）
   */
  public get_group_member_info(group_id: int64, user_id: int64, no_cache = false): PromiseRes<GroupMemberInfo> {
    return this.send("get_group_member_info", {group_id, user_id, no_cache});
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
    return this.send("get_group_member_list", {group_id});
  }
  
  /**
   * 获取群荣誉信息
   * @param group_id 群号
   * @param type 要获取的群荣誉类型, 可传入 `talkative`, `performer`, `legend`, `strong_newbie`, `emotion`
   *             以分别获取单个类型的群荣誉数据, 或传入 `all` 获取所有数据
   */
  public get_group_honor_info(group_id: int64, type: string): PromiseRes<GroupHonorInfo> {
    return this.send("get_group_honor_info", {group_id, type});
  }
  
  /** 检查是否可以发送图片 */
  public can_send_image(): PromiseRes<CanSend> {
    return this.send("can_send_image", {});
  }
  
  /** 检查是否可以发送语音 */
  public can_send_record(): PromiseRes<CanSend> {
    return this.send("can_send_record", {});
  }
  
  /** 获取版本信息 */
  public get_version_info(): PromiseRes<VersionInfo> {
    return this.send("get_version_info", {});
  }
  
  /**
   * 设置群头像
   *
   * **[1]** `file` 参数支持以下几种格式：
   *
   * - 绝对路径, 例如 `file:///C:\\Users\Richard\Pictures\1.png`, 格式使用 [`file` URI]{@link
      * https://tools.ietf.org/html/rfc8089}
   * - 网络 URL, 例如 `http://i1.piimg.com/567571/fdd6e7b6d93f1ef0.jpg`
   * - Base64 编码, 例如
   * `base64://iVBORw0KGgoAAAANSUhEUgAAABQAAAAVCAIAAADJt1n/AAAAKElEQVQ4EWPk5+RmIBcwkasRpG9UM4mhNxpgowFGMARGEwnBIEJVAAAdBgBNAZf+QAAAAABJRU5ErkJggg==`
   *
   * **[2]** 目前这个API在登录一段时间后因cookie失效而失效, 请考虑后使用
   * @param group_id 群号
   * @param file 图片文件名,支持以下几种格式：
   * @param cache 表示是否使用已缓存的文件,通过网络 URL 发送时有效, `1` 表示使用缓存, `0` 关闭关闭缓存, 默认 为 `1`
   */
  public set_group_portrait(group_id: int64, file: string, cache = 1): PromiseRes<VersionInfo> {
    return this.send("set_group_portrait", {group_id, file, cache});
  }
  
  /** 获取群系统消息 */
  public get_group_system_msg(): PromiseRes<GroupSystemMSG> {
    return this.send("get_group_system_msg", {});
  }
  
  /**
   * 获取群文件系统信息
   * @param group_id 群号
   */
  public get_group_file_system_info(group_id: int64): PromiseRes<GroupFileSystemInfo> {
    return this.send("get_group_file_system_info", {group_id});
  }
  
  /**
   * 获取群根目录文件列表
   * @param group_id 群号
   */
  public get_group_root_files(group_id: int64): PromiseRes<GroupRootFileSystemInfo> {
    return this.send("get_group_root_files", {group_id});
  }
  
  /**
   * 获取群子目录文件列表
   * @param group_id 群号
   * @param folder_id 文件夹ID 参考 [GroupFolderInfo]{@link GroupFolderInfo.folder_id} 对象
   */
  public get_group_files_by_folder(group_id: int64, folder_id: string): PromiseRes<GroupRootFileSystemInfo> {
    return this.send("get_group_files_by_folder", {group_id, folder_id});
  }
  
  /**
   * 获取群文件资源链接
   * @param group_id 群号
   * @param file_id 文件ID 参考 [GroupFileInfo]{@link GroupFileInfo.file_id} 对象
   * @param busid 文件类型 参考 [GroupFileInfo]{@link GroupFileInfo.busid} 对象
   * @return 返回下载链接
   */
  public get_group_file_url(group_id: int64, file_id: string, busid: number): PromiseRes<FileUrl> {
    return this.send("get_group_file_url", {group_id, file_id});
  }
  
  /**
   * 获取状态
   *
   * **注意**：所有统计信息都将在重启后重制
   * @see https://ishkong.github.io/go-cqhttp-docs/api/#%E8%8E%B7%E5%8F%96%E7%8A%B6%E6%80%81
   */
  public get_status(): PromiseRes<Status> {
    return this.send("get_status", {});
  }
  
  /**
   * 获取群 @全体成员 剩余次数
   * @param group_id 群号
   */
  public get_group_at_all_remain(group_id: int64): PromiseRes<GroupAtAllRemain> {
    return this.send("get_group_at_all_remain", {group_id});
  }
  
  /**
   * 获取VIP信息
   * @param user_id QQ 号
   */
  public get_vip_info(user_id: int64): PromiseRes<VipInfo> {
    return this.send("_get_vip_info", {user_id});
  }
  
  /**
   * 发送群公告
   * @param group_id QQ 号
   * @param content 公告内容
   */
  public send_group_notice(group_id: int64, content: string): PromiseRes<unknown> {
    return this.send("_send_group_notice", {group_id});
  }
  
  /** 重载事件过滤器 */
  public reload_event_filter(): PromiseRes<unknown> {
    return this.send("reload_event_filter", {});
  }
  
  /**
   * 获取当前账号在线客户端列表
   * @param no_cache 是否无视缓存
   */
  public get_online_clients(no_cache?: boolean): PromiseRes<Device[]> {
    return this.send("get_online_clients", {no_cache});
  }
  
  /**
   * 获取群消息历史记录
   * @param message_seq 起始消息序号, 可通过 `get_msg` 获得, 不提供起始序号将默认获取最新的消息
   * @param group_id 群号
   * @return 从起始序号开始的前19条消息
   */
  public get_group_msg_history(group_id: int64, message_seq?: int64): PromiseRes<any> {
    return this.send("get_group_msg_history", {message_seq, group_id});
  }
  
  /**
   * 设置精华消息
   * @param message_id 消息ID
   */
  public set_essence_msg(message_id: int64): PromiseRes<unknown> {
    return this.send("set_essence_msg", {message_id});
  }
  
  /**
   * 移出精华消息
   * @param message_id 消息ID
   */
  public delete_essence_msg(message_id: int64): PromiseRes<unknown> {
    return this.send("delete_essence_msg", {message_id});
  }
  
  /**
   * 获取精华消息列表
   * @param group_id 群号
   */
  public get_essence_msg_list(group_id: int64): PromiseRes<EssenceMessage[]> {
    return this.send("get_essence_msg_list", {group_id});
  }
  
  /**
   * 图片OCR
   * @param image 图片ID
   */
  public ocr_image(image: string): PromiseRes<OCRImage> {
    return this.send("ocr_image", {image});
  }
  
  /**
   * 上传群文件<br/>
   * 在不提供 folder 参数的情况下默认上传到根目录 只能上传本地文件, 需要上传 http 文件的话请先调用 download_file API下载
   * @param group_id 群号
   * @param file 本地文件路径
   * @param name 储存名称
   * @param folder 父目录ID
   */
  public upload_group_file(group_id: int64, file: string, name: string, folder?: string): PromiseRes<unknown> {
    return this.send("upload_group_file", {group_id, file, name, folder});
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
  public download_file(url: string, thread_count: number, headers: string | string[]): PromiseRes<DownloadFile> {
    return this.send("download_file", {url, thread_count, headers});
  }
  
  /**
   * 检查链接安全性
   * @param url 需要检查的链接
 
   */
  public check_url_safely(url: string) {
    return this.send("check_url_safely", {url});
  }
}
