import CQTag from "./CQTag";

/**
 * 匿名发消息
 * @deprecated
 */
export default class CQAnonymous extends CQTag {
  /**
   *
   * @param ignore 可选, 表示无法匿名时是否继续发送
   */
  constructor(ignore: boolean = false) {
    super("anonymous");
    this.modifier.ignore = Boolean(ignore);
  }

  get ignore() {
    return this.modifier.ignore;
  }

  set ignore(shouldIgnoreIfFailed) {
    this.modifier.ignore = Boolean(shouldIgnoreIfFailed);
  }
};
