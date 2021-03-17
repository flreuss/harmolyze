import { renderAbc, synth } from "abcjs";
import React, { useState, useEffect, useLayoutEffect } from "react";
import { Box, Button, Text } from "grommet";

import SelectionDialog from "./riemannFunc/selectionDialog";
import configFromFile from "./score.config.json";
import RiemannFunc from "../lib/riemannFunc";
import {
  makeSimultaneousNotesArray,
  NotesVoicesArray,
} from "../lib/abcjsUtils";
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
  //TODO: Memoized (useMemo)
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
  function findMistakes(solutionAbcString) {
    renderVisualObjs();

    const solutionVoicesArray = new NotesVoicesArray(
      renderAbc("*", solutionAbcString)[0]
    );

    let mistakes = 0;
    let total = 0;
    voicesArray.forEachElem((elem, pos) => {
      const filledInChord = elem.abcelem.chord;
      const solutionChord = solutionVoicesArray.getElem(pos).abcelem.chord;

      if (
        solutionChord &&
        !lowestAdjacentElemOf(
          elem.abcelem,
          new NotesVoicesArray(renderAbc("*", initialAbcString)[0])
        ).abcelem.chord
      ) {
        total += 1;
        const solutionChords = solutionChord[0].name.split("\n");

        let selectionColor = "rgb(0,200,0)";
        if (!filledInChord || !solutionChords.includes(filledInChord[0].name)) {
          selectionColor = "rgb(200,0,0)";
          mistakes += 1;
        }

        highlightAdjacentNotesOf(elem.abcelem, selectionColor, true);
      }
    });

    onValidate(mistakes, (total - mistakes) / total);
  }

  function adjacentElemsOf(abcelem, voicesArray) {
    const adjacent = simultaneousNotesArray.get(
      JSON.stringify(abcelem.abselem.counters)
    );
    return adjacent.map((pos) => voicesArray.getElem(pos));
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

    const adjacentElems = adjacentElemsOf(abcelem, voicesArray);

    for (let elem of adjacentElems) {
      elem.highlight(undefined, selectionColor);
      notesHighlighted.push(elem);
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
      new NotesVoicesArray(visualObjs[0])
    ).abcelem;

    if (
      lowestAdjacentElemOf(
        abcelem,
        new NotesVoicesArray(renderAbc("*", initialAbcString)[0])
      ).abcelem.chord ||
      !lowestAdjacentElemOf(
        abcelem,
        new NotesVoicesArray(renderAbc("*", solutionAbcString)[0])
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
          ? RiemannFunc.fromString(
              lowestAdjacentNote.chord[0].name,
              visualObjs[0].getKeySignature().mode
            )
          : new RiemannFunc(),
        mode: visualObjs[0].getKeySignature().mode,
      });
    }
  }

  //Rendering
  function renderVisualObjs() {
    console.log("Rendering VisualObjs...")
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
    voicesArray = new NotesVoicesArray(visualObjs[0]);
    simultaneousNotesArray = makeSimultaneousNotesArray(voicesArray);

    const solutionVoicesArray = new NotesVoicesArray(
      renderAbc("*", solutionAbcString)[0]
    );
    const initialVoicesArray = new NotesVoicesArray(
      renderAbc("*", initialAbcString)[0]
    );

    voicesArray.forEachElem((elem) => {
      if (
        !lowestAdjacentElemOf(elem.abcelem, solutionVoicesArray).abcelem
          .chord ||
        lowestAdjacentElemOf(elem.abcelem, initialVoicesArray).abcelem.chord
      ) {
        const last = elem.elemset.length - 1;
        elem.elemset[last].classList.add("abcjs-given");
        if (elem.abcelem.chord) {
          elem.children[elem.children.length - 1].graphelem.classList.add(
            "abcjs-given"
          );
        }
      }
    });

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
      <Box id="scoreContainer" />
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
        margin="medium"
        label={
          <Text color="white">
            <strong>Überprüfen</strong>
          </Text>
        }
        onClick={() => {
          if (synthControl) synthControl.pause();
          findMistakes(solutionAbcString);
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
