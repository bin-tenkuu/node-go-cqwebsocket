export interface Data {
  [key: string]: any
}

export interface Tags<T extends Data> {
  type: string,
  data: T
}

export class CQTag<T extends Data> implements Tags<T> {
  public readonly type: string;
  public readonly data: T;
  public send: T;
  
  public constructor(type: tagName | string, data: T) {
    this.type = type;
    this.data = data;
    this.send = <T>{};
    // 将 data 中全部属性在 this 中注册 getter
    Object.defineProperties(this, Object.fromEntries(Object.entries(this.data).map<[
      string,
      PropertyDescriptor
    ]>(([key]) => [
      key, {
        configurable: true,
        enumerable: false,
        get: () => this.data[key],
        // @ts-ignore
        set: v => this.data[key] = v,
      },
    ])));
  }
  
  public get tagName(): tagName | string {
    return this.type;
  }
  
  /**
   * 原本应该是每一个 data 里的属性都在外面给一个 getter 的，奈何我不会写约束文件里的索引器。
   * 于是我在实现了 getter 的同时写了这个方法，用于强类型代码（比如 typescript ）的编写时自动提示
   * @param key
   */
  public get(key: keyof T) {
    return this.data[key];
  }
  
  public toJSON(): Tags<T> {
    this.coerce();
    const data = Object.assign({}, this.data, this.send);
    
    Object.entries(data).forEach(([k, v]) => {
      if (v == null) {
        delete data[k];
      }
    });
    
    return {
      type: this.tagName,
      data: data,
    };
  }
  
  public toString(): string {
    let ret = `[CQ:${this.type}`;
    
    Object.entries(Object.assign({}, this.data, this.send)).forEach(([k, v]) => {
      if (v !== undefined) {
        ret += `,${k}=${v}`;
      }
    });
    
    ret += "]";
    return ret;
  }
  
  public static send<T extends Data>(type: string, send: T): CQTag<T> {
    let code = new CQTag<T>(type, <T>{});
    code.send = send;
    return code;
  }
  
  /**
   * 强制将属性转换为对应类型
   * @abstract
   * @deprecated
   */
  public coerce(): this {
    return this;
  }
}

class CQText extends CQTag<text> {
  constructor(text: string) {
    super("text", {text});
  }
  
  toString(): string {
    return this.data.text;
  }
}

const SPLIT = /(?=\[CQ:)|(?<=])/;
const CQ_TAG_REGEXP = /^\[CQ:([a-z]+)(?:,([^\]]+))?]$/;


export var CQ = {
  /** 将携带 CQ码 的字符串转换为 CQ码数组 */
  parse: (msg: string): CQTag<any>[] => {
    return msg.split(SPLIT).map(tagStr => {
      let match = CQ_TAG_REGEXP.exec(tagStr);
      if (match === null) {
        return new CQText(tagStr);
      }
      // `[CQ:share,title=震惊&#44;小伙睡觉前居然...,url=http://baidu.com/?a=1&amp;b=2]`
      let [, tagName, value] = match;
      if (value === undefined) {
        return new CQTag(tagName, {});
      }
      let data = Object.fromEntries(value.split(",").map((v) => {
        return v.split("=");
      }));
      return new CQTag(tagName, data);
    });
  },
  /**
   * 转义
   * @param str 欲转义的字符串
   * @param [insideCQ=false] 是否在CQ码内
   * @returns 转义后的字符串
   */
  escape: (str: string, insideCQ = false) => {
    let temp = str.replace(/&/g, "&amp;")
      .replace(/\[/g, "&#91;")
      .replace(/]/g, "&#93;");
    if (insideCQ) {
      temp = temp
        .replace(/,/g, "&#44;");
    }
    return temp;
  },
  /**
   * 反转义
   *
   * @param str 欲反转义的字符串
   * @returns 反转义后的字符串
   */
  unescape: (str: string) => {
    return str.replace(/&#44;/g, ",")
      .replace(/&#91;/g, "[")
      .replace(/&#93;/g, "]")
      .replace(/&amp;/g, "&");
  },
  /**
   * 纯文本
   * @param text 纯文本内容
   */
  text: (text: string) => new CQText(text),
  /**
   * QQ 表情
   * @param id QQ 表情 ID,处于 [0,221] 区间
   * @see https://github.com/kyubotics/coolq-http-api/wiki/%E8%A1%A8%E6%83%85-CQ-%E7%A0%81-ID-%E8%A1%A8
   */
  face: (id: number) => new CQTag<face>("face", {id}),
  /**
   * 语音
   * @param file 语音文件名(或URL)
   * @param magic 发送时可选, 默认 0, 设置为 1 表示变声
   * @param cache 只在通过网络 URL 发送时有效, 表示是否使用已缓存的文件, 默认 1
   * @param proxy 只在通过网络 URL 发送时有效, 表示是否通过代理下载文件 ( 需通过环境变量或配置文件配置代理 ) , 默认 1
   * @param timeout 只在通过网络 URL 发送时有效, 单位秒, 表示下载网络文件的超时时间 , 默认不超时
   */
  record: (file: string, magic?: boolean, cache?: boolean, proxy?: boolean, timeout?: number) => {
    return new CQTag<_record>("record", {
      file, magic, cache, proxy, timeout,
    });
  },
  /**
   * .@某人
   * @param qq @的 QQ 号, `all` 表示全体成员
   */
  at: (qq: number | "all") => new CQTag<at>("at", {qq}),
  /**
   * 链接分享
   * @param url URL
   * @param title 标题
   * @param content 发送时可选, 内容描述
   * @param image 发送时可选, 图片 URL
   */
  share: (url: string, title: string, content?: string, image?: string) => new CQTag<share>("share", {
    url,
    title,
    content,
    image,
  }),
  /**
   * 音乐分享
   * @param type 分别表示使用 QQ 音乐、网易云音乐、虾米音乐
   * @param id 歌曲 ID
   */
  music: (type: "qq" | "163" | "xm", id: number) => new CQTag<music>("music", {type, id}),
  /**
   * 音乐自定义分享
   * @param url 点击后跳转目标 URL
   * @param audio 音乐 URL
   * @param title 标题
   * @param content 发送时可选, 内容描述
   * @param image 发送时可选, 图片 URL
   */
  musicCustom: (url: string, audio: string, title: string, content?: string, image?: string) => new CQTag<musicCustom>(
    "music", {
      type: "custom",
      url,
      audio,
      title,
      content,
      image,
    }),
  /**
   * 图片
   * @param file 图片文件名
   * @param type 图片类型, flash 表示闪照, show 表示秀图, 默认普通图片
   * @param url 图片 URL
   * @param cache 只在通过网络 URL 发送时有效, 表示是否使用已缓存的文件, 默认 1
   * @param id 发送秀图时的特效id, 默认为40000
   * @param c 通过网络下载图片时的线程数, 默认单线程. (在资源不支持并发时会自动处理)
   * @see https://ishkong.github.io/go-cqhttp-docs/cqcode/#%E5%9B%BE%E7%89%87
   */
  image: (file: string, type?: string, url?: string, cache?: number, id?: number, c?: number) => new CQTag<image>(
    "image", {
      file, type, url, cache, id, c,
    }),
  /**
   * 回复
   * @param id 回复时所引用的消息id, 必须为本群消息.
   */
  reply: (id: number) => new CQTag<reply>("reply", {id}),
  /**
   * 戳一戳
   * @param qq 需要戳的成员
   */
  poke: (qq: number) => new CQTag<poke>("poke", {qq}),
  /**
   *
   * @param qq 接收礼物的成员
   * @param id 礼物的类型
   */
  gift: (qq: number, id: number) => new CQTag<gift>("gift", {qq, id}),
  /**
   * 合并转发消息节点
   * @param id 转发消息id, 直接引用他人的消息合并转发, 实际查看顺序为原消息发送顺序
   */
  nodeId: (id: number) => new CQTag<nodeID>("node", {id}),
  /**
   * 合并转发消息节点
   * @param name 发送者显示名字
   * @param uin 发送者QQ号
   * @param content 具体消息, 不支持转发套娃, 不支持引用回复
   */
  node: (name: string, uin: number | string, content: CQTag<any>[] | string) => new CQTag<node>("node", {
    name,
    uin,
    content,
  }),
  /**
   * XML 消息
   * @param data xml内容, xml中的value部分, 记得实体化处理
   * @param resid 可以不填
   */
  xml: (data: string, resid?: number) => new CQTag<xml>("xml", {data, resid}),
  /**
   * JSON 消息
   * @param data json内容, json的所有字符串记得实体化处理
   * @param resid 默认不填为0, 走小程序通道, 填了走富文本通道发送
   */
  json: (data: string, resid?: number) => new CQTag<json>("xml", {data, resid}),
  /**
   * 一种xml的图片消息（装逼大图）<br/> **PS** : xml 接口的消息都存在风控风险, 请自行兼容发送失败后的处理 ( 可以失败后走普通图片模式 )
   * @param file 和image的file字段对齐, 支持也是一样的
   * @param minwidth 默认不填为400, 最小width
   * @param minheight 默认不填为400, 最小height
   * @param maxwidth 默认不填为500, 最大width
   * @param maxheight 默认不填为1000, 最大height
   * @param source 分享来源的名称, 可以留空
   * @param icon 分享来源的icon图标url, 可以留空
   */
  cardimage: (file: string, minwidth?: number, minheight?: number, maxwidth?: number, maxheight?: number,
    source ?: string, icon?: string,
  ) => new CQTag<cardimage>("cardimage", {
    file,
    minwidth,
    minheight,
    maxwidth,
    maxheight,
    source,
    icon,
  }),
  /**
   * 文本转语音
   * @param text 内容
   */
  tts: (text: string) => new CQTag<tts>("tts", {text}),
  /**
   * 自定义 CQ码
   * @param type CQ码类型
   * @param data CQ码参数
   */
  custom: <T extends Data>(type: string, data: T = <T>{}) => new CQTag<T>(type, data),
};

export type tts = {
  /** 内容 */
  text: string
}
export type cardimage = {
  /** 和image的file字段对齐, 支持也是一样的 */
  file: string
  /** 默认不填为400, 最小width */
  minwidth?: number
  /** 默认不填为400, 最小height */
  minheight?: number
  /** 默认不填为500, 最大width */
  maxwidth?: number
  /** 默认不填为1000, 最大height */
  maxheight?: number
  /** 分享来源的名称, 可以留空 */
  source?: string
  /** 分享来源的icon图标url, 可以留空 */
  icon?: string
  
}
export type json = {
  /** json内容, json的所有字符串记得实体化处理 */
  data: string
  /** 默认不填为0, 走小程序通道, 填了走富文本通道发送 */
  resid?: number
}
export type xml = {
  /** xml内容, xml中的value部分, 记得实体化处理 */
  data: string
  /** 可以不填 */
  resid?: number
}
export type node = {
  /** 发送者显示名字 */
  name: string
  /** 发送者QQ号 */
  uin: number | string
  /**
   * 具体消息
   *
   * 不支持转发套娃, 不支持引用回复
   */
  content: CQTag<any>[] | string
}
export type nodeID = {
  /** 转发消息id, 直接引用他人的消息合并转发, 实际查看顺序为原消息发送顺序 */
  id: number
}
export type gift = {
  /** 接收礼物的成员 */
  qq: number
  /** 礼物的类型 */
  id: number
}
export type poke = {
  /** 需要戳的成员 */
  qq: number
}
export type reply = {
  id: number
}
export type image = {
  /** 图片文件名 */
  file: string
  /** 图片类型, flash 表示闪照, show 表示秀图, 默认普通图片 */
  type?: string
  /** 图片 URL */
  url?: string
  /** 只在通过网络 URL 发送时有效, 表示是否使用已缓存的文件, 默认 1 */
  cache?: number
  /** 发送秀图时的特效id, 默认为40000 */
  id?: number
  /** 通过网络下载图片时的线程数, 默认单线程. (在资源不支持并发时会自动处理) */
  c?: number
}
export type musicCustom = {
  type: "custom"
  /** 点击后跳转目标 URL */
  url: string
  /** 音乐 URL */
  audio: string
  /** 标题 */
  title: string
  /** 发送时可选, 内容描述 */
  content?: string
  /** 发送时可选, 图片 URL */
  image?: string
}
export type music = {
  /** 分别表示使用 QQ 音乐、网易云音乐、虾米音乐 */
  type: "qq" | "163" | "xm"
  /** 歌曲 ID */
  id: number
}
export type share = {
  /** URL */
  url: string
  /** 标题 */
  title: string
  /** 内容描述 */
  content?: string
  /** 图片 URL */
  image?: string
}
export type at = {
  /** .@的 QQ 号, `all` 表示全体成员 */
  qq: number | "all"
}
export type video = {
  /** 视频文件名 */
  file: string
  /** 视频 URL */
  url?: string
}
export type record = {
  /** 语音文件名 */
  file: string
  /** 语音 URL */
  url?: string
  /** 表示变声 */
  magic?: boolean
}
type _record = {
  /** 语音文件名 */
  file: string
  /** 表示变声 */
  magic?: boolean
  /** 只在通过网络 URL 发送时有效, 表示是否使用已缓存的文件, 默认 1 */
  cache?: boolean
  /** 只在通过网络 URL 发送时有效, 表示是否通过代理下载文件 ( 需通过环境变量或配置文件配置代理 ) , 默认 1 */
  proxy?: boolean
  /** 只在通过网络 URL 发送时有效, 单位秒, 表示下载网络文件的超时时间 , 默认不超时 */
  timeout?: number
}
export type text = {
  /** 纯文本内容 */
  text: string
}
export type face = {
  /** QQ 表情 ID,处于 [0,221] 区间 */
  id: number
}
export type tagName = "text" | "face" | "record" | "video" | "at" | "rps" | "dice" | "shake" | "anonymous" | "share"
  | "contact" | "location" | "music" | "image" | "reply" | "redbag" | "poke" | "gift" | "forward" | "node" | "xml"
  | "json" | "cardimage" | "tts"