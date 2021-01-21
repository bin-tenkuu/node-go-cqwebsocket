/**
 * 所有标签基类
 */
export default class CQTag {
    _type: string;
    _data: {
        [key: string]: any;
    };
    _modifier: {
        [key: string]: any;
    };
    /**
     *
     * @param type 标签类型
     * @param data 具体数据
     */
    constructor(type: string, data?: {});
    get tagName(): string;
    get data(): {
        [key: string]: any;
    };
    /**
     * 获取额外值
     * @return {*}
     */
    get modifier(): {
        [key: string]: any;
    };
    /**
     * 设置额外值
     * @param val
     */
    set modifier(val: {
        [key: string]: any;
    });
    toJSON(): {
        type: string;
        data: {
            [key: string]: any;
        } & {
            [key: string]: any;
        };
    };
    toString(): string;
    /**
     * @abstract
     * 强制将属性转换为对应类型
     */
    coerce(): this;
}
