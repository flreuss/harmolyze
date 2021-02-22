import abc from 'abcjs';
import React from 'react';

import Score from "./Score";
import VoiceArrayPosition from "./VoiceArrayPosition";

function Notation(props) {
  const initialVisualObjs = abc.renderAbc(
    "*",
    props.initialAbcString
  );
  const voicesArray = initialVisualObjs[0].makeVoicesArray();

  const initial = {
    visualObjs: initialVisualObjs,
    voicesArray: voicesArray,
    simultaneousNotesArray: makeSimultaneousNotesArray(voicesArray),
  };

  return <Score {
    ...props
  }
  initial = {
    initial
  }
  />
}

//Helper functions
function makeSimultaneousNotesArray(voicesArray) {
  let countTotal = 0;
  let result = new Map();

  let current = Array.from({
    length: voicesArray.length
  }, (_) => ({
    "noteIndex": 0,
    "countTotal": 0
  }));

  while (existsUnclassifiedNote(voicesArray, current)) {

    let adjacentVoicesArrayIndices = [];

    for (let i = 0; i < voicesArray.length; i++) {
      while (voicesArray[i][current[i].noteIndex] && voicesArray[i][current[i].noteIndex].elem.type !== 'note' && voicesArray[i][current[i].noteIndex].elem.type !== 'rest') {
        current[i].noteIndex++;
      }
      console.log(voicesArray[i][current[i].noteIndex] && current[i].countTotal === countTotal);
      if (voicesArray[i][current[i].noteIndex] && current[i].countTotal === countTotal) {
        let pos = new VoiceArrayPosition(i, current[i].noteIndex);
        adjacentVoicesArrayIndices.push(pos);

        current[i].countTotal += voicesArray[i][current[i].noteIndex].elem.duration;
        current[i].noteIndex++;
      }
    }

    for (let voiceArrayPosition of adjacentVoicesArrayIndices) {
      const currentNoteElem = voicesArray[voiceArrayPosition.voice][voiceArrayPosition.noteTotal].elem;
      result.set(JSON.stringify(currentNoteElem.counters), adjacentVoicesArrayIndices);
    }

    countTotal = Math.min(...current.map((voice) => voice.countTotal));
  }

  return result;
}

function existsUnclassifiedNote(voicesArray, current) {
  let result = true;

  for (let i = 0; i < voicesArray.length; i++) {
    result = result && (current[i].noteIndex < voicesArray[i].length);
  }

  return result;
}

export default Notation;