"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CQTag_1 = __importDefault(require("./CQTag"));
/**
 * @deprecated
 */
class CQDice extends CQTag_1.default {
    constructor() {
        super('dice');
    }
    get type() {
        return this.data.type;
    }
    coerce() {
        this.data.type = Number(this.data.type);
        return this;
    }
}
exports.default = CQDice;
//# sourceMappingURL=CQDice.js.map