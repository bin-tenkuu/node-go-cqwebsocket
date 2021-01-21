import CQTag from "./CQTag";

/**
 * @deprecated
 */
export default class CQDice extends CQTag {
  constructor() {
    super('dice')
  }

  get type() {
    return this.data.type
  }

  coerce() {
    this.data.type = Number(this.data.type)
    return this
  }
}
