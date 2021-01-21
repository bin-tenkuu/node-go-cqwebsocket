import CQTag from "./CQTag";

/**
 * 未在文档中
 * @deprecated
 */
export default class CQSFace extends CQTag {
  constructor(id: number) {
    super("sface", {id});
  }

  get id() {
    return this.data.id;
  }

  coerce() {
    this.data.id = Number(this.data.id);
    return this;
  }
}
