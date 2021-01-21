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
  constructor(id: number) {
    super("face", {id});
  }

  get id() {
    return this.data.id;
  }

  coerce() {
    this.data.id = Number(this.data.id);
    return this;
  }
}
