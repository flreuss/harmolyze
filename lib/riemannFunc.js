export default class RiemannFunc {
  /**
   *
   * @param {string} baseFunc Basic Riemannian Function
   * @param {number[]} addTones Additional harmonic tones
   * @param {number} base Which note is in the base?
   * @param {boolean} isSecondaryDominant Is the Function a secondary deominant?
   * @param {boolean} missingFundamental Is the fundamental tone of the function included or not?
   */
  constructor(
    baseFunc,
    addTones = [],
    base = 0,
    isSecondaryDominant = false,
    missingFundamental = false
  ) {
    this.baseFunc = baseFunc;
    this.addTones = addTones;
    this.base = base;
    this.isSecondaryDominant = isSecondaryDominant;
    this.missingFundamental = missingFundamental;
  }

  static validAddTones = [...Array(10).keys()].slice(1);
  static validBaseNotes = [...Array(9).keys()];

  static validBaseFuncs = [
    "T",
    "Tp",
    "Tg",
    "S",
    "Sp",
    "Sg",
    "D",
    "Dp",
    "Dg",
    "t",
    "tG",
    "tP",
    "s",
    "sG",
    "sP",
    "d",
    "dP",
    "dG",
  ];

  /**
   * @returns {string} a string representation of the riemannian function in Riemann Font Notation
   */
  toString() {
    const baseString = this.base > 0 ? `_${this.base}` : "";
    const addTonesString =
      !Array.isArray(this.addTones) || !this.addTones.length
        ? ""
        : `-${this.addTones.map((value) => value.toString()).join("")}`;
    const missingFundamentalString = this.missingFundamental ? "/" : "";
    let result = `${baseString}${missingFundamentalString}${this.baseFunc}${addTonesString}`;
    result = this.isSecondaryDominant ? `(${result})` : result;
    return result;
  }

  /**
   *
   * @param {string} riemannString a string representation of a riemannian function in Riemann Font Notation
   */
  static fromString(riemannString) {
    const matchBaseFunc = /\(?(?:_\d)?\/?(\w+)(?:\-\d?\d?)?\)?/.exec(
      riemannString
    );
    const baseFunc = matchBaseFunc !== null ? matchBaseFunc.pop() : undefined;

    const matchaddTones = /\(?(?:_\d)?\/?(?:\w+)\-(\d)(\d?)\)?/.exec(
      riemannString
    );
    const addTones =
      matchaddTones !== null
        ? matchaddTones
            .slice(1)
            .filter((val) => val !== "")
            .map((val) => parseInt(val))
        : undefined;

    const matchBase = /\(?_(\d)\/?(?:\w+)(?:\-\d?\d?)?\)?/.exec(riemannString);
    const base = matchBase !== null ? parseInt(matchBase.pop()) : undefined;

    const isSecondaryDominant = /\((.+)\)/.exec(riemannString) !== null;

    const missingFundamental = riemannString.includes("/");

    return new RiemannFunc(baseFunc, addTones, base, isSecondaryDominant, missingFundamental);
  }
}
