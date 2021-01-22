import CQTag from "./CQTag";

export interface NodeID {
  /**
   * 转发消息id
   *
   * 直接引用他人的消息合并转发, 实际查看顺序为原消息发送顺序
   */
  id: number
}

export interface NodeCustom {
  /**
   * 发送者显示名字
   */
  name: string
  /**
   * 发送者QQ号
   */
  uin: number | string
  /**
   * 具体消息
   *
   * 不支持转发套娃, 不支持引用回复
   */
  content: CQTag | string
}

export default class CQNode extends CQTag {
  _data: NodeID | NodeCustom;

  constructor(data: NodeID | NodeCustom) {
    super("node");
    this._data = data;
  }

  coerce() {
    if ("id" in this._data) {
      this._data.id = Number(this._data.id);
    }else {
      this._data.name=String(this._data.name)
      this._data.name=String(this._data.name)
    }
    return this;
  }
}