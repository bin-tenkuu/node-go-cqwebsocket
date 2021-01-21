import CQTag from "./CQTag";

/**
 * 未支持
 * @deprecated
 */
export default class CQEmoji extends CQTag {
  constructor(id: number) {
    super("emoji", {id});
  }

  get id() {
    return this.data.id;
  }

  coerce() {
    this.data.id = Number(this.data.id);
    return this;
  }
}
