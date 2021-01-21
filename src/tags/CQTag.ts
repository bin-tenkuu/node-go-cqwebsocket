/**
 * 所有标签基类
 */
export default class CQTag {
  _type: string;
  _data: { [key: string]: any };
  _modifier: { [key: string]: any };

  /**
   *
   * @param type 标签类型
   * @param data 具体数据
   */
  constructor(type: string, data = {}) {
    this._data = data;
    this._type = type;
    this._modifier = {};
  }

  get tagName() {
    return this._type;
  }

  get data() {
    return this._data;
  }

  /**
   * 获取额外值
   * @return {*}
   */
  get modifier() {
    return this._modifier;
  }

  /**
   * 设置额外值
   * @param val
   */
  set modifier(val) {
    this._modifier = val;
  }

  toJSON() {
    const data = Object.assign({}, this.data, this.modifier);
    for (let key in data) {
      if (data.hasOwnProperty(key) && !data[key]) {
        delete data[key];
      }
    }

    return {
      type: this.tagName,
      data: data
    };
  }

  toString() {
    let ret = `[CQ:${this._type}`;

    for (let [k, v] of Object.entries(this.data)) {
      if (v !== undefined) {
        ret += `,${k}=${v}`;
      }
    }

    for (let [k, v] of Object.entries(this.modifier)) {
      if (v !== undefined) {
        ret += `,${k}=${v}`;
      }
    }

    ret += "]";
    return ret;
  }

  /**
   * @abstract
   * 强制将属性转换为对应类型
   */
  coerce() {
    return this;
  }
}
