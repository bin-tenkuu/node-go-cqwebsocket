import CQTag from "./CQTag";
export default class CQText extends CQTag {
    constructor(text: string);
    get text(): any;
    /**
     * @override
     * @return {module.CQText}
     */
    coerce(): this;
    toString(): any;
}
