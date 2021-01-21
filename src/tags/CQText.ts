import CQTag from "./CQTag";

export default class CQText extends CQTag {
  constructor(text: string) {
    super("text", {text});
  }

  get text() {
    return this.data.text;
  }

  /**
   * @override
   * @return {module.CQText}
   */
  coerce() {
    this.data.text = String(this.data.text);
    return this;
  }

  toString() {
    return this.data.text;
  }
};
