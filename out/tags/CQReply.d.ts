import CQTag from "./CQTag";
/**
 * 回复
 */
export default class CQReply extends CQTag {
    /**
     * 回复时所引用的消息id, 必须为本群消息.
     * @param id
     */
    constructor(id: number);
    get id(): any;
    coerce(): this;
}
