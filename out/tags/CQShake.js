"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CQTag_1 = __importDefault(require("./CQTag"));
/**
 * 窗口抖动（戳一戳）
 * @deprecated
 */
class CQShake extends CQTag_1.default {
    constructor() {
        super("shake");
    }
}
exports.default = CQShake;
//# sourceMappingURL=CQShake.js.map