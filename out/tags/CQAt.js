"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CQTag_1 = __importDefault(require("./CQTag"));
/**
 * -@某人
 */
class CQAt extends CQTag_1.default {
    /**
     *
     * @param qq @的 QQ 号, `all` 表示全体成员
     */
    constructor(qq) {
        super("at", { qq });
    }
    get qq() {
        return this.data.qq;
    }
    coerce() {
        this.data.qq = Number(this.data.qq);
        return this;
    }
}
exports.default = CQAt;
//# sourceMappingURL=CQAt.js.map