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
    constructor(url: string, audio: string, title: string, content?: string, image?: string);
    get type(): string;
    get url(): any;
    get audio(): any;
    get title(): any;
    get content(): any;
    get image(): any;
    coerce(): this;
}
