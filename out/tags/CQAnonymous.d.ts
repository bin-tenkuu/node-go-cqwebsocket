import CQTag from "./CQTag";
/**
 * 匿名发消息
 * @deprecated
 */
export default class CQAnonymous extends CQTag {
    /**
     *
     * @param ignore 可选, 表示无法匿名时是否继续发送
     */
    constructor(ignore?: boolean);
    get ignore(): any;
    set ignore(shouldIgnoreIfFailed: any);
}
