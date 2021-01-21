"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CQTag_1 = __importDefault(require("./CQTag"));
class CQText extends CQTag_1.default {
    constructor(text) {
        super("text", { text });
    }
    get text() {
        return this.data.text;
    }
    /**
     * @override
     * @return {module.CQText}
     */
    coerce() {
        this.data.text = String(this.data.text);
        return this;
    }
    toString() {
        return this.data.text;
    }
}
exports.default = CQText;
;
//# sourceMappingURL=CQText.js.map