"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CQTag_1 = __importDefault(require("./CQTag"));
/**
 * 图片
 */
class CQImage extends CQTag_1.default {
    /**
     * @param file 图片文件名
     * @param exterParam 额外参数
     * @see https://ishkong.github.io/go-cqhttp-docs/cqcode/#%E5%9B%BE%E7%89%87
     */
    constructor(file, exterParam = {}) {
        super("image", { file });
        this._modifier = exterParam;
    }
    get file() {
        return this.data.file;
    }
    get url() {
        return this.data.url;
    }
    get cache() {
        return this.data.cache;
    }
    set cache(cache) {
        this.data.cache = !cache ? 0 : undefined;
    }
    coerce() {
        this.data.file = String(this.data.file);
        this.data.url = String(this.data.url);
        return this;
    }
}
exports.default = CQImage;
//# sourceMappingURL=CQImage.js.map