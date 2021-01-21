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
    constructor(url: string, title: string, content?: string, image?: string);
    get url(): any;
    get title(): any;
    get content(): any;
    get image(): any;
    coerce(): this;
}
