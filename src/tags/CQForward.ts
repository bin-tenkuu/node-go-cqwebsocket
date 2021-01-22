import CQTag from "./CQTag";

/**
 * 合并转发
 * @see https://ishkong.github.io/go-cqhttp-docs/cqcode/#%E5%90%88%E5%B9%B6%E8%BD%AC%E5%8F%91
 */
export default class CQForward extends CQTag {
  /**
   *
   * @param {string} id 合并转发ID, 需要通过 /get_forward_msg API获取转发的具体内容
   */
  constructor(id: string) {
    super("forward", {id});

  }

}