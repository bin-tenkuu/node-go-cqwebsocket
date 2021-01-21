import CQTag from "./CQTag";

interface ExtraParam {
  /**
   * 发送时可选, 默认 0, 设置为 1 表示变声
   */
  magic?: 0 | 1
  /**
   * 只在通过网络 URL 发送时有效, 表示是否使用已缓存的文件, 默认 1
   */
  cache?: 0 | 1
  /**
   * 只在通过网络 URL 发送时有效, 表示是否通过代理下载文件 ( 需通过环境变量或配置文件配置代理 ) , 默认 1
   */
  proxy?: 0 | 1
  /**
   * 只在通过网络 URL 发送时有效, 单位秒, 表示下载网络文件的超时时间 , 默认不超时
   */
  timeout?: number
}

/**
 * 语音
 */
export default class CQRecord extends CQTag {
  _modifier: ExtraParam;

  /**
   *
   * @param file 语音文件名
   * @param exterParam
   */
  constructor(file: string, exterParam: ExtraParam = {}) {
    super("record", {file});
    this._modifier = exterParam;
  }

  /**
   * 语音 URL
   */
  get url() {
    return this.data.url;
  }

  get file() {
    return this.data.file;
  }

  get magic() {
    return this.modifier.magic;
  }

  set magic(magic) {
    this.modifier.magic = magic ? true : undefined;
  }

  coerce() {
    this.data.file = String(this.data.file);
    return this;
  }
}
