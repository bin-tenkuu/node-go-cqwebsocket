import CQTag from "./CQTag";
/**
 * 未支持
 * @deprecated
 */
export default class CQEmoji extends CQTag {
    constructor(id: number);
    get id(): any;
    coerce(): this;
}
