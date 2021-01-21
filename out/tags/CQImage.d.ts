import CQTag from "./CQTag";
declare type IDs = 40000 | 40001 | 40002 | 40003 | 40004 | 40005;
interface ExtraParam {
    /**
     * 图片类型, flash 表示闪照, show 表示秀图, 默认普通图片
     */
    type?: "flash" | "show" | undefined;
    /**
     * 图片 URL
     */
    url?: string;
    /**
     * 只在通过网络 URL 发送时有效, 表示是否使用已缓存的文件, 默认 1
     */
    cache?: 0 | 1;
    /**
     * 发送秀图时的特效id, 默认为40000
     */
    id?: IDs;
    /**
     * 通过网络下载图片时的线程数, 默认单线程. (在资源不支持并发时会自动处理)
     */
    c?: 1 | 2 | 3;
}
/**
 * 图片
 */
export default class CQImage extends CQTag {
    _modifier: ExtraParam;
    /**
     * @param file 图片文件名
     * @param exterParam 额外参数
     * @see https://ishkong.github.io/go-cqhttp-docs/cqcode/#%E5%9B%BE%E7%89%87
     */
    constructor(file: string, exterParam?: ExtraParam);
    get file(): any;
    get url(): any;
    get cache(): any;
    set cache(cache: any);
    coerce(): this;
}
export {};
