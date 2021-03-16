export class NotesVoicesArray {
  #self;

  constructor(visualObj) {
    this.#self = visualObj.makeVoicesArray().map((voice) => {
      return voice.filter((val) => val.elem.type === "note");
    });
    this.length = this.#self.length;
  }

  getElem(notesVoicesArrayPosition) {
    return this.#self[notesVoicesArrayPosition.voice][
      notesVoicesArrayPosition.noteTotal
    ].elem;
  }

  getVoice(voiceIndex) {
    return this.#self[voiceIndex];
  }

  foreachElem(func) {
    this.#self.forEach((voice, voiceIndex) => {
      voice.forEach((note, noteIndex) => {
        func(note.elem, new NotesVoicesArrayPosition(voiceIndex, noteIndex));
      });
    });
  }
}

export function makeSimultaneousNotesArray(voicesArray) {
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

  return result;
}

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
}

function existsUnclassifiedNote(voicesArray, current) {
  for (let i = 0; i < voicesArray.length; i++) {
    if (current[i].noteIndex < voicesArray.getVoice(i).length) return true;
  }
  return false;
}
