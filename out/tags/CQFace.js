"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CQTag_1 = __importDefault(require("./CQTag"));
/**
 * QQ 表情
 */
class CQFace extends CQTag_1.default {
    /**
     *
     * @param id QQ 表情 ID
     * @see https://github.com/richardchien/coolq-http-api/wiki/%E8%A1%A8%E6%83%85-CQ-%E7%A0%81-ID-%E8%A1%A8
     */
    constructor(id) {
        super("face", { id });
    }
    get id() {
        return this.data.id;
    }
    coerce() {
        this.data.id = Number(this.data.id);
        return this;
    }
}
exports.default = CQFace;
//# sourceMappingURL=CQFace.js.map