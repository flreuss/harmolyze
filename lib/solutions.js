import { renderAbc } from "abcjs";
import { NotesVoicesArray } from "./abcjsUtils";
import { CondensedFunc } from "./riemannFunc";

/**
 * removes all annotations below the lines, that are included in curly brackets
 * @param {string} abcString
 * @returns {string}
 */
export function getInitial(abcString) {
  //Workaround, because \n is coming from the database already escaped (\\n)
  return abcString.replace(/"_{[^\s]+}"/g, "").replace(/\\n/g, "\n");
}

/**
 * removes curly brackets from all annotations below the lines
 * @param {string} abcString
 * @returns {string}
 */
export function getSolution(abcString) {
  //Workaround, because \n is coming from the database already escaped (\\n)
  return abcString.replace(/"_{([^\s}]+)}"/gm, `"_$1"`).replace(/\\n/g, "\n");
}

/**
 *
 * @param {string} abc tune in abcnotation
 * @returns points that can be achieved by solving this abc tune
 */
export function calculatePoints(abc) {
  const visualObjs = renderAbc("*", abc);
  const voicesArray = new NotesVoicesArray(visualObjs[0]);
  const keySignature = visualObjs[0].getKeySignature();

  let points = 0;
  voicesArray.forEachElem((elem) => {
    if (elem.abcelem.chord) {
      points += Math.min(
        elem.abcelem.chord.map((chord) => {
          const condensedFunc = CondensedFunc.fromString(
            keySignature.mode,
            chord.name
          );
          return condensedFunc.given ? 0 : condensedFunc.getPoints();
        })
      );
    }
  });

  // Multipliziere mit Bonus für erschwerende Faktoren
  //	Wie viele Vorzeichen hat der Tune?
  points *= 1 + 0.2 * keySignature.accidentals.length;
  // Steht der Tune in Dur oder Moll?
  // Moll ist 1.3, weil bei einem Drittel der Grundfunktionen Töne auftreten, die nicht leitereigen sind
  points *= ["m", "min", "minor"].includes(keySignature.mode) ? 1.3 : 1;

  // 	Wie viele verschiedene Stimmen hat der Tune?
  points *= 1 + 0.1 * (voicesArray.length - 1);

  return Math.round(points / 5) * 5;
}
