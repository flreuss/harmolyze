export const BASE_FUNC_TYPES = {
  MAIN: { name: "Hauptfunktion", points: 1 },
  PARALLEL: { name: "Nebenfunktion", points: 2 },
  VARIANT: { name: "Variante", points: 3 },
  MEDIANT: { name: "Mediante", points: 4 },
};

const BASE_FUNCS_MAJOR = {
  T: { short: "T", long: "Tonika", type: BASE_FUNC_TYPES.MAIN },
  Tp: { short: "Tp", long: "Tonikaparallele", type: BASE_FUNC_TYPES.PARALLEL },
  Tg: { short: "Tg", long: "Tonikagegenklang", type: BASE_FUNC_TYPES.PARALLEL },
  S: { short: "S", long: "Subdominante", type: BASE_FUNC_TYPES.MAIN },
  Sp: {
    short: "Sp",
    long: "Subdominantparallele",
    type: BASE_FUNC_TYPES.PARALLEL,
  },
  Sg: {
    short: "Sg",
    long: "Subdominantgegenklang",
    type: BASE_FUNC_TYPES.PARALLEL,
  },
  D: { short: "D", long: "Dominante", type: BASE_FUNC_TYPES.MAIN },
  Dp: {
    short: "Dp",
    long: "Dominantparallele",
    type: BASE_FUNC_TYPES.PARALLEL,
  },
  Dg: {
    short: "Dg",
    long: "Dominantgegenklang",
    type: BASE_FUNC_TYPES.PARALLEL,
  },
  t: { short: "t", long: "Tonikavariante", type: BASE_FUNC_TYPES.VARIANT },
  s: { short: "s", long: "Subdominantvariante", type: BASE_FUNC_TYPES.VARIANT },
  d: { short: "d", long: "Dominantvariante", type: BASE_FUNC_TYPES.VARIANT },
  tG: {
    short: "tG",
    long: "Tonikavariantgegenklang",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  tP: {
    short: "tP",
    long: "Tonikavariantparallele",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  TG: {
    short: "TG",
    long: "Tonikagegenklangvariante",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  TP: {
    short: "TP",
    long: "Tonikaparallelvariante",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  tp: {
    short: "tp",
    long: "Tonikavariantparallelvariante",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  tg: {
    short: "tg",
    long: "Tonikavariantgegenklangvariante",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  sG: {
    short: "sG",
    long: "Subdominantvariantgegenklang",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  sP: {
    short: "sP",
    long: "Subdominantvariantparallele",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  SG: {
    short: "SG",
    long: "Subdominantgegenklangvariante",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  SP: {
    short: "SP",
    long: "Subdominantparallelvariante",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  sp: {
    short: "sp",
    long: "Subdominantvariantparallelvariante",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  sg: {
    short: "sg",
    long: "Subdominantvariantgegenklangvariante",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  dG: {
    short: "dG",
    long: "Dominantvariantgegenklang",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  dP: {
    short: "dP",
    long: "Dominantvariantparallele",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  DG: {
    short: "DG",
    long: "Dominantgegenklangvariante",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  DP: {
    short: "DP",
    long: "Dominantparallelvariante",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  dp: {
    short: "dp",
    long: "Dominantvariantparallelvariante",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  dg: {
    short: "dg",
    long: "Dominantvariantgegenklangvariante",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
};

const BASE_FUNCS_MINOR = {
  t: { short: "t", long: "Tonika", type: BASE_FUNC_TYPES.MAIN },
  tP: { short: "tP", long: "Tonikaparallele", type: BASE_FUNC_TYPES.PARALLEL },
  tG: { short: "tG", long: "Tonikagegenklang", type: BASE_FUNC_TYPES.PARALLEL },
  s: { short: "s", long: "Subdominante", type: BASE_FUNC_TYPES.MAIN },
  sP: {
    short: "sP",
    long: "Subdominantparallele",
    type: BASE_FUNC_TYPES.PARALLEL,
  },
  sG: {
    short: "sG",
    long: "Subdominantgegenklang",
    type: BASE_FUNC_TYPES.PARALLEL,
  },
  D: { short: "D", long: "Dominante", type: BASE_FUNC_TYPES.MAIN },
  Dp: {
    short: "Dp",
    long: "Dominantparallele",
    type: BASE_FUNC_TYPES.PARALLEL,
  },
  Dg: {
    short: "Dg",
    long: "Dominantgegenklang",
    type: BASE_FUNC_TYPES.PARALLEL,
  },
  T: { short: "T", long: "Tonikavariante", type: BASE_FUNC_TYPES.VARIANT },
  S: { short: "S", long: "Subdominantvariante", type: BASE_FUNC_TYPES.VARIANT },
  d: { short: "d", long: "Dominantvariante", type: BASE_FUNC_TYPES.VARIANT },
  Tg: {
    short: "Tg",
    long: "Tonikavariantgegenklang",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  Tp: {
    short: "Tp",
    long: "Tonikavariantparallele",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  tg: {
    short: "tg",
    long: "Tonikagegenklangvariante",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  tp: {
    short: "tp",
    long: "Tonikaparallelvariante",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  TP: {
    short: "TP",
    long: "Tonikavariantparallelvariante",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  TG: {
    short: "TG",
    long: "Tonikavariantgegenklangvariante",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  Sg: {
    short: "Sg",
    long: "Subdominantvariantgegenklang",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  Sp: {
    short: "Sp",
    long: "Subdominantvariantparallele",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  sg: {
    short: "sg",
    long: "Subdominantgegenklangvariante",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  sp: {
    short: "sp",
    long: "Subdominantparallelvariante",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  SP: {
    short: "SP",
    long: "Subdominantvariantparallelvariante",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  SG: {
    short: "SG",
    long: "Subdominantvariantgegenklangvariante",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  dG: {
    short: "dG",
    long: "Dominantvariantgegenklang",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  dP: {
    short: "dP",
    long: "Dominantvariantparallele",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  DG: {
    short: "DG",
    long: "Dominantgegenklangvariante",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  DP: {
    short: "DP",
    long: "Dominantparallelvariante",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  dp: {
    short: "dp",
    long: "Dominantvariantparallelvariante",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
  dg: {
    short: "dg",
    long: "Dominantvariantgegenklangvariante",
    type: BASE_FUNC_TYPES.MEDIANT,
  },
};

export default class RiemannFunc {
  /**
   *
   * @param {string} baseFunc Basic Riemannian Function
   * @param {number[]} addTones Additional harmonic tones
   * @param {number} base Which note is in the base?
   * @param {boolean} isSecondaryDominant Is the Function a secondary dominant?
   * @param {boolean} incomplete Is the fundamental tone of the function included or not?
   * @param {string} mode Is the tune written in a major or minor key?
   */
  constructor(
    mode = "major",
    baseFunc,
    addTones = [],
    base = 1,
    isSecondaryDominant = false,
    incomplete = false
  ) {
    this.validBaseFuncs = ["m", "min", "minor"].includes(mode)
      ? BASE_FUNCS_MINOR
      : BASE_FUNCS_MAJOR;

    this.baseFunc = this.validBaseFuncs[baseFunc];
    this.base = base;
    this.isSecondaryDominant = isSecondaryDominant;
    this.incomplete = incomplete;
    this.mode = mode;

    if (addTones.every((tone) => [3, 5, 8].includes(tone))) {
      this.addTones = [];
    } else {
      this.addTones = addTones;
    }
  }

  static validAddTones(alterations) {
    let result = [
      { value: 2, label: "2" },
      { value: 4, label: "4" },
      { value: 5, label: "5" },
      { value: 6, label: "6" },
      { value: 7, label: "7" },
      { value: 9, label: "9" },
    ];
    if (alterations) {
      const alteratedAddTones = [
        { value: 4.5, label: "5♭" },
        { value: 5.5, label: "6♭" },
        { value: 6.5, label: "6♯" },
        { value: 8.5, label: "9♭" },
      ];
      result = result.concat(alteratedAddTones);
      result = result.sort((obj1, obj2) => obj1.value - obj2.value);
    }
    return result;
  }
  static validBaseNotes = [...Array(8).keys()].slice(1);

  /**
   * @returns {string} a string representation of the riemannian function in Riemann Font Notation
   */
  toString() {
    const baseString = this.base > 1 ? `_${this.base}` : "";
    const addTonesString =
      !Array.isArray(this.addTones) || !this.addTones.length
        ? ""
        : `-${this.addTones
            .map(
              (val) =>
                RiemannFunc.validAddTones(true).find((obj) => obj.value === val)
                  .label[0]
            )
            .join("")}${
            this.addTones.some((addTone) => !Number.isInteger(addTone))
              ? "-"
              : ""
          }${this.addTones
            .map((val, index, array) => {
              if (!Number.isInteger(val)) {
                return RiemannFunc.validAddTones(true)
                  .find((obj) => obj.value === val)
                  .label.slice(-1) === "♯"
                  ? "<"
                  : ">";
              } else {
                return index < array.length - 1 &&
                  !Number.isInteger(array[index + 1])
                  ? "."
                  : "";
              }
            })
            .join("")}`;
    const incompleteString = this.incomplete ? "/" : "";
    let result = `${baseString}${incompleteString}${this.baseFunc.short}${addTonesString}`;
    result = this.isSecondaryDominant ? `(${result})` : result;
    return result;
  }

  getPoints() {
    let baseDifficultyBonus = 0;
    if (this.base === 3) {
      baseDifficultyBonus = 1;
    } else if (this.base !== 1) {
      baseDifficultyBonus = 2;
    }

    return (
      this.baseFunc.type.points +
      this.addTones.reduce(
        (prev, current) => prev + +!Number.isInteger(current) + 1,
        0
      ) +
      +this.isSecondaryDominant +
      +this.incomplete +
      baseDifficultyBonus
    );
  }

  /**
   *
   * @param {string} riemannString a string representation of a riemannian function in Riemann Font Notation
   */
  static fromString(mode, riemannString) {
    const matchBaseFunc = /\(?(?:_\d)?\/?(\w+)(?:\-\d?\d?)?\)?/.exec(
      riemannString
    );
    const baseFunc = matchBaseFunc !== null ? matchBaseFunc.pop() : undefined;

    const matchaddTones = /\(?(?:_\d)?\/?(?:\w+)\-(\d)(\d?)\)?/.exec(
      riemannString
    );
    const matchAlterations =
      /\(?(?:_\d)?\/?(?:\w+)(?:\-\d\d?)\-([<>.])([<>]?)\)?/.exec(riemannString);

    const addTones =
      matchaddTones !== null
        ? matchaddTones
            .slice(1)
            .filter((val) => val !== "")
            .map((val, index) => {
              if (
                !matchAlterations ||
                matchAlterations.slice(1)[index] === "" ||
                matchAlterations.slice(1)[index] === "."
              ) {
                return parseInt(val);
              } else {
                return matchAlterations.slice(1)[index] === "<"
                  ? parseInt(val) + 0.5
                  : parseInt(val) - 0.5;
              }
            })
        : undefined;

    const matchBase = /\(?_(\d)\/?(?:\w+)(?:\-\d?\d?)?\)?/.exec(riemannString);
    const base = matchBase !== null ? parseInt(matchBase.pop()) : undefined;

    const isSecondaryDominant = /\((.+)\)/.exec(riemannString) !== null;

    const incomplete = riemannString.includes("/");

    return new RiemannFunc(
      mode,
      baseFunc,
      addTones,
      base,
      isSecondaryDominant,
      incomplete
    );
  }
}

export class CondensedFunc extends RiemannFunc {
  /**
   * @param {boolean} given Is the function initially given?
   * */
  constructor(
    mode = "major",
    baseFunc,
    addTones = [],
    base = 1,
    isSecondaryDominant = false,
    incomplete = false,
    given = false
  ) {
    super(mode, baseFunc, addTones, base, isSecondaryDominant, incomplete);
    this.given = given;
  }

  toString() {
    return this.given ? super.toString() : `{${super.toString()}}`;
  }

  static fromString(mode, riemannString) {
    const riemannFunc = RiemannFunc.fromString(mode, riemannString);
    riemannFunc.given = /\{(.+)\}/.exec(riemannString) === null;
    return riemannFunc;
  }
}
