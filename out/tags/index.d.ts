import CQAnonymous from "./CQAnonymous";
import CQAt from "./CQAt";
import CQBFace from "./CQBFace";
import CQCustomMusic from "./CQCustomMusic";
import CQDice from "./CQDice";
import CQEmoji from "./CQEmoji";
import CQFace from "./CQFace";
import CQImage from "./CQImage";
import CQMusic from "./CQMusic";
import CQRecord from "./CQRecord";
import CQRPS from "./CQRPS";
import CQSFace from "./CQSFace";
import CQShake from "./CQShake";
import CQShare from "./CQShare";
import CQText from "./CQText";
import CQTag from "./CQTag";
import CQReply from "./CQReply";
export declare const CQ: {
    at: (qq: number | "all") => CQAt;
    text: (text: string) => CQText;
    reply: (id: number) => CQReply;
    image: (file: string) => CQImage;
};
/**
 * 转义
 *
 * @param {string} str 欲转义的字符串
 * @param {boolean?} [insideCQ=false] 是否在CQ码内
 * @returns {string}转义后的字符串
 */
export declare function escape(str: string, insideCQ?: boolean): string;
/**
 * 反转义
 *
 * @param {string} str 欲反转义的字符串
 * @returns {string}反转义后的字符串
 */
export declare function unescape(str: string): string;
export { CQTag, CQAnonymous, CQAt, CQBFace, CQCustomMusic, CQDice, CQEmoji, CQFace, CQImage, CQMusic, CQRecord, CQRPS, CQSFace, CQShake, CQShare, CQText, CQReply, };
/**
 *
 * @param {string}msg 消息
 * @return {CQTag[]}
 */
export declare function parse(msg: string): CQTag[];
