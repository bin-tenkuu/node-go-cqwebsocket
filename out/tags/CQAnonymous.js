"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CQTag_1 = __importDefault(require("./CQTag"));
/**
 * 匿名发消息
 * @deprecated
 */
class CQAnonymous extends CQTag_1.default {
    /**
     *
     * @param ignore 可选, 表示无法匿名时是否继续发送
     */
    constructor(ignore = false) {
        super("anonymous");
        this.modifier.ignore = Boolean(ignore);
    }
    get ignore() {
        return this.modifier.ignore;
    }
    set ignore(shouldIgnoreIfFailed) {
        this.modifier.ignore = Boolean(shouldIgnoreIfFailed);
    }
}
exports.default = CQAnonymous;
;
//# sourceMappingURL=CQAnonymous.js.map