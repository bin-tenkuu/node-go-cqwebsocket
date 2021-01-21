"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CQTag_1 = __importDefault(require("./CQTag"));
/**
 * 未支持
 * @deprecated
 */
class CQEmoji extends CQTag_1.default {
    constructor(id) {
        super("emoji", { id });
    }
    get id() {
        return this.data.id;
    }
    coerce() {
        this.data.id = Number(this.data.id);
        return this;
    }
}
exports.default = CQEmoji;
//# sourceMappingURL=CQEmoji.js.map