export class NotesVoicesArray {
  #self;

  constructor(visualObj) {
    this.#self = visualObj.makeVoicesArray().map((voice) => {
      return voice.filter((val) => val.elem && val.elem.type === "note");
    });
    this.length = this.#self.length;
  }

  getElem(notesVoicesArrayPosition) {
    const voicesArrayEntry = this.#self[notesVoicesArrayPosition.voice][
      notesVoicesArrayPosition.noteTotal
    ];
    return voicesArrayEntry ? voicesArrayEntry.elem : undefined;
  }

  getVoice(voiceIndex) {
    return this.#self[voiceIndex];
  }

  forEachElem(func) {
    this.#self.forEach((voice, voiceIndex) => {
      voice.forEach((note, noteIndex) => {
        func(note.elem, new NotesVoicesArrayPosition(voiceIndex, noteIndex));
      });
    });
  }
}

export class SimultaneousNotesArray {
  #self;

  constructor(voicesArray) {
    let countTotal = 0;
    let result = new Map();

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

      countTotal = Math.min(...current.map((voice) => voice.countTotal));
    }

    this.#self = result;
  }

  get(counters) {
    return this.#self.get(JSON.stringify(counters));
  }
}

export function addClasses(elem, classArray) {
  const last = elem.elemset.length - 1;
  elem.elemset[last].classList.add(...classArray);
  if (elem.abcelem.chord) {
    elem.children[elem.children.length - 1].graphelem.classList.add(
      ...classArray
    );
  }
}

export function hasClass(elem, classString) {
  const last = elem.elemset.length - 1;
  return elem.elemset[last].classList.contains(classString);
}

//simultaneousNotesArray kann übergeben werden, um Rechnerei zu ersparen
export function adjacentElemsOf(
  elem,
  voicesArray,
  simultaneousNotesArray = new SimultaneousNotesArray(voicesArray)
) {
  const adjacent = simultaneousNotesArray.get(elem.counters);
  return adjacent.map((pos) => voicesArray.getElem(pos));
}

//simultaneousNotesArray kann übergeben werden, um Rechnerei zu ersparen
export function chordOf(
  elem,
  voicesArray,
  simultaneousNotesArray
) {
  const adjacentElems = simultaneousNotesArray
    ? adjacentElemsOf(elem, voicesArray, simultaneousNotesArray)
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
