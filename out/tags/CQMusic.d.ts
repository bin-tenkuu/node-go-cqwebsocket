import CQTag from "./CQTag";
/**
 * 音乐分享
 */
export default class CQMusic extends CQTag {
    /**
     *
     * @param type 分别表示使用 QQ 音乐、网易云音乐、虾米音乐
     * @param id 歌曲 ID
     */
    constructor(type: "qq" | "163" | "xm", id: number);
    get type(): any;
    get id(): any;
    coerce(): this;
}
