import CQTag from "./CQTag";

/**
 * 回复
 */
export default class CQReply extends CQTag {
  /**
   * 回复时所引用的消息id, 必须为本群消息.
   * @param id
   */
  constructor(id: number) {
    super("reply", {id});
  }

  get id() {
    return this.data.id;
  }

  coerce() {
    this.data.id = Number(this.data.id);
    return this;
  }
}