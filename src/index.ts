import * as Tags from "./tags";
import {CQNode, CQTag} from "./tags";
import {WebSocketCQ} from "./websocket";

export {
  Tags,
  // CQWebSocket,
  CQWebSocket,
};

class CQWebSocket extends WebSocketCQ {
  /**
   *
   * @param user_id  对方 QQ 号
   * @param message 要发送的内容
   * @param auto_escape=false  消息内容是否作为纯文本发送 ( 即不解析 CQ 码 ) , 只在 `message` 字段是字符串时有效
   */
  public send_private_msg(user_id: int64, message: message, auto_escape = false): Promise<void> | void {
    return this.send("send_private_msg", {user_id, message, auto_escape})
        .then(this.messageSuccess, this.messageFail);
  }

  /**
   *
   * @param group_id 群号
   * @param message  要发送的内容
   * @param auto_escape=false 消息内容是否作为纯文本发送 ( 即不解析 CQ 码) , 只在 `message` 字段是字符串时有效
   */
  public send_group_msg(group_id: int64, message: message, auto_escape = false): Promise<void> | void {
    return this.send("send_group_msg", {group_id, message, auto_escape})
        .then(this.messageSuccess, this.messageFail);
  }

  /**
   *
   * @param group_id 群号
   * @param messages 自定义转发消息
   */
  public send_group_forward_msg(group_id: number | string, messages: CQNode[]): Promise<void> | void {
    return this.send("send_group_forward_msg", {group_id, messages})
        .then(this.messageSuccess, this.messageFail);
  }

  /**
   * 发送消息
   * @param data
   */
  public send_msg(data: PrivateData | GroupData): Promise<void> | void {
    return this.send("send_msg", data)
        .then(this.messageSuccess, this.messageFail);
  }

  /**
   * 撤回消息
   * @param message_id 消息 ID
   */
  public delete_msg(message_id: number): Promise<void> | void {
    return this.send("delete_msg", {message_id})
        .then(this.messageSuccess, this.messageFail);
  }

  /**
   * 群组踢人
   * @param group_id 群号
   * @param user_id 要踢的 QQ 号
   * @param reject_add_request 拒绝此人的加群请求
   */
  public set_group_kick(group_id: int64, user_id: int64, reject_add_request = false): Promise<void> | void {
    return this.send("set_group_kick", {group_id, user_id, reject_add_request})
        .then(this.messageSuccess, this.messageFail);
  }

  /**
   * 群组单人禁言
   * @param group_id 群号
   * @param user_id 要禁言的 QQ 号
   * @param duration 禁言时长, 单位秒, 0 表示取消禁言
   */
  public set_group_ban(group_id: int64, user_id: int64, duration = 30 * 60): Promise<void> | void {
    return this.send("set_group_ban", {group_id, user_id, duration})
        .then(this.messageSuccess, this.messageFail);
  }

  /**
   * 获取群信息
   * @param group_id 群号
   * @param no_cache 是否不使用缓存（使用缓存可能更新不及时, 但响应更快）
   */
  public get_group_info(group_id: int64, no_cache = false): Promise<GroupInfo> {
    return new Promise<GroupInfo>((resolve, reject) => {
      this.send("get_group_info", {group_id, no_cache})
          .then(json => resolve(json.data), json => reject(json));
    });
  }

  /**
   * 获取群列表
   */
  public get_group_list(): Promise<GroupInfo[]> {
    return new Promise<GroupInfo[]>((resolve, reject) => {
      this.send("get_group_list", {})
          .then(json => resolve(json.data), json => reject(json));
    });
  }

  /**
   * 获取群成员信息
   * @param group_id 群号
   * @param user_id QQ 号
   * @param no_cache 是否不使用缓存（使用缓存可能更新不及时, 但响应更快）
   */
  public get_group_member_info(group_id: int64, user_id: int64, no_cache = false): Promise<GroupMemberInfo> {
    return new Promise<GroupMemberInfo>((resolve, reject) => {
      this.send("get_group_member_info", {group_id, user_id, no_cache})
          .then(json => resolve(json.data), json => reject(json));
    });
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
  public get_group_member_list(group_id: int64): Promise<GroupMemberInfo> {
    return new Promise<GroupMemberInfo>((resolve, reject) => {
      this.send("get_group_member_list", {group_id})
          .then(json => resolve(json.data), json => reject(json));
    });
  }

  /**
   * 检查是否可以发送图片
   */
  public can_send_image(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.send("can_send_image", {})
          .then(json => resolve(json.data["yes"]), json => reject(json));
    });
  }
  /**
   * 检查是否可以发送语音
   */
  public can_send_record(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.send("can_send_record", {})
          .then(json => resolve(json.data["yes"]), json => reject(json));
    });
  }


}

declare interface PrivateData {
  message_type?: "private"
  user_id: int64
  message: message
  auto_escape: boolean
}

declare interface GroupData {
  message_type?: "group"
  group_id: int64
  message: message
  auto_escape: boolean
}

declare interface GroupInfo {
  group_id: number
  group_name: string
  member_count: number
  max_member_count: number
}

declare interface GroupMemberInfo {
  /**
   * 群号
   */
  group_id: number
  /**
   * QQ 号
   */
  user_id: number
  /**
   * 昵称
   */
  nickname: string
  /**
   * 群名片／备注
   */
  card: string
  /**
   * 性别, male 或 female 或 unknown
   */
  sex: string
  /**
   * 年龄
   */
  age: number
  /**
   * 地区
   */
  area: string
  /**
   * 加群时间戳
   */
  join_time: number
  /**
   * 最后发言时间戳
   */
  last_sent_time: number
  /**
   * 成员等级
   */
  level: string
  /**
   * 角色, owner 或 admin 或 member
   */
  role: string
  /**
   * 是否不良记录成员
   */
  unfriendly: boolean
  /**
   * 专属头衔
   */
  title: string
  /**
   * 专属头衔过期时间戳
   */
  title_expire_time: number
  /**
   * 是否允许修改群名片
   */
  card_changeable: boolean
}

export type message = CQTag[] | string
export type int64 = number | string
