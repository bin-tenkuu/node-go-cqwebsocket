"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CQTag_1 = __importDefault(require("./CQTag"));
/**
 * 音乐分享
 */
class CQMusic extends CQTag_1.default {
    /**
     *
     * @param type 分别表示使用 QQ 音乐、网易云音乐、虾米音乐
     * @param id 歌曲 ID
     */
    constructor(type, id) {
        super("music", { type, id });
    }
    get type() {
        return this.data.type;
    }
    get id() {
        return this.data.id;
    }
    coerce() {
        this.data.type = String(this.data.type);
        this.data.id = Number(this.data.id);
        return this;
    }
}
exports.default = CQMusic;
//# sourceMappingURL=CQMusic.js.map