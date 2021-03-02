import abc from "abcjs";
import React, { useState, useEffect } from "react";
import { Grommet } from "grommet";

import RiemannFuncSelectionPanel from "../components/riemannFuncSelectionPanel";

import configFromFile from "./Score.config.json";
import RiemannFunc from "../lib/RiemannFunc";
import VoiceArrayPosition from "../lib/voiceArrayPosition";

export default function Score(props) {
  //TODO: Global variables cause side effects...
  var visualObjs;
  var voicesArray;
  var notesHighlighted = [];

  //TODO: initial should be set only once and stay read-only after being set and shouldn't be recalculated on each render
  var simultaneousNotesArray;
  var initialVoicesArray;
  useEffect(() => {
    initialVoicesArray = abc
      .renderAbc("*", props.abcString)[0]
      .makeVoicesArray();
    simultaneousNotesArray = makeSimultaneousNotesArray(initialVoicesArray);
  });

  const [abcString, setAbcString] = useState(props.abcString);
  useEffect(() => {
    renderVisualObjs();
  }, [props, abcString]);

  const [openModal, setOpenModal] = useState(undefined);

  //Methods
  const initialChordOf = (abcelem) => {
    const adjacentNotes = simultaneousNotesArray.get(
      JSON.stringify(abcelem.abselem.counters)
    );
    const lowestAdjacentNotePos = adjacentNotes[adjacentNotes.length - 1];

    return initialVoicesArray[lowestAdjacentNotePos.voice][
      lowestAdjacentNotePos.noteTotal
    ].elem.abcelem.chord;
  };

  const lowestAdjacentNoteOf = (abcelem) => {
    var adjacentNotes = simultaneousNotesArray.get(
      JSON.stringify(abcelem.abselem.counters)
    );

    const lowestAdjacentNotePos = adjacentNotes[adjacentNotes.length - 1];

    return voicesArray[lowestAdjacentNotePos.voice][
      lowestAdjacentNotePos.noteTotal
    ].elem;
  };

  const highlightAdjacentNotesOf = (abcelem, multiselect = false) => {
    if (!multiselect && notesHighlighted.length > 0) {
      notesHighlighted.forEach((el) =>
        el.unhighlight(undefined, "currentColor")
      );
      notesHighlighted = [];
    }

    const adjacentNotes = simultaneousNotesArray.get(
      JSON.stringify(abcelem.abselem.counters)
    );

    for (let adjacentNote of adjacentNotes) {
      voicesArray[adjacentNote.voice][adjacentNote.noteTotal].elem.highlight(
        undefined,
        configFromFile.selectionColor
      );
      notesHighlighted.push(
        voicesArray[adjacentNote.voice][adjacentNote.noteTotal].elem
      );
    }
  };

  const handleClick = (
    abcelem,
    _tuneNumber,
    _classes,
    _analysis,
    _drag,
    _mouseEvent
  ) => {
    highlightAdjacentNotesOf(abcelem);

    const lowestAdjacentNote = lowestAdjacentNoteOf(abcelem).abcelem;

    if (!initialChordOf(abcelem) && !abcelem.rest) {
      if (lowestAdjacentNote.chord) {
        setOpenModal({
          onClose: (riemannFunc) => {
            const chordLength = lowestAdjacentNote.chord[0].name.length;
            if (
              riemannFunc.toString() !== lowestAdjacentNote.chord[0].name
            ) {
              setAbcString(
                replace(
                  abcString,
                  `"_${riemannFunc}"`,
                  lowestAdjacentNote.startChar,
                  chordLength + 3
                )
              );
            }
            setOpenModal(undefined);
          },
          defaultValue: RiemannFunc.fromString(lowestAdjacentNote.chord[0].name),
        });
      } else {
        setOpenModal({
          onClose: (riemannFunc) => {
              setAbcString(
                insert(
                  abcString,
                  `"_${riemannFunc}"`,
                  lowestAdjacentNote.startChar
                )
              );
            setOpenModal(undefined);
          },
          defaultValue: new RiemannFunc(),
        });
      }
    }
  };

  const renderVisualObjs = () => {
    let config = configFromFile;
    config.clickListener = handleClick;
    switch (props.size) {
      case "small":
        config.staffwidth = window.innerWidth;
        break;
      case "medium":
        config.staffwidth = window.innerWidth / 1.5;
        break;
      case "large":
        config.staffwidth = window.innerWidth / 2;
        break;
      default:
        config.staffwidth = window.innerWidth / 2.5;
    }

    visualObjs = abc.renderAbc("scoreContainer", abcString, config);
    voicesArray = visualObjs[0].makeVoicesArray();
  };

  return (
    <Grommet full>
      <div id="scoreContainer" />
      {openModal && (
        <RiemannFuncSelectionPanel
          onClose={openModal.onClose}
          defaultValue={openModal.defaultValue}
        />
      )}
    </Grommet>
  );
}

//===========================================================

//Helper functions
function insert(main_string, ins_string = "", pos = 0) {
  return main_string.slice(0, pos) + ins_string + main_string.slice(pos);
}

function replace(main_string, repl_string = "", pos = 0, len = 0) {
  //workaround for chords
  if (main_string[pos] === "[") {
    pos -= len;
  }
  return main_string.slice(0, pos) + repl_string + main_string.slice(pos + len);
}

function makeSimultaneousNotesArray(voicesArray) {
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
      while (
        voicesArray[i][current[i].noteIndex] &&
        voicesArray[i][current[i].noteIndex].elem.type !== "note" &&
        voicesArray[i][current[i].noteIndex].elem.type !== "rest"
      ) {
        current[i].noteIndex++;
      }

      if (
        voicesArray[i][current[i].noteIndex] &&
        current[i].countTotal === countTotal
      ) {
        let pos = new VoiceArrayPosition(i, current[i].noteIndex);
        adjacentVoicesArrayIndices.push(pos);

        current[i].countTotal +=
          voicesArray[i][current[i].noteIndex].elem.duration;
        current[i].noteIndex++;
      }
    }

    for (let voiceArrayPosition of adjacentVoicesArrayIndices) {
      const currentNoteElem =
        voicesArray[voiceArrayPosition.voice][voiceArrayPosition.noteTotal]
          .elem;
      result.set(
        JSON.stringify(currentNoteElem.counters),
        adjacentVoicesArrayIndices
      );
    }

    countTotal = Math.min(...current.map((voice) => voice.countTotal));
  }

  return result;
}

function existsUnclassifiedNote(voicesArray, current) {
  let result = true;

  for (let i = 0; i < voicesArray.length; i++) {
    result = result && current[i].noteIndex < voicesArray[i].length;
  }

  return result;
}
