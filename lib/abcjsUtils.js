export class NotesVoicesArray extends Array {
  constructor(visualObj) {
    const filteredVoicesArray = visualObj.makeVoicesArray().map((voice) => {
      return voice.filter((val) => val.elem && val.elem.type === "note");
    });
    super(...filteredVoicesArray);
  }

  getElem(notesVoicesArrayPosition) {
    const voicesArrayEntry = this[notesVoicesArrayPosition.voice][
      notesVoicesArrayPosition.noteTotal
    ];
    return voicesArrayEntry ? voicesArrayEntry.elem : undefined;
  }

  getVoice(voiceIndex) {
    return this[voiceIndex];
  }

  forEachElem(func) {
    this.forEach((voice, voiceIndex) => {
      voice.forEach((note, noteIndex) => {
        func(note.elem, new NotesVoicesArrayPosition(voiceIndex, noteIndex));
      });
    });
  }
}

export class SimultaneousNotesMap extends Map {
  constructor(voicesArray) {
    let countTotal = 0;
    let result = super();

    let current = Array.from(
      {
        length: voicesArray.length,
      },
      (_) => ({
        noteIndex: 0,
        countTotal: 0,
      })
    );

    while (existsUnclassifiedNote(voicesArray, current)) {
      let adjacentVoicesArrayIndices = [];

      for (let i = 0; i < voicesArray.length; i++) {
        if (
          voicesArray.getElem(
            new NotesVoicesArrayPosition(i, current[i].noteIndex)
          ) &&
          current[i].countTotal === countTotal
        ) {
          let pos = new NotesVoicesArrayPosition(i, current[i].noteIndex);
          adjacentVoicesArrayIndices.push(pos);

          current[i].countTotal += voicesArray.getElem(
            new NotesVoicesArrayPosition(i, current[i].noteIndex)
          ).duration;
          current[i].noteIndex++;
        }
      }

      for (let voiceArrayPosition of adjacentVoicesArrayIndices) {
        const currentNoteElem = voicesArray.getElem(voiceArrayPosition);
        result.set(
          JSON.stringify(currentNoteElem.counters),
          adjacentVoicesArrayIndices
        );
      }

      const minCountTotal = Math.min(
        ...current.map((voice) => voice.countTotal)
      );
      //Workaround, if one voice finishes earlier than another (i. e. in broken abc strings)
      countTotal =
        minCountTotal <= countTotal ? countTotal + 1 / 64 : minCountTotal;
    }
  }

  get(counters) {
    return super.get(JSON.stringify(counters));
  }
}

export function addClasses(elem, classArray) {
  const last = elem.elemset.length - 1;
  elem.elemset[last].classList.add(...classArray);
  elem.children.forEach((child) => {
    if (child.graphelem) {
      child.graphelem.classList.add(...classArray);
    }
  });
}

export function hasClass(elem, classString) {
  const last = elem.elemset.length - 1;
  return elem.elemset[last].classList.contains(classString);
}

//simultaneousNotesMap kann übergeben werden, um Rechnerei zu ersparen
export function adjacentElemsOf(
  elem,
  voicesArray,
  simultaneousNotesMap = new SimultaneousNotesMap(voicesArray)
) {
  const adjacent = simultaneousNotesMap.get(elem.counters);
  return adjacent.map((pos) => voicesArray.getElem(pos));
}

//simultaneousNotesMap kann übergeben werden, um Rechnerei zu ersparen
export function chordOf(elem, voicesArray, simultaneousNotesMap) {
  const adjacentElems = simultaneousNotesMap
    ? adjacentElemsOf(elem, voicesArray, simultaneousNotesMap)
    : adjacentElemsOf(elem, voicesArray);
  return adjacentElems[adjacentElems.length - 1].abcelem.chord;
}

export function unhighlight(elemsArray) {
  elemsArray.forEach((el) => el.unhighlight(undefined, "currentColor"));
}

//Not exported
class NotesVoicesArrayPosition {
  /**
   * UID for the position of a note in a NotesVoicesArray
   * @param {number} voice
   * @param {number} noteTotal
   */
  constructor(voice, noteTotal) {
    this.voice = voice;
    this.noteTotal = noteTotal;
  }

  equals(pos) {
    return this.voice === pos.voice && this.noteTotal === pos.noteTotal;
  }
}

function existsUnclassifiedNote(voicesArray, current) {
  for (let i = 0; i < voicesArray.length; i++) {
    if (current[i].noteIndex < voicesArray.getVoice(i).length) return true;
  }
  return false;
}
