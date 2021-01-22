import CQAnonymous from "./CQAnonymous";
import CQAt from "./CQAt";
import CQBFace from "./CQBFace";
import CQCustomMusic from "./CQCustomMusic";
import CQDice from "./CQDice";
import CQEmoji from "./CQEmoji";
import CQFace from "./CQFace";
import CQForward from "./CQForward";
import CQImage from "./CQImage";
import CQMusic from "./CQMusic";
import CQNode from "./CQNode";
import CQRecord from "./CQRecord";
import CQReply from "./CQReply";
import CQRPS from "./CQRPS";
import CQSFace from "./CQSFace";
import CQShake from "./CQShake";
import CQShare from "./CQShare";
import CQTag from "./CQTag";
import CQText from "./CQText";

export const CQ = {
  at: (qq: number | "all") => new CQAt(qq),
  text: (text: string) => new CQText(text),
  reply: (id: number) => new CQReply(id),
  image: (file: string) => new CQImage(file),
  node: (name: string, uin: number | string, content: CQTag | string) => new CQNode({name, uin, content}),
  nodeId: (id: number) => new CQNode({id}),
};
const SPLIT = /[\[\]]/;
const CQ_TAG_REGEXP = /^CQ:([a-z]+)(?:,(.+))?$/;

/**
 * @param tagStr tagStr
 * @example `CQ:share,title=震惊&#44;小伙睡觉前居然...,url=http://baidu.com/?a=1&amp;b=2`
 */
function parseCQ(tagStr: string): CQTag {
  let tag;
  let match = CQ_TAG_REGEXP.exec(tagStr);
  let tagName = match?.[1] || "error";
  if (match?.[2]) {
    let data = Object.fromEntries(match[2].split(",").map((v) => {
      return v.split("=");
    }));
    tag = new CQTag(tagName, data);
  } else {
    tag = new CQTag(tagName);
  }
  let proto;
  switch (tagName) {
    case "anonymous":
      proto = CQAnonymous.prototype;
      break;
    case "at":
      proto = CQAt.prototype;
      break;
    case "bface":
      proto = CQBFace.prototype;
      break;
    case "music":
      proto = tag.data.type === "custom"
          ? CQCustomMusic.prototype : CQMusic.prototype;
      break;
    case "dice":
      proto = CQDice.prototype;
      break;
    case "emoji":
      proto = CQEmoji.prototype;
      break;
    case "face":
      proto = CQFace.prototype;
      break;
    case "image":
      proto = CQImage.prototype;
      break;
    case "record":
      proto = CQRecord.prototype;
      break;
    case "rps":
      proto = CQRPS.prototype;
      break;
    case "sface":
      proto = CQSFace.prototype;
      break;
    case "shake":
      proto = CQShake.prototype;
      break;
    case "share":
      proto = CQShare.prototype;
      break;
    case "text":
      proto = CQText.prototype;
      break;
    case "reply":
      proto = CQReply.prototype;
      break;
    case "forward":
      proto = CQForward.prototype;
      break;
    case "node":
      proto = CQNode.prototype;
      break;
    default:
      proto = CQTag.prototype;
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
export function escape(str: string, insideCQ = false) {
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

/**
 * 反转义
 *
 * @param {string} str 欲反转义的字符串
 * @returns {string}反转义后的字符串
 */
export function unescape(str: string) {
  return str.replace(/&#44;/g, ",").replace(/&#91;/g, "[").replace(/&#93;/g, "]").replace(/&amp;/g, "&");
}

export {
  CQTag,
  CQAnonymous,
  CQAt,
  CQBFace,
  CQCustomMusic,
  CQDice,
  CQEmoji,
  CQFace,
  CQImage,
  CQMusic,
  CQRecord,
  CQRPS,
  CQSFace,
  CQShake,
  CQShare,
  CQText,
  CQReply,
  CQForward,
  CQNode,
};

/**
 *
 * @param {string}msg 消息
 * @return {CQTag[]}
 */
export function parse(msg: string): CQTag[] {
  return msg.split(SPLIT).filter(str => str !== "").map(str => {
    if (CQ_TAG_REGEXP.test(str)) {
      return parseCQ(str);
    }
    return new CQText(str);
  });
}

