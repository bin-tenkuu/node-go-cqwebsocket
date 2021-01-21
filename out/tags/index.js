"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.CQReply = exports.CQText = exports.CQShare = exports.CQShake = exports.CQSFace = exports.CQRPS = exports.CQRecord = exports.CQMusic = exports.CQImage = exports.CQFace = exports.CQEmoji = exports.CQDice = exports.CQCustomMusic = exports.CQBFace = exports.CQAt = exports.CQAnonymous = exports.CQTag = exports.unescape = exports.escape = exports.CQ = void 0;
const CQAnonymous_1 = __importDefault(require("./CQAnonymous"));
exports.CQAnonymous = CQAnonymous_1.default;
const CQAt_1 = __importDefault(require("./CQAt"));
exports.CQAt = CQAt_1.default;
const CQBFace_1 = __importDefault(require("./CQBFace"));
exports.CQBFace = CQBFace_1.default;
const CQCustomMusic_1 = __importDefault(require("./CQCustomMusic"));
exports.CQCustomMusic = CQCustomMusic_1.default;
const CQDice_1 = __importDefault(require("./CQDice"));
exports.CQDice = CQDice_1.default;
const CQEmoji_1 = __importDefault(require("./CQEmoji"));
exports.CQEmoji = CQEmoji_1.default;
const CQFace_1 = __importDefault(require("./CQFace"));
exports.CQFace = CQFace_1.default;
const CQImage_1 = __importDefault(require("./CQImage"));
exports.CQImage = CQImage_1.default;
const CQMusic_1 = __importDefault(require("./CQMusic"));
exports.CQMusic = CQMusic_1.default;
const CQRecord_1 = __importDefault(require("./CQRecord"));
exports.CQRecord = CQRecord_1.default;
const CQRPS_1 = __importDefault(require("./CQRPS"));
exports.CQRPS = CQRPS_1.default;
const CQSFace_1 = __importDefault(require("./CQSFace"));
exports.CQSFace = CQSFace_1.default;
const CQShake_1 = __importDefault(require("./CQShake"));
exports.CQShake = CQShake_1.default;
const CQShare_1 = __importDefault(require("./CQShare"));
exports.CQShare = CQShare_1.default;
const CQText_1 = __importDefault(require("./CQText"));
exports.CQText = CQText_1.default;
const CQTag_1 = __importDefault(require("./CQTag"));
exports.CQTag = CQTag_1.default;
const CQReply_1 = __importDefault(require("./CQReply"));
exports.CQReply = CQReply_1.default;
exports.CQ = {
    at: (qq) => new CQAt_1.default(qq),
    text: (text) => new CQText_1.default(text),
    reply: (id) => new CQReply_1.default(id),
    image: (file) => new CQImage_1.default(file),
};
const SPLIT = /[\[\]]/;
const CQ_TAG_REGEXP = /^CQ:([a-z]+)(?:,(.+))?$/;
/**
 * @param tagStr tagStr
 * @example `CQ:share,title=震惊&#44;小伙睡觉前居然...,url=http://baidu.com/?a=1&amp;b=2`
 */
function parseCQ(tagStr) {
    let tag;
    let match = CQ_TAG_REGEXP.exec(tagStr);
    let tagName = (match === null || match === void 0 ? void 0 : match[1]) || "error";
    if (match === null || match === void 0 ? void 0 : match[2]) {
        let data = Object.fromEntries(match[2].split(",").map((v) => {
            return v.split("=");
        }));
        tag = new CQTag_1.default(tagName, data);
    }
    else {
        tag = new CQTag_1.default(tagName);
    }
    let proto;
    switch (tagName) {
        case "anonymous":
            proto = CQAnonymous_1.default.prototype;
            break;
        case "at":
            proto = CQAt_1.default.prototype;
            break;
        case "bface":
            proto = CQBFace_1.default.prototype;
            break;
        case "music":
            proto = tag.data.type === "custom"
                ? CQCustomMusic_1.default.prototype : CQMusic_1.default.prototype;
            break;
        case "dice":
            proto = CQDice_1.default.prototype;
            break;
        case "emoji":
            proto = CQEmoji_1.default.prototype;
            break;
        case "face":
            proto = CQFace_1.default.prototype;
            break;
        case "image":
            proto = CQImage_1.default.prototype;
            break;
        case "record":
            proto = CQRecord_1.default.prototype;
            break;
        case "rps":
            proto = CQRPS_1.default.prototype;
            break;
        case "sface":
            proto = CQSFace_1.default.prototype;
            break;
        case "shake":
            proto = CQShake_1.default.prototype;
            break;
        case "share":
            proto = CQShare_1.default.prototype;
            break;
        case "text":
            proto = CQText_1.default.prototype;
            break;
        case "reply":
            proto = CQReply_1.default.prototype;
            break;
        default:
            proto = CQTag_1.default.prototype;
            break;
    }
    return Object.setPrototypeOf(tag, proto).coerce();
}
/**
 * 转义
 *
 * @param {string} str 欲转义的字符串
 * @param {boolean?} [insideCQ=false] 是否在CQ码内
 * @returns {string}转义后的字符串
 */
function escape(str, insideCQ = false) {
    let temp = str.replace(/&/g, "&amp;")
        .replace(/\[/g, "&#91;")
        .replace(/]/g, "&#93;");
    if (insideCQ) {
        temp = temp
            .replace(/,/g, "&#44;")
            .replace(/(\ud83c[\udf00-\udfff])|(\ud83d[\udc00-\ude4f\ude80-\udeff])|[\u2600-\u2B55]/g, " ");
    }
    return temp;
}
exports.escape = escape;
/**
 * 反转义
 *
 * @param {string} str 欲反转义的字符串
 * @returns {string}反转义后的字符串
 */
function unescape(str) {
    return str.replace(/&#44;/g, ",").replace(/&#91;/g, "[").replace(/&#93;/g, "]").replace(/&amp;/g, "&");
}
exports.unescape = unescape;
/**
 *
 * @param {string}msg 消息
 * @return {CQTag[]}
 */
function parse(msg) {
    return msg.split(SPLIT).filter(str => str !== "").map(str => {
        if (CQ_TAG_REGEXP.test(str)) {
            return parseCQ(str);
        }
        return new CQText_1.default(str);
    });
}
exports.parse = parse;
//# sourceMappingURL=index.js.map