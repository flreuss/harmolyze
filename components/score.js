import { renderAbc, synth } from "abcjs";
import React, { useState, useEffect, useLayoutEffect } from "react";
import { Box, Button, Text } from "grommet";

import SelectionDialog from "./riemannFunc/selectionDialog";
import configFromFile from "./score.config.json";
import RiemannFunc from "../lib/riemannFunc";
import {
  addClasses,
  hasClass,
  NotesVoicesArray,
  SimultaneousNotesArray,
  adjacentElemsOf,
  chordOf,
  unhighlight,
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
  //TODO: Memoized (useMemo), muss nur bei resize neu berechnet werden
  var simultaneousNotesArray;
  var notesHighlighted = [];
  var synthControl;

  //State
  const size = useWindowSize();
  const [alreadySolved, setAlreadySolved] = useState([]);
  const [openSelectionDialog, setOpenSelectionDialog] = useState(undefined);

  const [abcString, setAbcString] = useState(initialAbcString);
  useEffect(() => {
    renderVisualObjs();
  }, [initialAbcString, solutionAbcString, abcString]);
  useLayoutEffect(() => {
    renderVisualObjs();
  }, [size, device]);

  //Methods
  function findMistakes(solutionAbcString) {
    //TODO: Check why this render call is necessary...
    renderVisualObjs();
    const solutionVoicesArray = new NotesVoicesArray(
      renderAbc("*", solutionAbcString)[0]
    );

    const initialVoicesArray = new NotesVoicesArray(
      renderAbc("*", initialAbcString)[0]
    );

    let mistakes = 0;
    let total = 0;
    voicesArray.forEachElem((elem, pos) => {
      const filledInChord = elem.abcelem.chord;
      const solutionChord = solutionVoicesArray.getElem(pos).abcelem.chord;

      if (
        solutionChord &&
        !chordOf(elem, initialVoicesArray, simultaneousNotesArray)
      ) {
        total += 1;
        const solutionChords = solutionChord[0].name.split("\n");

        if (!filledInChord || !solutionChords.includes(filledInChord[0].name)) {
          mistakes += 1;
          adjacentElemsOf(elem, voicesArray, simultaneousNotesArray).forEach(
            (elem) => {
              addClasses(elem, ["abcjs-mistake"]);
            }
          );
        } else if (!hasClass(elem, "abcjs-solved")) {
          setAlreadySolved((alreadySolvedPos) =>
            alreadySolvedPos.concat(simultaneousNotesArray.get(elem.counters))
          );
          adjacentElemsOf(elem, voicesArray, simultaneousNotesArray).forEach(
            (elem) => {
              addClasses(elem, ["abcjs-solved", "abcjs-disabled"]);
            }
          );
        }
      }
    });

    onValidate(mistakes, (total - mistakes) / total);
    console.log(alreadySolved);
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
        unhighlight(notesHighlighted);
      }
    } else {
      unhighlight(notesHighlighted);
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
    if (!abcelem.rest && !hasClass(abcelem.abselem, "abcjs-disabled")) {
      const adjacentElems = adjacentElemsOf(
        abcelem.abselem,
        voicesArray,
        simultaneousNotesArray
      );
      const lowestAdjacentNote =
        adjacentElems[adjacentElems.length - 1].abcelem;

      unhighlight(notesHighlighted);
      adjacentElems.forEach((elem) => {
        elem.highlight(undefined, configFromFile.selectionColor);
        notesHighlighted.push(elem);
      });
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
    console.log("Rendering VisualObjs...");
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
    simultaneousNotesArray = new SimultaneousNotesArray(voicesArray);

    const solutionVoicesArray = new NotesVoicesArray(
      renderAbc("*", solutionAbcString)[0]
    );
    const initialVoicesArray = new NotesVoicesArray(
      renderAbc("*", initialAbcString)[0]
    );

    voicesArray.forEachElem((elem, pos) => {
      if (
        !chordOf(elem, solutionVoicesArray, simultaneousNotesArray) ||
        chordOf(elem, initialVoicesArray, simultaneousNotesArray)
      ) {
        addClasses(elem, ["abcjs-given", "abcjs-disabled"]);
      } else if (alreadySolved.some((solvedPos) => solvedPos.equals(pos))) {
        addClasses(elem, ["abcjs-solved", "abcjs-disabled"]);
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
