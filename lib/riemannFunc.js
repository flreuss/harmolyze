export default class RiemannFunc {
  constructor(baseFunc, addTones = [], base = 0, isSecondaryDominant = false) {
    /** @type {string} */
    this.baseFunc = baseFunc;
    /** @type {number[]} */
    this.addTones = addTones;
    /** @type {number} */
    this.base = base;
    /** @type {boolean} */
    this.isSecondaryDominant = isSecondaryDominant;
  }

  toString() {
      let result = `_${this.base}${this.baseFunc}-${this.addTones
        .map((value) => value.toString())
        .join("")}`;
    result = this.isSecondaryDominant ? `(${result})` : result;
    return result;
  }
};