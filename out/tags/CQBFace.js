"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CQTag_1 = __importDefault(require("./CQTag"));
/**
 * go-cqhttp中不支持
 * @deprecated
 */
class CQBFace extends CQTag_1.default {
    /**
     * @param id
     * @param p the unknown, mysterious "P"
     * @see https://github.com/richardchien/coolq-http-api/wiki/CQ-%E7%A0%81%E7%9A%84%E5%9D%91
     */
    constructor(id, p) {
        super("bface", { id });
        this.modifier.p = p;
    }
    get id() {
        return this.data.id;
    }
    coerce() {
        this.data.id = Number(this.data.id);
        return this;
    }
}
exports.default = CQBFace;
;
//# sourceMappingURL=CQBFace.js.map