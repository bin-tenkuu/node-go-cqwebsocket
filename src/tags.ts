export interface Tag {
  type: string
  data: {
    [key: string]: any
  }
}

export class CQTag<T extends Tag> implements Tag {
  public readonly type: T["type"];
  public readonly data: T["data"];
  
  public constructor(type: T["type"], data: T["data"]) {
    this.type = type ?? "";
    this.data = data ?? {};
  }
  
  public get tagName(): T["type"] | tagName {
    return this.type;
  }
  
  /**
   * 用于获取data属性里的字段,<br/>
   * 值得注意的是,当接受消息为 字符串格式 时，本方法返回类型永远为 `string`,
   * 当且仅当接受消息为 数组格式 时，返回类型才可能为正常类型
   * @param key 字段
   * @return 值
   */
  public get<K extends keyof T["data"]>(key: K): T["data"][K] | string {
    return this.data[key];
  }
  
  /**
   * 设置新值
   * @param key 字段
   * @param value 新值
   * @return 替换前的值
   */
  public set<K extends keyof T["data"]>(key: K, value: T["data"][K]): T["data"][K] {
    let temp = this.data[key];
    this.data[key] = value;
    return temp;
  }
  
  public toJSON(): Tag {
    return this.toTag();
  }
  
  public toString(): string {
    // 暂不清楚哪个效率高,直接进行一个模板字符串的用
    return `[CQ:${this.type}${Object.entries(this.data).map(([k, v]) => {
      if (v === undefined) return "";
      return `,${k}=${v}`;
    }).join("")}]`;
  }
  
  /**浅拷贝 data 对象*/
  public clone(): CQTag<T> {
    return new CQTag<T>(this.type, Object.assign<{}, T["data"]>({}, this.data));
  }
  
  /** 转换为纯消息段 */
  public toTag(): Tag {
    return {
      type: this.type,
      data: this.data,
    };
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

export const SPLIT = /(?=\[CQ:)|(?<=])/;
export const CQ_TAG_REGEXP = /^\[CQ:([a-z]+)(?:,([^\]]+))?]$/;

export var CQ = {
  /** 将携带 CQ码 的字符串转换为 CQ码数组 */
  parse(msg: string | Tag[]): CQTag<any>[] {
    if (typeof msg !== "string") {
      return msg.filter(tag => {
        return tag !== null && tag !== undefined;
      }).map(tag => tag.type === "text" ? new CQText(tag.data.text) : new CQTag(tag.type, tag.data));
    }
    return msg.split(SPLIT).map(tagStr => {
      let match = CQ_TAG_REGEXP.exec(tagStr);
      if (match === null) {
        return new CQText(CQ.unescape(tagStr));
      }
      // `[CQ:share,title=震惊&#44;小伙睡觉前居然...,url=http://baidu.com/?a=1&amp;b=2]`
      let [, tagName, value] = match;
      if (value === undefined) {
        return new CQTag(tagName, {});
      }
      let data = Object.fromEntries(value.split(",").map((v) => {
        let index = v.indexOf("=");
        return [v.substr(0, index), v.substr(index + 1)];
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
  escape(str: string, insideCQ = false): string {
    let temp = str.replace(/&/g, "&amp;")
        .replace(/\[/g, "&#91;")
        .replace(/]/g, "&#93;");
    if (insideCQ) {
      return temp.replace(/,/g, "&#44;");
    }
    return temp;
  },
  /**
   * 反转义
   *
   * @param str 欲反转义的字符串
   * @returns 反转义后的字符串
   */
  unescape(str: string): string {
    return str.replace(/&#44;/g, ",")
        .replace(/&#91;/g, "[")
        .replace(/&#93;/g, "]")
        .replace(/&amp;/g, "&");
  },
  /**
   * 纯文本
   * @param text 纯文本内容
   */
  text(text: string): CQTag<text> { return new CQText(String(text)); },
  /**
   * QQ 表情
   * @param id QQ 表情 ID,处于 [0,221] 区间
   * @see https://github.com/kyubotics/coolq-http-api/wiki/%E8%A1%A8%E6%83%85-CQ-%E7%A0%81-ID-%E8%A1%A8
   */
  face(id: number) { return new CQTag<face>("face", {id}); },
  /**
   * 语音
   * @param file 语音文件名(或URL)
   * @param magic 发送时可选, 默认 0, 设置为 1 表示变声
   * @param cache 只在通过网络 URL 发送时有效, 表示是否使用已缓存的文件, 默认 1
   * @param proxy 只在通过网络 URL 发送时有效, 表示是否通过代理下载文件 ( 需通过环境变量或配置文件配置代理 ) , 默认 1
   * @param timeout 只在通过网络 URL 发送时有效, 单位秒, 表示下载网络文件的超时时间 , 默认不超时
   */
  record(file: string, magic?: boolean, cache?: boolean, proxy?: boolean, timeout?: number) {
    return new CQTag<record>("record", {
      file, magic, cache, proxy, timeout,
    });
  },
  /**
   * 短视频
   * @param file 视频地址, 支持http和file发送
   * @param cover 视频封面, 支持http, file和base64发送, 格式必须为jpg
   * @param c 通过网络下载视频时的线程数, 默认单线程. (在资源不支持并发时会自动处理)
   */
  video(file: string, cover?: string, c?: 2 | 3) {
    return new CQTag<video>("video", {file, cover, c});
  },
  /**
   * .@某人
   * @param qq @的 QQ 号, `all` 表示全体成员
   */
  at(qq: number | "all") { return new CQTag<at>("at", {qq}); },
  /**
   * 链接分享
   * @param url URL
   * @param title 标题
   * @param content 发送时可选, 内容描述
   * @param image 发送时可选, 图片 URL
   */
  share(url: string, title: string, content?: string, image?: string) {
    return new CQTag<share>("share", {
      url,
      title,
      content,
      image,
    });
  },
  /**
   * 音乐分享
   * @param type 分别表示使用 QQ 音乐、网易云音乐、虾米音乐
   * @param id 歌曲 ID
   */
  music(type: "qq" | "163" | "xm", id: number) { return new CQTag<music>("music", {type, id}); },
  /**
   * 音乐自定义分享
   * @param url 点击后跳转目标 URL
   * @param audio 音乐 URL
   * @param title 标题
   * @param content 发送时可选, 内容描述
   * @param image 发送时可选, 图片 URL
   */
  musicCustom(url: string, audio: string, title: string, content?: string, image?: string) {
    return new CQTag<music>(
        "music", {
          type: "custom",
          url,
          audio,
          title,
          content,
          image,
        });
  },
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
  image(file: string, type?: string, url?: string, cache?: number, id?: number, c?: number) {
    return new CQTag<image>(
        "image", {
          file, type, url, cache, id, c,
        });
  },
  /**
   * 回复
   * @param id 回复时所引用的消息id, 必须为本群消息.
   */
  reply(id: number) { return new CQTag<reply>("reply", {id}); },
  /**
   * 自定义回复
   * @param text 自定义回复时的自定义QQ, 如果使用自定义信息必须指定.
   * @param qq 自定义回复时的自定义QQ, 如果使用自定义信息必须指定.
   * @param time 可选. 自定义回复时的时间, 格式为Unix时间
   * @param seq 起始消息序号, 可通过 get_msg 获得
   */
  replyCustom(text: string, qq: number, time?: number, seq?: number) {
    return new CQTag<reply>("reply", {text, qq, time, seq});
  },
  /**
   * 戳一戳
   * @param qq 需要戳的成员
   */
  poke(qq: number) { return new CQTag<poke>("poke", {qq}); },
  /**
   * 礼物
   * @param qq 接收礼物的成员
   * @param id 礼物的类型
   */
  gift(qq: number, id: number) { return new CQTag<gift>("gift", {qq, id}); },
  /**
   * 合并转发消息节点
   * @param id 转发消息id, 直接引用他人的消息合并转发, 实际查看顺序为原消息发送顺序
   */
  nodeId(id: number) { return new CQTag<node>("node", {id}); },
  /**
   * 合并转发消息节点
   * @param name 发送者显示名字
   * @param uin 发送者QQ号
   * @param content 具体消息, 不支持转发套娃, 不支持引用回复
   */
  node(name: string, uin: number | string, content: CQTag<any>[] | string) {
    return new CQTag<node>("node", {
      name,
      uin: String(uin),
      content,
    });
  },
  /**
   * XML 消息
   * @param data xml内容, xml中的value部分, 记得实体化处理
   * @param resid 可以不填
   */
  xml(data: string, resid?: number) { return new CQTag<xml>("xml", {data, resid}); },
  /**
   * JSON 消息
   * @param data json内容, json的所有字符串记得实体化处理
   * @param resid 默认不填为0, 走小程序通道, 填了走富文本通道发送
   */
  json(data: string, resid?: number) { return new CQTag<json>("json", {data, resid}); },
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
  cardimage(file: string, minwidth?: number, minheight?: number, maxwidth?: number, maxheight?: number,
      source ?: string, icon?: string) {
    return new CQTag<cardimage>("cardimage", {
      file,
      minwidth,
      minheight,
      maxwidth,
      maxheight,
      source,
      icon,
    });
  },
  /**
   * 文本转语音
   * @param text 内容
   */
  tts(text: string) { return new CQTag<tts>("tts", {text}); },
  /**
   * 自定义 CQ码
   * @param type CQ码类型
   * @param data CQ码参数
   */
  custom<T extends Tag>(type: string, data: T = <T>{}) { return new CQTag<T>(type, data); },
};

export type allTags = text | face | record | video | at | rps | dice | shake | anonymous | share | contact | location
    | music | image | reply | redbag | poke | gift | forward | node | xml | json | cardimage | tts

export type tagName = allTags["type"]

export interface tts extends Tag {
  type: "tts"
  data: {
    /** 内容 */
    text: string
  }
}

export interface cardimage extends Tag {
  type: "cardimage"
  data: {
    /** 和image的file字段对齐, 支持也是一样的 */
    file: string
    /** `收` 默认不填为400, 最小width */
    minwidth?: number
    /** `收` 默认不填为400, 最小height */
    minheight?: number
    /** `收` 默认不填为500, 最大width */
    maxwidth?: number
    /** `收` 默认不填为1000, 最大height */
    maxheight?: number
    /** `收` 分享来源的名称, 可以留空 */
    source?: string
    /** `收` 分享来源的icon图标url, 可以留空 */
    icon?: string
    
  }
}

export interface json extends Tag {
  type: "json"
  data: {
    /** json内容, json的所有字符串记得实体化处理 */
    data: string
    /** `收` 默认不填为0, 走小程序通道, 填了走富文本通道发送 */
    resid?: number
  }
}

export interface xml extends Tag {
  type: "xml"
  data: {
    /** xml内容, xml中的value部分, 记得实体化处理 */
    data: string
    /** `收` 可以不填 */
    resid?: number
  }
}

export interface node extends Tag {
  type: "node"
  data: {
    /** 转发消息id, 直接引用他人的消息合并转发, 实际查看顺序为原消息发送顺序 */
    id: number
  } | {
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
}

export interface forward extends Tag {
  type: "forward"
  data: {
    /** 合并转发ID, 需要通过 {@link get_forward_msg} API获取转发的具体内容 */
    id: string
  }
}

export interface gift extends Tag {
  type: "gift"
  data: {
    /** 接收礼物的成员 */
    qq: number
    /** 礼物的类型 <br/>取值:[0,13]*/
    id: number
  }
}

export interface poke extends Tag {
  type: "poke"
  data: {
    /** 需要戳的成员 */
    qq: number
  }
}

export interface redbag extends Tag {
  type: "redbag"
  data: {
    /**祝福语/口令*/
    title: string
  }
}

export interface reply extends Tag {
  type: "reply"
  data: {
    /**回复时所引用的消息id, 必须为本群消息.*/
    id: number
  } | {
    /**自定义回复的信息*/
    text: string
    /**自定义回复时的自定义QQ, 如果使用自定义信息必须指定.*/
    qq: number
    /**可选. 自定义回复时的时间, 格式为Unix时间*/
    time?: number
    /**起始消息序号, 可通过 get_msg 获得*/
    seq?: number
  }
}

export interface image extends Tag {
  type: "image"
  data: {
    /** 图片文件名 */
    file: string
    /** 图片类型, flash 表示闪照, show 表示秀图, 默认普通图片 */
    type?: string
    /** `收` 图片 URL */
    url?: string
    /** 只在通过网络 URL 发送时有效, 表示是否使用已缓存的文件, 默认 1 */
    cache?: number
    /** 发送秀图时的特效id, 默认为40000 <br/>取值:[40000,40005]*/
    id?: number
    /** 通过网络下载图片时的线程数, 默认单线程. (在资源不支持并发时会自动处理) */
    c?: number
  }
}

export interface music extends Tag {
  type: "music"
  data: {
    /** 分别表示使用 QQ 音乐、网易云音乐、虾米音乐 */
    type: "qq" | "163" | "xm"
    /** 歌曲 ID */
    id: number
  } | {
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
}

export interface location extends Tag {
  type: "location"
  data: {
    /**纬度*/
    lat: number
    /**经度*/
    lon: number
    /**`收` 发送时可选, 标题*/
    title?: string
    /**`收` 发送时可选, 内容描述*/
    content?: string
  }
}

export interface contact extends Tag {
  type: "contact"
  data: {
    /**推荐好友/群*/
    type: "qq" | "group"
    /**被推荐的 QQ （群）号*/
    id: number
  }
}

export interface share extends Tag {
  type: "share"
  data: {
    /** URL */
    url: string
    /** 标题 */
    title: string
    /** `收` 内容描述 */
    content?: string
    /** `收` 图片 URL */
    image?: string
  }
}

export interface anonymous extends Tag {
  type: "anonymous"
  data: {}
}

export interface shake extends Tag {
  type: "shake"
  data: {}
}

export interface dice extends Tag {
  type: "dice"
  data: {}
}

export interface rps extends Tag {
  type: "rps"
  data: {}
}

export interface at extends Tag {
  type: "at"
  data: {
    /** .@的 QQ 号, `all` 表示全体成员 */
    qq: number | "all"
  }
}

export interface video extends Tag {
  type: "video"
  data: {
    /**视频地址, 支持http和file发送*/
    file: string
    /**视频封面, 支持http, file和base64发送, 格式必须为jpg*/
    cover?: string
    /**通过网络下载视频时的线程数, 默认单线程. (在资源不支持并发时会自动处理)*/
    c?: number
  }
}

export interface record extends Tag {
  type: "record"
  data: {
    /** 语音文件名 */
    file: string
    /** `收` 表示变声,发送时可选, 默认 0, 设置为 1 */
    magic?: boolean
    /** `收` 语音 URL */
    url?: string
    /** 只在通过网络 URL 发送时有效, 表示是否使用已缓存的文件, 默认 1 */
    cache?: boolean
    /** 只在通过网络 URL 发送时有效, 表示是否通过代理下载文件 ( 需通过环境变量或配置文件配置代理 ) , 默认 1 */
    proxy?: boolean
    /** 只在通过网络 URL 发送时有效, 单位秒, 表示下载网络文件的超时时间 , 默认不超时 */
    timeout?: number
  }
}

export interface face extends Tag {
  type: "face"
  data: {
    /** QQ 表情 ID,处于 [0,221] 区间 */
    id: number
  }
}

export interface text extends Tag {
  type: "text"
  data: {
    /** 纯文本内容 */
    text: string
  }
}
