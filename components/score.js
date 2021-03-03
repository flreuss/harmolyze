import abc from "abcjs";
import React, { useState, useEffect } from "react";
import { Box, Button, Text } from "grommet";

import RiemannFuncSelectionDialog from "./riemannFuncSelectionDialog";
import Notification from "../components/notification";

import configFromFile from "./score.config.json";
import RiemannFunc from "../lib/riemannFunc";
import VoiceArrayPosition from "../lib/voiceArrayPosition";

export default function Score({ initialAbcString, solution, size }) {
  const ref = React.useRef();

  //TODO: Global variables cause side effects...
  var voicesArray;
  var simultaneousNotesArray;
  var notesHighlighted = [];

  //TODO: initial should be set only once and stay read-only after being set and shouldn't be recalculated on each render
  var initialVoicesArray;
  useEffect(() => {
    initialVoicesArray = abc
      .renderAbc("*", initialAbcString)[0]
      .makeVoicesArray();
  });

  const [abcString, setAbcString] = useState(initialAbcString);
  useEffect(() => {
    renderVisualObjs();
  }, [initialAbcString, size, solution, abcString]);

  const [openModalDialog, setOpenModalDialog] = useState(undefined);
  const [openNotification, setOpenNotification] = useState(undefined);

  //Methods
  /**
   *
   * @param {string} abcString
   * @param {string} solutionAbcString
   */
  const validateSolution = (abcString, solutionAbcString) => {
    alert(abcString === solutionAbcString);
    return abcString === solutionAbcString;
  };

  /**
   *
   * @returns {string}
   */
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

    if (initialChordOf(abcelem)) {
      setOpenNotification(true);
    } else if (!abcelem.rest) {
      if (lowestAdjacentNote.chord) {
        setOpenModalDialog({
          onClose: (riemannFunc) => {
            const chordLength = lowestAdjacentNote.chord[0].name.length;
            if (riemannFunc.toString() !== lowestAdjacentNote.chord[0].name) {
              setAbcString(
                replace(
                  abcString,
                  `"_${riemannFunc}"`,
                  lowestAdjacentNote.startChar,
                  chordLength + 3
                )
              );
            }
            setOpenModalDialog(undefined);
          },
          defaultValue: RiemannFunc.fromString(
            lowestAdjacentNote.chord[0].name
          ),
        });
      } else {
        setOpenModalDialog({
          onClose: (riemannFunc) => {
            setAbcString(
              insert(
                abcString,
                `"_${riemannFunc}"`,
                lowestAdjacentNote.startChar
              )
            );
            setOpenModalDialog(undefined);
          },
          defaultValue: new RiemannFunc(),
        });
      }
    }
  };

  const renderVisualObjs = () => {
    let config = configFromFile;
    config.clickListener = handleClick;
    //TODO: #32 Problem: config.staffwidth wird an den Breakpoints des ResizeContext auf window.innerWidth gesetzt. Verhindert stufenloses resizen am PC
    switch (size) {
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

    const visualObjs = abc.renderAbc("scoreContainer", abcString, config);
    voicesArray = visualObjs[0].makeVoicesArray();
    simultaneousNotesArray = makeSimultaneousNotesArray(voicesArray);
  };

  return (
    <Box fill align="center" justify="center" ref={ref}>
      <div id="scoreContainer" />
      {openModalDialog && (
        <RiemannFuncSelectionDialog
          onClose={openModalDialog.onClose}
          defaultValue={openModalDialog.defaultValue}
          target={ref.current}
        />
      )}
      {openNotification && (
        <Notification
          onClose={() => setOpenNotification(undefined)}
          text="Diese Funktion ist Teil der vorgegebenen Lösung."
          timeout={3000}
        />
      )}
      <Button
        type="submit"
        label={
          <Text color="white">
            <strong>Überprüfen</strong>
          </Text>
        }
        onClick={() => validateSolution(abcString, solution)}
        primary
      />
    </Box>
  );
}

//===========================================================

//Helper functions
function insert(mainString, insString = "", pos = 0) {
  while (mainString[pos] === " ") {
    pos += 1;
  }
  return mainString.slice(0, pos) + insString + mainString.slice(pos);
}

function replace(mainString, replString = "", pos = 0, len = 0) {
  //workaround for chords
  if (mainString[pos] === "[") {
    pos -= len;
  }
  return mainString.slice(0, pos) + replString + mainString.slice(pos + len);
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
