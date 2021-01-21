"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CQTag_1 = __importDefault(require("./CQTag"));
/**
 * 语音
 */
class CQRecord extends CQTag_1.default {
    /**
     *
     * @param file 语音文件名
     * @param exterParam
     */
    constructor(file, exterParam = {}) {
        super("record", { file });
        this._modifier = exterParam;
    }
    /**
     * 语音 URL
     */
    get url() {
        return this.data.url;
    }
    get file() {
        return this.data.file;
    }
    get magic() {
        return this.modifier.magic;
    }
    set magic(magic) {
        this.modifier.magic = magic ? true : undefined;
    }
    coerce() {
        this.data.file = String(this.data.file);
        return this;
    }
}
exports.default = CQRecord;
//# sourceMappingURL=CQRecord.js.map