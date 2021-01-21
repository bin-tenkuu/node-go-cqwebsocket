"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CQTag_1 = __importDefault(require("./CQTag"));
/**
 * 未在文档中
 * @deprecated
 */
class CQSFace extends CQTag_1.default {
    constructor(id) {
        super("sface", { id });
    }
    get id() {
        return this.data.id;
    }
    coerce() {
        this.data.id = Number(this.data.id);
        return this;
    }
}
exports.default = CQSFace;
//# sourceMappingURL=CQSFace.js.map