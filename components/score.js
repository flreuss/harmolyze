import { renderAbc, synth } from "abcjs";
import React, { useState, useEffect, useLayoutEffect } from "react";
import { Box, Button, Text } from "grommet";

import SelectionDialog from "./riemannFunc/selectionDialog";
import configFromFile from "./score.config.json";
import RiemannFunc from "../lib/riemannFunc";
import {
  makeSimultaneousNotesArray,
  makeNotesVoicesArray,
} from "../lib/abcjsExtension";
import { insert, replace } from "../lib/stringUtils";
import CursorControl from "../lib/cursorControl";
import useWindowSize from "../lib/useWindowSize";

export default function Score({
  initialAbcString,
  solutionAbcString,
  device,
  onValidate,
}) {
  //Attributes
  const ref = React.useRef();

  //Global
  var visualObjs;
  var voicesArray;
  var simultaneousNotesArray;
  var notesHighlighted = [];
  var synthControl;

  //State
  const size = useWindowSize();
  const [abcString, setAbcString] = useState(initialAbcString);
  useEffect(() => {
    renderVisualObjs();
  }, [initialAbcString, solutionAbcString, abcString]);
  useLayoutEffect(() => {
    renderVisualObjs();
  }, [size, device]);
  const [openSelectionDialog, setOpenSelectionDialog] = useState(undefined);

  //Methods
  function findMistakes(voicesArray, solutionAbcString) {
    renderVisualObjs();

    const solutionVoicesArray = makeNotesVoicesArray(
      renderAbc("*", solutionAbcString)[0]
    );

    let mistakes = 0;
    voicesArray.forEach((voice, voiceIndex) => {
      voice.forEach((note, noteIndex) => {
        const filledInChord = note.elem.abcelem.chord;
        const solutionChord =
          solutionVoicesArray[voiceIndex][noteIndex].elem.abcelem.chord;

        if (
          note.elem.type === "note" &&
          solutionChord &&
          !lowestAdjacentElemOf(
            note.elem.abcelem,
            makeNotesVoicesArray(renderAbc("*", initialAbcString)[0])
          ).abcelem.chord
        ) {
          const solutionChords = solutionChord[0].name.split("\n");

          let selectionColor = "rgb(0,200,0)";
          if (
            !filledInChord ||
            !solutionChords.includes(filledInChord[0].name)
          ) {
            selectionColor = "rgb(200,0,0)";
            mistakes += 1;
          }

          highlightAdjacentNotesOf(note.elem.abcelem, selectionColor, true);
        }
      });
    });

    onValidate(mistakes);
  }

  function adjacentElemsOf(abcelem, voicesArray) {
    const adjacent = simultaneousNotesArray.get(
      JSON.stringify(abcelem.abselem.counters)
    );
    return adjacent.map((pos) => voicesArray[pos.voice][pos.noteTotal].elem);
  }

  function lowestAdjacentElemOf(abcelem, voicesArray) {
    const adjacentElems = adjacentElemsOf(abcelem, voicesArray);
    return adjacentElems[adjacentElems.length - 1];
  }

  function unhighlightAllNotes() {
    notesHighlighted.forEach((el) => el.unhighlight(undefined, "currentColor"));
    notesHighlighted = [];
  }

  function highlightAdjacentNotesOf(
    abcelem,
    selectionColor,
    multiselect = false
  ) {
    if (!multiselect) {
      unhighlightAllNotes();
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

  //Event handlers
  function handleSelectionDialogClose(abcelem, riemannFunc) {
    if (riemannFunc) {
      if (synthControl) synthControl.pause();

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
      } else {
        unhighlightAllNotes();
      }
    } else {
      unhighlightAllNotes();
    }
    setOpenSelectionDialog(undefined);
  }

  function handleClick(
    abcelem,
    _tuneNumber,
    _classes,
    _analysis,
    _drag,
    _mouseEvent
  ) {
    const lowestAdjacentNote = lowestAdjacentElemOf(
      abcelem,
      makeNotesVoicesArray(visualObjs[0])
    ).abcelem;

    if (
      lowestAdjacentElemOf(
        abcelem,
        makeNotesVoicesArray(renderAbc("*", initialAbcString)[0])
      ).abcelem.chord ||
      !lowestAdjacentElemOf(
        abcelem,
        makeNotesVoicesArray(renderAbc("*", solutionAbcString)[0])
      ).abcelem.chord
    ) {
      highlightAdjacentNotesOf(
        abcelem,
        getComputedStyle(document.querySelector(".abcjs-given")).fill
      );
    } else if (!abcelem.rest) {
      highlightAdjacentNotesOf(abcelem, configFromFile.selectionColor);
      setOpenSelectionDialog({
        onClose: (riemannFunc) =>
          handleSelectionDialogClose(lowestAdjacentNote, riemannFunc),
        defaultValue: lowestAdjacentNote.chord
          ? RiemannFunc.fromString(lowestAdjacentNote.chord[0].name)
          : new RiemannFunc(),
        mode: visualObjs[0].getKeySignature().mode,
      });
    }
  }

  //Rendering
  function renderVisualObjs() {
    let config = configFromFile;
    config.clickListener = handleClick;
    switch (device) {
      case "small":
        config.staffwidth = size.width;
        break;
      case "medium":
        config.staffwidth = size.width / 1.5;
        break;
      case "large":
        config.staffwidth = size.width / 2;
        break;
      default:
        config.staffwidth = size.width / 2.5;
    }

    visualObjs = renderAbc("scoreContainer", abcString, config);
    voicesArray = makeNotesVoicesArray(visualObjs[0]);
    simultaneousNotesArray = makeSimultaneousNotesArray(voicesArray);

    const solutionVoicesArray = makeNotesVoicesArray(
      renderAbc("*", solutionAbcString)[0]
    );
    const initialVoicesArray = makeNotesVoicesArray(
      renderAbc("*", initialAbcString)[0]
    );

    for (let voice of voicesArray) {
      for (let note of voice) {
        if (
          !lowestAdjacentElemOf(note.elem.abcelem, solutionVoicesArray).abcelem
            .chord ||
          lowestAdjacentElemOf(note.elem.abcelem, initialVoicesArray).abcelem
            .chord
        ) {
          const last = note.elem.elemset.length - 1;
          note.elem.elemset[last].classList.add("abcjs-given");
          if (note.elem.abcelem.chord) {
            note.elem.children[
              note.elem.children.length - 1
            ].graphelem.classList.add("abcjs-given");
          }
        }
      }
    }

    loadAudio(visualObjs);
  }

  function loadAudio(visualObjs) {
    if (synth.supportsAudio()) {
      synthControl = new synth.SynthController();
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

    const activeAudioContext = synth.activeAudioContext();
    const audioContext =
      activeAudioContext && activeAudioContext.state !== "closed"
        ? activeAudioContext
        : new AudioContext();
    let midiBuffer = new synth.CreateSynth();
    midiBuffer
      .init({
        visualObj,
        audioContext,
      })
      .then((response) => {
        console.log(response);
        if (synthControl) {
          synthControl
            .setTune(visualObj, false, { audioContext })
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
      <Button
        pad="medium"
        type="submit"
        label={
          <Text color="white">
            <strong>Überprüfen</strong>
          </Text>
        }
        onClick={() => {
          if (synthControl) synthControl.pause();
          findMistakes(voicesArray, solutionAbcString);
        }}
        primary
      />
      {openSelectionDialog && (
        <SelectionDialog
          onClose={openSelectionDialog.onClose}
          defaultValue={openSelectionDialog.defaultValue}
          mode={openSelectionDialog.mode}
          target={ref.current}
        />
      )}
    </Box>
  );
}
