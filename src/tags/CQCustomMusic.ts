import CQTag from "./CQTag";

/**
 * 音乐自定义分享
 */
export default class CQCustomMusic extends CQTag {
  /**
   *
   * @param url 点击后跳转目标 URL
   * @param audio 音乐 URL
   * @param title 标题
   * @param content 发送时可选, 内容描述
   * @param image 发送时可选, 图片 URL
   */
  constructor(url: string, audio: string, title: string, content?: string, image?: string) {
    super("music", {type: "custom", url, audio, title, content, image});
  }

  get type() {
    return "custom";
  }

  get url() {
    return this.data.url;
  }

  get audio() {
    return this.data.audio;
  }

  get title() {
    return this.data.title;
  }

  get content() {
    return this.data.content;
  }

  get image() {
    return this.data.image;
  }

  coerce() {
    this.data.type = "custom";
    this.data.url = String(this.data.url);
    this.data.audio = String(this.data.audio);
    this.data.title = String(this.data.title);
    this.data.content = String(this.data.content);
    this.data.image = String(this.data.image);
    return this;
  }
};
