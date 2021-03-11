import abc from "abcjs";
import React, { useState, useEffect } from "react";
import { Box, Button, Text } from "grommet";

import SelectionDialog from "./riemannFunc/selectionDialog";
import Notification from "../components/notification";

import configFromFile from "./score.config.json";
import RiemannFunc from "../lib/riemannFunc";
import VoiceArrayPosition from "../lib/voiceArrayPosition";
import CursorControl from "../lib/cursorControl";

export default function Score({ initialAbcString, solutionAbcString, size }) {
  //Attributes
  const ref = React.useRef();

  //Global
  var visualObjs;
  var voicesArray;
  var simultaneousNotesArray;
  var notesHighlighted = [];
  var synthControl;

  //State
  const [abcString, setAbcString] = useState(initialAbcString);
  useEffect(() => {
    renderVisualObjs();
  }, [initialAbcString, size, solutionAbcString, abcString]);

  const [openModalDialog, setOpenModalDialog] = useState(undefined);
  const [openNotification, setOpenNotification] = useState(undefined);

  //Methods
  function validateSolution() {
    renderVisualObjs();

    const solutionVoicesArray = abc
      .renderAbc("*", solutionAbcString)[0]
      .makeVoicesArray();

    let success = true;
    voicesArray.forEach((voice, voiceIndex) => {
      voice.forEach((note, noteIndex) => {
        const filledInChord = note.elem.abcelem.chord;
        const solutionChord = solutionVoicesArray[voiceIndex][noteIndex].elem.abcelem.chord;

        if (note.elem.type === "note" &&
          solutionChord &&
          !chordOf(note.elem.abcelem, abc.renderAbc("*", initialAbcString))) {
          const solutionChords = solutionChord[0].name.split("\n");

          let selectionColor = "rgb(0,200,0)";
          if (!filledInChord ||
            !solutionChords.includes(filledInChord[0].name)) {
            selectionColor = "rgb(200,0,0)";
            success = false;
          }

          highlightAdjacentNotesOf(note.elem.abcelem, selectionColor, true);
        }
      });
    });

    if (success)
      alert("Geschafft!");
  }

  /**
   *
   * @returns {string} chord of the element corresponding to abcelem in visualObjs
   */
  function chordOf(abcelem, visualObjs) {
    const adjacentNotes = simultaneousNotesArray.get(
      JSON.stringify(abcelem.abselem.counters)
    );
    const lowestAdjacentNotePos = adjacentNotes[adjacentNotes.length - 1];

    const compareToVoicesArray = visualObjs[0].makeVoicesArray();

    return compareToVoicesArray[lowestAdjacentNotePos.voice][lowestAdjacentNotePos.noteTotal].elem.abcelem.chord;
  }

  function lowestAdjacentNoteOf(abcelem) {
    var adjacentNotes = simultaneousNotesArray.get(
      JSON.stringify(abcelem.abselem.counters)
    );

    const lowestAdjacentNotePos = adjacentNotes[adjacentNotes.length - 1];

    return voicesArray[lowestAdjacentNotePos.voice][lowestAdjacentNotePos.noteTotal].elem;
  }

  function unHighlightAllNotes() {
    if (notesHighlighted.length > 0) {
      notesHighlighted.forEach((el) => el.unhighlight(undefined, "currentColor")
      );
      notesHighlighted = [];
    }
  }

  function highlightAdjacentNotesOf(abcelem,
    selectionColor,
    multiselect = false) {
    if (!multiselect) {
      unHighlightAllNotes();
    }

    const adjacentNotes = simultaneousNotesArray.get(
      JSON.stringify(abcelem.abselem.counters)
    );

    for (let adjacentNote of adjacentNotes) {
      voicesArray[adjacentNote.voice][adjacentNote.noteTotal].elem.highlight(
        undefined,
        selectionColor
      );
      notesHighlighted.push(
        voicesArray[adjacentNote.voice][adjacentNote.noteTotal].elem
      );
    }
  }

  function handleOpenModalDialogClose(abcelem, riemannFunc) {
    if (riemannFunc) {
      if (!abcelem.chord) {
        setAbcString(insert(abcString, `"_${riemannFunc}"`, abcelem.startChar));
      } else if (riemannFunc.toString() !== abcelem.chord[0].name) {
        setAbcString(
          replace(
            abcString,
            `"_${riemannFunc}"`,
            abcelem.startChar,
            abcelem.chord[0].name.length + 3
          )
        );
      }
    }
    setOpenModalDialog(undefined);
  }

  function handleClick(abcelem,
    _tuneNumber,
    _classes,
    _analysis,
    _drag,
    _mouseEvent) {
    const lowestAdjacentNote = lowestAdjacentNoteOf(abcelem).abcelem;

    if (chordOf(abcelem, abc.renderAbc("*", initialAbcString)) ||
      !chordOf(abcelem, abc.renderAbc("*", solutionAbcString))) {
      highlightAdjacentNotesOf(
        abcelem,
        getComputedStyle(document.querySelector(".abcjs-given")).fill
      );
    } else if (!abcelem.rest) {
      highlightAdjacentNotesOf(abcelem, configFromFile.selectionColor);
      setOpenModalDialog({
        onClose: (riemannFunc) => handleOpenModalDialogClose(lowestAdjacentNote, riemannFunc),
        defaultValue: lowestAdjacentNote.chord
          ? RiemannFunc.fromString(lowestAdjacentNote.chord[0].name)
          : new RiemannFunc(),
        mode: visualObjs[0].getKeySignature().mode,
      });
    }
  }

  function renderVisualObjs() {
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

    visualObjs = abc.renderAbc("scoreContainer", abcString, config);
    voicesArray = visualObjs[0].makeVoicesArray();
    simultaneousNotesArray = makeSimultaneousNotesArray(voicesArray);

    const solutionVisualObjs = abc.renderAbc("*", solutionAbcString);
    const initialVisualObjs = abc.renderAbc("*", initialAbcString);

    for (let voice of voicesArray) {
      for (let note of voice) {
        if (note.elem.type === "note" &&
          (!chordOf(note.elem.abcelem, solutionVisualObjs) ||
            chordOf(note.elem.abcelem, initialVisualObjs))) {
          note.elem.elemset[note.elem.elemset.length - 1].classList.add(
            "abcjs-given"
          );
          if (note.elem.abcelem.chord) {
            note.elem.children[note.elem.children.length - 1].graphelem.classList.add("abcjs-given");
          }
        }
      }
    }

    loadAudio(visualObjs);
  }

  function loadAudio(visualObjs) {
    if (abc.synth.supportsAudio()) {
      synthControl = new abc.synth.SynthController();
      synthControl.load(
        "#audioContainer",
        new CursorControl("#scoreContainer"),
        {
          displayRestart: true,
          displayPlay: true,
          displayProgress: true,
          displayWarp: true,
        }
      );
    } else {
      document.querySelector("#audioContainer").innerHTML =
        "<div class='audio-error'>Audio is not supported in this browser.</div>";
    }

    synthControl.disable(true);
    const visualObj = visualObjs[0];

    let midiBuffer = new abc.synth.CreateSynth();
    midiBuffer
      .init({
        visualObj,
      })
      .then((response) => {
        console.log(response);
        if (synthControl) {
          synthControl
            .setTune(visualObj, false)
            .then((response) => {
              console.log("Audio successfully loaded.");
            })
            .catch((error) => {
              console.warn("Audio problem:", error);
            });
        }
      })
      .catch((error) => {
        console.warn("Audio problem:", error);
      });
  }

  return (
    <Box fill align="center" justify="center" gap="none" ref={ref}>
      <div id="scoreContainer" />
      <Box
        pad={{
          horizontal: "large",
          top: "none",
          bottom: "medium",
        }}
        fill="horizontal"
        id="audioContainer"
      />
      {openModalDialog && (
        <SelectionDialog
          onClose={openModalDialog.onClose}
          defaultValue={openModalDialog.defaultValue}
          mode={openModalDialog.mode}
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
        pad="medium"
        type="submit"
        label={
          <Text color="white">
            <strong>Überprüfen</strong>
          </Text>
        }
        onClick={() => validateSolution(voicesArray, solutionAbcString)}
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
  while (mainString[pos] === " ") {
    pos += 1;
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
