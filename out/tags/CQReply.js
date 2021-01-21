"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CQTag_1 = __importDefault(require("./CQTag"));
/**
 * 回复
 */
class CQReply extends CQTag_1.default {
    /**
     * 回复时所引用的消息id, 必须为本群消息.
     * @param id
     */
    constructor(id) {
        super("reply", { id });
    }
    get id() {
        return this.data.id;
    }
    coerce() {
        this.data.id = Number(this.data.id);
        return this;
    }
}
exports.default = CQReply;
//# sourceMappingURL=CQReply.js.map