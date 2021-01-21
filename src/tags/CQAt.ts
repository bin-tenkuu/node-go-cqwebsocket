import CQTag from "./CQTag";

/**
 * -@某人
 */
export default class CQAt extends CQTag {
  /**
   *
   * @param qq @的 QQ 号, `all` 表示全体成员
   */
  constructor(qq: number | "all") {
    super("at", {qq});
  }

  get qq() {
    return this.data.qq;
  }

  coerce() {
    this.data.qq = Number(this.data.qq);
    return this;
  }
}
