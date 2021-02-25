export default class RiemannFunc {
  /**
   * 
   * @param {string} baseFunc Basic Riemannian Function
   * @param {number[]} addTones Additional harmonic tones
   * @param {number} base Which note is in the base?
   * @param {boolean} isSecondaryDominant Is the Function a secondary deominant?
   */
  constructor(baseFunc, addTones = [], base = 0, isSecondaryDominant = false) {
    this.baseFunc = baseFunc;
    this.addTones = addTones;
    this.base = base;
    this.isSecondaryDominant = isSecondaryDominant;
  }

  /**
   * @returns {string} a string representation of the riemannian function in Riemann Font Notation
   */
  toString() {
    let base = this.base === 0 ? '' : this.base.toString();
      let result = `_${base}${this.baseFunc}-${this.addTones
        .map((value) => value.toString())
        .join("")}`;
    result = this.isSecondaryDominant ? `(${result})` : result;
    return result;
  }
};