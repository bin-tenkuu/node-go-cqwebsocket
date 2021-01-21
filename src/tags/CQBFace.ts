import CQTag from "./CQTag";

/**
 * go-cqhttp中不支持
 * @deprecated
 */
export default class CQBFace extends CQTag {
  /**
   * @param id
   * @param p the unknown, mysterious "P"
   * @see https://github.com/richardchien/coolq-http-api/wiki/CQ-%E7%A0%81%E7%9A%84%E5%9D%91
   */
  constructor(id: number, p: string) {
    super("bface", {id});
    this.modifier.p = p;
  }

  get id() {
    return this.data.id;
  }

  coerce() {
    this.data.id = Number(this.data.id);
    return this;
  }
};
