import CQTag from "./CQTag";

/**
 * 链接分享
 */
export default class CQShare extends CQTag {
  /**
   *
   * @param url URL
   * @param title 标题
   * @param content 发送时可选, 内容描述
   * @param image 发送时可选, 图片 URL
   */
  constructor(url: string, title: string, content?: string, image?: string) {
    super("share", {url, title, content, image});
  }

  get url() {
    return this.data.url;
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
    this.data.url = String(this.data.url);
    this.data.title = String(this.data.title);
    this.data.content = String(this.data.content);
    this.data.image = String(this.data.image);
    return this;
  }
}
