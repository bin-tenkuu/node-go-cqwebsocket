import CQTag from "./CQTag";
/**
 * QQ 表情
 */
export default class CQFace extends CQTag {
    /**
     *
     * @param id QQ 表情 ID
     * @see https://github.com/richardchien/coolq-http-api/wiki/%E8%A1%A8%E6%83%85-CQ-%E7%A0%81-ID-%E8%A1%A8
     */
    constructor(id: number);
    get id(): any;
    coerce(): this;
}
