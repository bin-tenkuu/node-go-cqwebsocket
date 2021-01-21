"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CQTag_1 = __importDefault(require("./CQTag"));
/**
 * 链接分享
 */
class CQShare extends CQTag_1.default {
    /**
     *
     * @param url URL
     * @param title 标题
     * @param content 发送时可选, 内容描述
     * @param image 发送时可选, 图片 URL
     */
    constructor(url, title, content, image) {
        super("share", { url, title, content, image });
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
exports.default = CQShare;
//# sourceMappingURL=CQShare.js.map