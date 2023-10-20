// noinspection JSUnusedGlobalSymbols

export interface Tag {
  type: string
  data: {
    [key: string]: any | undefined
  }
}

export class CQTag<T extends Tag = any> {
  public readonly _type: T['type']
  public readonly _data: T['data']

  public constructor(type: T['type'], data: T['data']) {
    this._type = type ?? 'unknown'
    this._data = data ?? {}
    const tag = this.valueOf()
    this._type = tag.type
    this._data = tag.data
  }

  /**
   * 用于获取data属性里的字段,<br/>
   * 值得注意的是,当接受消息为 字符串格式 时，本方法返回类型永远为 `string`,
   * 当且仅当接受消息为 数组格式 时，返回类型才可能为正常类型
   * @param key 字段
   * @return 值
   */
  public get<K extends keyof T['data']>(key: K): T['data'][K] | string {
    return this._data[key]
  }

  /**
   * 设置新值
   * @param key 字段
   * @param value 新值
   * @return 替换前的值
   */
  public set<K extends keyof T['data']>(key: K, value: T['data'][K]): T['data'][K] {
    const temp = this._data[key]
    this._data[key] = value
    return temp
  }

  public toJSON(): Tag {
    return this.valueOf()
  }

  public toString(): string {
    const { type, data } = this.valueOf()
    return `[CQ:${type}${Object.entries(data)
      .map(([k, v]) => {
        if (v == null) {
          return ''
        }
        return `,${k}=${CQ.escape(String(v), true)}`
      })
      .join('')}]`
  }

  /**浅拷贝 _data 对象*/
  public clone(): CQTag<T> {
    return new CQTag<T>(this._type, Object.assign({}, this._data))
  }

  /** 转换为纯消息段 */
  public valueOf(): Tag {
    return {
      type: this._type,
      data: this._data
    }
  }

  [Symbol.toStringTag]() {
    return CQTag.name
  }

  get tagName(): T['type'] {
    return this._type
  }
}

export const SPLIT = /(?=\[CQ:)|(?<=])/
export const CQ_TAG_REGEXP = /^\[CQ:([a-z]+)(?:,([^\]]+))?]$/

export const CQ = {
  /** 将携带 CQ码 的字符串转换为 CQ码数组 */
  parse(msg: string | Tag[]): CQTag[] {
    function parse(type: string = '', data: any = {}): CQTag {
      const tag = ReceiveTags[type]
      if (tag === undefined) {
        console.warn(`type:'${type}' not be support`)
        return new CQTag(type, data)
      }
      return new tag(type, data)
    }

    if (Array.isArray(msg)) {
      return msg
        .filter(tag => {
          return tag !== null && tag !== undefined
        })
        .map(tag => parse(tag.type, tag.data))
    }
    return msg.split(SPLIT).map(tagStr => {
      const match = CQ_TAG_REGEXP.exec(tagStr)
      if (match === null) {
        return new CQText('text', { text: CQ.unescape(tagStr) })
      }
      // `[CQ:share,title=震惊&#44;小伙睡觉前居然...,url=http://baidu.com/?a=1&amp;b=2]`
      const [, tagName, value] = match
      if (value === undefined) {
        return parse(tagName)
      }
      const data = Object.fromEntries(
        value.split(',').map(v => {
          const index = v.indexOf('=')
          return [v.substr(0, index), v.substr(index + 1)]
        })
      )
      return parse(tagName, data)
    })
  },
  /**
   * 转义
   * @param str 欲转义的字符串
   * @param [insideCQ=false] 是否在CQ码内
   * @returns 转义后的字符串
   */
  escape(str: string, insideCQ = false): string {
    if (!/[[\]&,]/.test(str)) {
      return str
    }
    const temp = str.replace(/&/g, '&amp;').replace(/\[/g, '&#91;').replace(/]/g, '&#93;')
    if (insideCQ) {
      return temp.replace(/,/g, '&#44;')
    }
    return temp
  },
  /**
   * 反转义
   *
   * @param str 欲反转义的字符串
   * @returns 反转义后的字符串
   */
  unescape(str: string): string {
    return str
      .replace(/&#44;/g, ',')
      .replace(/&#91;/g, '[')
      .replace(/&#93;/g, ']')
      .replace(/&amp;/g, '&')
  },
  /**
   * 纯文本
   * @param text 纯文本内容
   */
  text(text: string) {
    return new CQText('text', { text: String(text) })
  },
  /**
   * QQ 表情
   * @param id QQ 表情 ID,处于 [0,221] 区间
   * @see https://github.com/kyubotics/coolq-http-api/wiki/%E8%A1%A8%E6%83%85-CQ-%E7%A0%81-ID-%E8%A1%A8
   */
  face(id: number) {
    return new CQFace('face', { id })
  },
  /**
   * 语音
   * @param file 语音文件名(或URL)
   * @param magic 发送时可选, 默认 0, 设置为 1 表示变声
   * @param cache 只在通过网络 URL 发送时有效, 表示是否使用已缓存的文件, 默认 1
   * @param proxy 只在通过网络 URL 发送时有效, 表示是否通过代理下载文件 ( 需通过环境变量或配置文件配置代理 ) , 默认 1
   * @param timeout 只在通过网络 URL 发送时有效, 单位秒, 表示下载网络文件的超时时间 , 默认不超时
   */
  record(file: string, magic?: boolean, cache?: boolean, proxy?: boolean, timeout?: number) {
    return new CQRecord('record', {
      file,
      magic,
      cache,
      proxy,
      timeout
    })
  },
  /**
   * 短视频
   * @param file 视频地址, 支持http和file发送
   * @param cover 视频封面, 支持http, file和base64发送, 格式必须为jpg
   * @param c 通过网络下载视频时的线程数, 默认单线程. (在资源不支持并发时会自动处理)
   */
  video(file: string, cover?: string, c?: 2 | 3) {
    return new CQVideo('video', { file, cover, c })
  },
  /**
   * .@某人
   * @param qq @的 QQ 号, `all` 表示全体成员
   * @param name 当在群中找不到此QQ号的名称时使用
   */
  at(qq: number | 'all', name?: string) {
    return new CQAt('at', { qq, name })
  },
  /**
   * 链接分享
   * @param url URL
   * @param title 标题
   * @param content 发送时可选, 内容描述
   * @param image 发送时可选, 图片 URL
   */
  share(url: string, title: string, content?: string, image?: string) {
    return new CQShare('share', {
      url,
      title,
      content,
      image
    })
  },
  /**
   * 音乐分享
   * @param type 分别表示使用 QQ 音乐、网易云音乐、虾米音乐
   * @param id 歌曲 ID
   */
  music(type: 'qq' | '163' | 'xm', id: number) {
    return new CQTag<music>('music', { type, id })
  },
  /**
   * 音乐自定义分享
   * @param url 点击后跳转目标 URL
   * @param audio 音乐 URL
   * @param title 标题
   * @param content 发送时可选, 内容描述
   * @param image 发送时可选, 图片 URL
   */
  musicCustom(url: string, audio: string, title: string, content?: string, image?: string) {
    return new CQMusicCustom('music', {
      type: 'custom',
      url,
      audio,
      title,
      content,
      image
    })
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
    return new CQImage('image', {
      file,
      type,
      url,
      cache,
      id,
      c
    })
  },
  /**
   * 回复
   * @param id 回复时所引用的消息id, 必须为本群消息.
   */
  reply(id: number) {
    return new CQReply('reply', { id })
  },
  /**
   * 自定义回复
   * @param text 自定义回复时的自定义QQ, 如果使用自定义信息必须指定.
   * @param qq 自定义回复时的自定义QQ, 如果使用自定义信息必须指定.
   * @param id 回复时所引用的消息id, 必须为本群消息.
   * @param time 可选. 自定义回复时的时间, 格式为Unix时间
   * @param seq 起始消息序号, 可通过 get_msg 获得
   */
  replyCustom(text: string, qq: number, id?: number, time?: number, seq?: number) {
    return new CQReplyCustom('reply', { id, text, qq, time, seq })
  },
  /**
   * 戳一戳
   * @param qq 需要戳的成员
   */
  poke(qq: number) {
    return new CQPoke('poke', { qq })
  },
  /**
   * 礼物
   * @param qq 接收礼物的成员
   * @param id 礼物的类型
   */
  gift(qq: number, id: number) {
    return new CQGift('gift', { qq, id })
  },
  /**
   * 合并转发消息节点
   * @param id 转发消息id, 直接引用他人的消息合并转发, 实际查看顺序为原消息发送顺序
   */
  nodeId(id: number) {
    return new CQNodeId('node', { id })
  },
  /**
   * 合并转发消息节点
   * @param name 发送者显示名字
   * @param user_id 发送者QQ号
   * @param content 具体消息, 不支持转发套娃, 不支持引用回复
   */
  node(name: string, user_id: number | string, content: message) {
    return new CQNode('node', { name, user_id: String(user_id), content, seq: content })
  },
  /**
   * XML 消息
   * @param data xml内容, xml中的value部分, 记得实体化处理
   * @param resid 可以不填
   */
  xml(data: string, resid?: number) {
    return new CQXml('xml', { data, resid })
  },
  /**
   * JSON 消息
   * @param data json内容, json的所有字符串记得实体化处理
   * @param resid 默认不填为0, 走小程序通道, 填了走富文本通道发送
   */
  json(data: string, resid = 0) {
    return new CQJson('json', { data, resid })
  },
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
  cardimage(
    file: string,
    minwidth?: number,
    minheight?: number,
    maxwidth?: number,
    maxheight?: number,
    source?: string,
    icon?: string
  ) {
    return new CQCardImage('cardimage', {
      file,
      minwidth,
      minheight,
      maxwidth,
      maxheight,
      source,
      icon
    })
  },
  /**
   * 文本转语音
   * @param text 内容
   */
  tts(text: string) {
    return new CQTts('tts', { text })
  },
  /**
   * 自定义 CQ码
   * @param type CQ码类型
   * @param data CQ码参数
   */
  custom<T extends Tag>(type: T['type'], data: T['data'] = {}) {
    return new CQTag<T>(type, data)
  },
  [Symbol.toStringTag]() {
    return 'CQ'
  }
} as const

export type message = string | msgTags[]
export type messageNode = NodeTags[]
export type msgTags =
  | CQText
  | CQFace
  | CQRecord
  | CQVideo
  | CQAt
  | CQRps
  | CQDice
  | CQShake
  | CQAnonymous
  | CQShare
  | CQContact
  | CQLocation
  | CQMusic
  | CQMusicCustom
  | CQImage
  | CQReply
  | CQReplyCustom
  | CQRedBag
  | CQPoke
  | CQGift
  | CQForward
  | CQXml
  | CQJson
  | CQCardImage
  | CQTts
export type NodeTags = CQNode | CQNodeId

interface tts extends Tag {
  type: 'tts'
  data: {
    /** 内容 */
    text: string
  }
}

export class CQTts extends CQTag<tts> {
  public valueOf(): tts {
    return {
      type: 'tts',
      data: {
        text: this.text
      }
    }
  }

  /** 内容 */
  get text(): string {
    return String(this._data.text)
  }
}

interface cardimage extends Tag {
  type: 'cardimage'
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

export class CQCardImage extends CQTag<cardimage> {
  public valueOf(): cardimage {
    return {
      type: 'cardimage',
      data: {
        file: this.file,
        minwidth: this.minwidth,
        minheight: this.minheight,
        maxwidth: this.maxwidth,
        maxheight: this.maxheight,
        source: this.source,
        icon: this.icon
      }
    }
  }

  /** 和image的file字段对齐, 支持也是一样的 */
  get file(): string {
    return String(this._data.file)
  }

  /** `收` 默认不填为400, 最小width */
  get minwidth(): number | undefined {
    return this._data.minwidth
  }

  /** `收` 默认不填为400, 最小height */
  get minheight(): number | undefined {
    return this._data.minheight
  }

  /** `收` 默认不填为500, 最大width */
  get maxwidth(): number | undefined {
    return this._data.maxwidth
  }

  /** `收` 默认不填为1000, 最大height */
  get maxheight(): number | undefined {
    return this._data.maxheight
  }

  /** `收` 分享来源的名称, 可以留空 */
  get source(): string | undefined {
    return this._data.source
  }

  /** `收` 分享来源的icon图标url, 可以留空 */
  get icon(): string | undefined {
    return this._data.icon
  }
}

interface json extends Tag {
  type: 'json'
  data: {
    /** json内容, json的所有字符串记得实体化处理 */
    data: string
    /** `收` 默认不填为0, 走小程序通道, 填了走富文本通道发送 */
    resid?: number
  }
}

export class CQJson extends CQTag<json> {
  public valueOf(): json {
    return {
      type: 'json',
      data: {
        data: this.data,
        resid: this.resid
      }
    }
  }

  /** json内容, json的所有字符串记得实体化处理 */
  get data(): string {
    return String(this._data.data)
  }

  /** `收` 默认不填为0, 走小程序通道, 填了走富文本通道发送 */
  get resid(): number | undefined {
    return this._data.resid
  }
}

interface xml extends Tag {
  type: 'xml'
  data: {
    /** xml内容, xml中的value部分, 记得实体化处理 */
    data: string
    /** `收` 可以不填 */
    resid?: number
  }
}

export class CQXml extends CQTag<xml> {
  public valueOf(): xml {
    return {
      type: 'xml',
      data: {
        data: this.data,
        resid: this.resid
      }
    }
  }

  /** xml内容, xml中的value部分, 记得实体化处理 */
  get data(): string {
    return String(this._data.data)
  }

  /** `收` 可以不填 */
  get resid(): number | undefined {
    return this._data.resid
  }
}

interface node extends Tag {
  type: 'node'
  data: {
    /** 发送者显示名字 */
    name: string
    /** 发送者QQ号 */
    user_id: number | string
    /**
     * 具体消息
     *
     * 不支持转发套娃, 不支持引用回复
     */
    content: message
    /**具体消息,用于自定义消息*/
    seq: message
  }
}

export class CQNode extends CQTag<node> {
  public valueOf(): node {
    return {
      type: 'node',
      data: {
        name: this.name,
        user_id: this.user_id,
        content: this.content,
        seq: this.seq
      }
    }
  }

  /**发送者显示名字*/
  get name(): string {
    return String(this._data.name)
  }

  /**@deprecated 发送者QQ号*/
  get uin(): string {
    return String(this._data.user_id)
  }

  /**发送者QQ号*/
  get user_id(): string {
    return String(this._data.user_id)
  }

  /**具体消息,不支持转发套娃,不支持引用回复*/
  get content(): message {
    return this._data.content
  }

  /**具体消息,不支持转发套娃,不支持引用回复*/
  get seq(): message {
    return this._data.seq
  }
}

interface nodeId extends Tag {
  type: 'node'
  data: {
    /** 转发消息id, 直接引用他人的消息合并转发, 实际查看顺序为原消息发送顺序 */
    id: number
  }
}

export class CQNodeId extends CQTag<nodeId> {
  public valueOf(): nodeId {
    return {
      type: 'node',
      data: {
        id: this.id
      }
    }
  }

  /** 转发消息id, 直接引用他人的消息合并转发, 实际查看顺序为原消息发送顺序 */
  get id(): number {
    return this._data.id
  }
}

interface forward extends Tag {
  type: 'forward'
  data: {
    /** 合并转发ID, 需要通过 {@link get_forward_msg} API获取转发的具体内容 */
    id: string
  }
}

export class CQForward extends CQTag<forward> {
  public valueOf(): forward {
    return {
      type: 'forward',
      data: {
        id: this.id
      }
    }
  }

  /** 合并转发ID, 需要通过 [get_forward_msg]{@link CQWebSocket.get_forward_msg} API获取转发的具体内容 */
  get id(): string {
    return String(this._data.id)
  }
}

interface gift extends Tag {
  type: 'gift'
  data: {
    /** 接收礼物的成员 */
    qq: number
    /** 礼物的类型 <br/>取值:[0,13]*/
    id: number
  }
}

export class CQGift extends CQTag<gift> {
  public valueOf(): gift {
    return {
      type: 'gift',
      data: {
        qq: this.qq,
        id: this.id
      }
    }
  }

  /** 接收礼物的成员 */
  get qq(): number {
    return Number(this._data.qq)
  }

  /** 礼物的类型 <br/>取值:[0,13]*/
  get id(): number {
    return Number(this._data.id)
  }
}

interface poke extends Tag {
  type: 'poke'
  data: {
    /** 需要戳的成员 */
    qq: number
  }
}

export class CQPoke extends CQTag<poke> {
  public valueOf(): poke {
    return {
      type: 'poke',
      data: {
        qq: this.qq
      }
    }
  }

  /** 需要戳的成员 */
  get qq(): number {
    return Number(this._data.qq)
  }
}

interface redbag extends Tag {
  type: 'redbag'
  data: {
    /**祝福语/口令*/
    title: string
  }
}

export class CQRedBag extends CQTag<redbag> {
  public valueOf(): redbag {
    return {
      type: 'redbag',
      data: {
        title: this.title
      }
    }
  }

  /**祝福语/口令*/
  get title(): string {
    return String(this._data.title)
  }
}

interface reply extends Tag {
  type: 'reply'
  data: {
    /**回复时所引用的消息id, 必须为本群消息.*/
    id: number
  }
}

export class CQReply extends CQTag<reply> {
  public valueOf(): reply {
    return {
      type: 'reply',
      data: {
        id: this.id
      }
    }
  }

  /**回复时所引用的消息id, 必须为本群消息.*/
  get id(): number {
    return Number(this._data.id)
  }
}

interface replyCustom extends Tag {
  type: 'reply'
  data: {
    /**回复时所引用的消息id, 必须为本群消息.*/
    id: number | undefined
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

export class CQReplyCustom extends CQTag<replyCustom> {
  public valueOf(): replyCustom {
    return {
      type: 'reply',
      data: {
        id: this.id,
        text: this.text,
        qq: this.qq,
        time: this.time,
        seq: this.seq
      }
    }
  }

  /**回复时所引用的消息id, 必须为本群消息.*/
  get id(): number | undefined {
    return Number(this._data.id)
  }

  /**自定义回复的信息*/
  get text(): string {
    return String(this._data.text)
  }

  /**自定义回复时的自定义QQ, 如果使用自定义信息必须指定.*/
  get qq(): number {
    return Number(this._data.qq)
  }

  /**可选. 自定义回复时的时间, 格式为Unix时间*/
  get time(): number | undefined {
    return this._data.time
  }

  /**起始消息序号, 可通过 get_msg 获得*/
  get seq(): number | undefined {
    return this._data.seq
  }
}

interface image extends Tag {
  type: 'image'
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

export class CQImage extends CQTag<image> {
  public valueOf(): image {
    return {
      type: 'image',
      data: {
        file: this.file,
        type: this.type,
        url: this.url,
        cache: this.cache,
        id: this.id,
        c: this.c
      }
    }
  }

  /** 图片文件名 */
  get file(): string {
    return String(this._data.file)
  }

  /** 图片类型, flash 表示闪照, show 表示秀图, 默认普通图片 */
  get type(): string | undefined {
    return this._data.type
  }

  /** `收` 图片 URL */
  get url(): string | undefined {
    return this._data.url
  }

  /** 只在通过网络 URL 发送时有效, 表示是否使用已缓存的文件, 默认 1 */
  get cache(): number | undefined {
    return this._data.cache
  }

  /** 发送秀图时的特效id, 默认为40000 <br/>取值:[40000,40005]*/
  get id(): number | undefined {
    return this._data.id
  }

  /** 通过网络下载图片时的线程数, 默认单线程. (在资源不支持并发时会自动处理) */
  get c(): number | undefined {
    return this._data.c
  }
}

interface music extends Tag {
  type: 'music'
  data: {
    /** 分别表示使用 QQ 音乐、网易云音乐、虾米音乐 */
    type: 'qq' | '163' | 'xm'
    /** 歌曲 ID */
    id: number
  }
}

export class CQMusic extends CQTag<music> {
  public valueOf(): music {
    return {
      type: 'music',
      data: {
        type: this.type,
        id: this.id
      }
    }
  }

  /** 分别表示使用 QQ 音乐、网易云音乐、虾米音乐 */
  get type(): 'qq' | '163' | 'xm' {
    return <'qq' | '163' | 'xm'>String(this._data.type)
  }

  /** 歌曲 ID */
  get id(): number {
    return Number(this._data.id)
  }
}

interface musicCustom extends Tag {
  type: 'music'
  data: {
    type: 'custom'
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

export class CQMusicCustom extends CQTag<musicCustom> {
  public valueOf(): musicCustom {
    return {
      type: 'music',
      data: {
        type: this.type,
        url: this.url,
        audio: this.audio,
        title: this.title,
        content: this.content,
        image: this.image
      }
    }
  }

  get type(): 'custom' {
    return 'custom'
  }

  /** 点击后跳转目标 URL */
  get url(): string {
    return String(this._data.url)
  }

  /** 音乐 URL */
  get audio(): string {
    return String(this._data.audio)
  }

  /** 标题 */
  get title(): string {
    return String(this._data.title)
  }

  /** 发送时可选, 内容描述 */
  get content(): string | undefined {
    return this._data.content
  }

  /** 发送时可选, 图片 URL */
  get image(): string | undefined {
    return this._data.image
  }
}

interface location extends Tag {
  type: 'location'
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

export class CQLocation extends CQTag<location> {
  public valueOf(): location {
    return {
      type: 'location',
      data: {
        lat: this.lat,
        lon: this.lon,
        title: this.title,
        content: this.content
      }
    }
  }

  get lat(): number {
    return Number(this._data.lat)
  }

  get lon(): number {
    return Number(this._data.lon)
  }

  get title(): string | undefined {
    return this._data.title
  }

  get content(): string | undefined {
    return this._data.content
  }
}

interface contact extends Tag {
  type: 'contact'
  data: {
    /**推荐好友/群*/
    type: 'qq' | 'group'
    /**被推荐的 QQ （群）号*/
    id: number
  }
}

export class CQContact extends CQTag<contact> {
  public valueOf(): contact {
    return {
      type: 'contact',
      data: {
        type: this.type,
        id: this.id
      }
    }
  }

  get type(): 'qq' | 'group' {
    return <'qq' | 'group'>String(this._data.type)
  }

  get id(): number {
    return Number(this._data.id)
  }
}

interface share extends Tag {
  type: 'share'
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

export class CQShare extends CQTag<share> {
  public valueOf(): share {
    return {
      type: 'share',
      data: {
        url: this.url,
        title: this.title,
        content: this.content,
        image: this.image
      }
    }
  }

  get url(): string {
    return String(this._data.url)
  }

  get title(): string {
    return String(this._data.title)
  }

  get content(): string | undefined {
    return this._data.content
  }

  get image(): string | undefined {
    return this._data.image
  }
}

interface anonymous extends Tag {
  type: 'anonymous'
  data: {}
}

export class CQAnonymous extends CQTag<anonymous> {
  public valueOf(): anonymous {
    return {
      type: 'anonymous',
      data: {}
    }
  }
}

interface shake extends Tag {
  type: 'shake'
  data: {}
}

export class CQShake extends CQTag<shake> {
  public valueOf(): shake {
    return {
      type: 'shake',
      data: {}
    }
  }
}

interface dice extends Tag {
  type: 'dice'
  data: {}
}

export class CQDice extends CQTag<dice> {
  public valueOf(): dice {
    return {
      type: 'dice',
      data: {}
    }
  }
}

interface rps extends Tag {
  type: 'rps'
  data: {}
}

export class CQRps extends CQTag<rps> {
  public valueOf(): rps {
    return {
      type: 'rps',
      data: {}
    }
  }
}

interface at extends Tag {
  type: 'at'
  data: {
    /** .@的 QQ 号, `all` 表示全体成员 */
    qq: number | 'all'
    /**当在群中找不到此QQ号的名称时才会生效*/
    name: string | undefined
  }
}

export class CQAt extends CQTag<at> {
  public valueOf(): at {
    return {
      type: 'at',
      data: {
        qq: this.qq,
        name: this.name
      }
    }
  }

  get qq(): number | 'all' {
    return this._data.qq
  }

  get name(): string | undefined {
    return this._data.name
  }
}

interface video extends Tag {
  type: 'video'
  data: {
    /**视频地址, 支持http和file发送*/
    file: string
    /**视频封面, 支持http, file和base64发送, 格式必须为jpg*/
    cover?: string
    /**通过网络下载视频时的线程数, 默认单线程. (在资源不支持并发时会自动处理)*/
    c?: number
  }
}

export class CQVideo extends CQTag<video> {
  public valueOf(): video {
    return {
      type: 'video',
      data: {
        file: this.file,
        cover: this.cover,
        c: this.c
      }
    }
  }

  get file(): string {
    return String(this._data.file)
  }

  get cover(): string | undefined {
    return this._data.cover
  }

  get c(): number | undefined {
    return this._data.c
  }
}

interface record extends Tag {
  type: 'record'
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

export class CQRecord extends CQTag<record> {
  public valueOf(): record {
    return {
      type: 'record',
      data: {
        file: this.file,
        magic: this.magic,
        url: this.url,
        cache: this.cache,
        proxy: this.proxy,
        timeout: this.timeout
      }
    }
  }

  /** 语音文件名 */
  get file(): string {
    return String(this._data.file)
  }

  /** `收` 表示变声,发送时可选, 默认 0, 设置为 1 */
  get magic(): boolean | undefined {
    return this._data.magic
  }

  /** `收` 语音 URL */
  get url(): string | undefined {
    return this._data.url
  }

  /** 只在通过网络 URL 发送时有效, 表示是否使用已缓存的文件, 默认 1 */
  get cache(): boolean | undefined {
    return this._data.cache
  }

  /** 只在通过网络 URL 发送时有效, 表示是否通过代理下载文件 ( 需通过环境变量或配置文件配置代理 ) , 默认 1 */
  get proxy(): boolean | undefined {
    return this._data.proxy
  }

  /** 只在通过网络 URL 发送时有效, 单位秒, 表示下载网络文件的超时时间 , 默认不超时 */
  get timeout(): number | undefined {
    return this._data.timeout
  }
}

interface face extends Tag {
  type: 'face'
  data: {
    /** QQ 表情 ID,处于 [0,221] 区间 */
    id: number
  }
}

export class CQFace extends CQTag<face> {
  public valueOf(): face {
    return {
      type: 'face',
      data: {
        id: this.id
      }
    }
  }

  /** QQ 表情 ID,处于 [0,221] 区间 */
  get id(): number {
    return Number(this._data.id)
  }
}

interface text extends Tag {
  type: 'text'
  data: {
    /** 纯文本内容 */
    text: string
  }
}

export class CQText extends CQTag<text> {
  public valueOf(): text {
    return {
      type: 'text',
      data: {
        text: this.text
      }
    }
  }

  /** 纯文本内容 */
  get text(): string {
    return String(this._data.text)
  }
}

/**本对象中收录所有会被接收到的CQ码,格式为{ type : CQTag类 }*/
export const ReceiveTags: { [key in string]: any } = {
  at: CQAt,
  face: CQFace,
  text: CQText,
  reply: CQReply,
  image: CQImage,
  contact: CQContact,
  json: CQJson,
  dice: CQDice,
  forward: CQForward,
  anonymous: CQAnonymous,
  location: CQLocation,
  record: CQRecord,
  redbag: CQRedBag,
  rps: CQRps,
  shake: CQShake,
  share: CQShare,
  video: CQVideo,
  xml: CQXml
} as const
