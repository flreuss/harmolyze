import { renderAbc, synth } from "abcjs";
import React, { useState, useEffect, useLayoutEffect } from "react";
import { Box, Button, Grid, Text } from "grommet";
import SelectionDialog from "./riemannFunc/selectionDialog";
import configFromFile from "./interactiveScore.config.json";
import RiemannFunc, { CondensedFunc } from "../lib/riemannFunc";
import {
  addClasses,
  hasClass,
  NotesVoicesArray,
  SimultaneousNotesMap,
  adjacentElemsOf,
  chordOf,
  unhighlight,
} from "../lib/abcjsUtils";
import { replace } from "../lib/stringUtils";
import CursorControl from "../lib/cursorControl";
import useWindowSize from "../lib/useWindowSize";
import { getSolutionFuncs } from "../lib/solutions";

export default function InteractiveScore({
  abc,
  initial,
  solution,
  solved,
  almostSolved,
  showMistakes,
  device,
  onChange,
  showSolution,
}) {
  //Global
  var visualObjs;
  var voicesArray;
  //TODO: Memoized (useMemo), muss nur bei resize neu berechnet werden
  var simultaneousNotesMap;
  var notesHighlighted = [];
  var synthControl;
  var solutionFuncs;

  //State
  const windowSize = useWindowSize();
  const [openSelectionDialog, setOpenSelectionDialog] = useState(undefined);

  useEffect(() => {
    renderVisualObjs();
    return () => {
      if (synthControl) synthControl.pause();
      const ctx = synth.activeAudioContext();
      //TODO: Flush content of the AudioContext after suspension (then...)
      if (ctx.state !== "closed") ctx.suspend().then(() => {});
    };
  }, [abc, solved]);
  useLayoutEffect(() => {
    renderVisualObjs();
  }, [windowSize, device]);

  //Event handlers
  function validate(elem) {
    if (!showSolution) {
      const solutionVoicesArray = new NotesVoicesArray(
        renderAbc("*", solution)[0]
      );
      const initialVoicesArray = new NotesVoicesArray(
        renderAbc("*", initial)[0]
      );

      const filledInChord = elem.abcelem.chord;
      const solutionPossibilities = chordOf(
        elem,
        solutionVoicesArray,
        simultaneousNotesMap
      );

      let abcjsClass = "mistake";

      if (
        solutionPossibilities &&
        !chordOf(elem, initialVoicesArray, simultaneousNotesMap)
      ) {
        const solutionChords = solutionPossibilities[0].name.split("\n");

        if (solutionChords.includes(filledInChord)) {
          abcjsClass = "abcjs-solved";
        } else if (
          solutionChords.some(
            (solutionChord) =>
              RiemannFunc.fromString(
                visualObjs[0].getKeySignature().mode,
                solutionChord
              ).baseFunc.short ===
              RiemannFunc.fromString(
                visualObjs[0].getKeySignature().mode,
                filledInChord
              ).baseFunc.short
          )
        ) {
          abcjsClass = "abcjs-almostSolved";
        } else {
          abcjsClass = "abcjs-mistake";
        }
      }

      return [simultaneousNotesMap.get(elem.counters), abcjsClass];
    }
  }

  function handleSelectionDialogClose(abcelem, riemannFuncArray) {
    const oldChordStringLength = abcelem.chord
      ? abcelem.chord[0].name.split("\n").reduce((acc, current) => {
          return acc + current.length + 3;
        }, 0)
      : 0;
    const newChordString = riemannFuncArray.reduce(
      (acc, current) => (current ? acc.concat(`"_${current}"`) : ""),
      ""
    );

    if (
      newChordString.length === 0 ||
      !abcelem.chord ||
      riemannFuncArray[0].toString() !== abcelem.chord[0].name
    ) {
      let newAbcElem = abcelem;
      newAbcElem.abselem.abcelem.chord =
        newChordString.length === 0 ? "" : riemannFuncArray[0].toString();
      onChange(
        replace(abc, newChordString, abcelem.startChar, oldChordStringLength),
        validate(newAbcElem.abselem),
        solutionFuncs.length
      );
    }

    unhighlight(notesHighlighted);
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
        simultaneousNotesMap
      );
      const lowestAdjacentNote =
        adjacentElems[adjacentElems.length - 1].abcelem;

      unhighlight(notesHighlighted);
      adjacentElems.forEach((elem) => {
        elem.highlight(undefined, configFromFile.selectionColor);
        notesHighlighted.push(elem);
      });
      setOpenSelectionDialog({
        onClose: (riemannFuncArray) =>
          handleSelectionDialogClose(lowestAdjacentNote, riemannFuncArray),
        edit: showSolution ? visualObjs[0].getKeySignature().mode : undefined,
        selectionWheelDisabled: hasClass(abcelem.abselem, "abcjs-almostSolved"),
        solutionFuncs,
        defaultValues: lowestAdjacentNote.chord
          ? showSolution
            ? lowestAdjacentNote.chord[0].name
                .split("\n")
                .map((name) =>
                  CondensedFunc.fromString(
                    visualObjs[0].getKeySignature().mode,
                    name
                  )
                )
            : lowestAdjacentNote.chord[0].name
                .split("\n")
                .map((name) =>
                  RiemannFunc.fromString(
                    visualObjs[0].getKeySignature().mode,
                    name
                  )
                )
          : showSolution
          ? []
          : [new RiemannFunc(visualObjs[0].getKeySignature().mode)],
      });
    }
  }

  //Rendering
  function renderVisualObjs() {
    let zoomFactor;
    switch (device) {
      case "medium":
        zoomFactor = 1.5;
        break;
      case "large":
        zoomFactor = 2;
        break;
      default:
        zoomFactor = 1;
    }
    const config = {
      ...configFromFile,
      clickListener: handleClick,
      staffwidth: windowSize.width / zoomFactor,
    };

    try {
      if (document.getElementById("scoreContainer")) {
        console.log("Rendering VisualObjs...");
        visualObjs = renderAbc("scoreContainer", abc, config);
        voicesArray = new NotesVoicesArray(visualObjs[0]);
        simultaneousNotesMap = new SimultaneousNotesMap(voicesArray);

        if (solution && initial) {
          const solutionVoicesArray = new NotesVoicesArray(
            renderAbc("*", solution)[0]
          );
          const initialVoicesArray = new NotesVoicesArray(
            renderAbc("*", initial)[0]
          );

          voicesArray.forEachElem((elem, pos) => {
            if (
              !chordOf(elem, solutionVoicesArray, simultaneousNotesMap) ||
              chordOf(elem, initialVoicesArray, simultaneousNotesMap)
            ) {
              addClasses(elem, ["abcjs-given", "abcjs-disabled"]);
            } else if (solved.some((solvedPos) => pos.equals(solvedPos))) {
              addClasses(elem, ["abcjs-solved", "abcjs-disabled"]);
            } else if (
              almostSolved.some((almostSolvedPos) =>
                pos.equals(almostSolvedPos)
              )
            ) {
              addClasses(elem, ["abcjs-almostSolved"]);
            } else if (
              showMistakes &&
              chordOf(elem, voicesArray, simultaneousNotesMap)
            ) {
              elem.highlight(undefined, "#ff4040");
              notesHighlighted.push(elem);
            }
          });

          //TODO: Muss nur einmal gerechnet werden
          solutionFuncs = [];

          solutionVoicesArray.forEachElem((elem) => {
            if (
              elem.abcelem.chord &&
              !chordOf(elem, initialVoicesArray, simultaneousNotesMap)
            ) {
              //TODO: Wähle aus den Chord den leichtesten aus und füge den zum Array hinzu
              elem.abcelem.chord.forEach((chord) =>
                solutionFuncs.push(
                  RiemannFunc.fromString(
                    visualObjs[0].getKeySignature().mode,
                    chord.name
                  )
                )
              );
            }
          });
        }

        if (document.getElementById("audioContainer")) {
          loadAudio(visualObjs);
        }
      }
    } catch (err) {
      //TODO: Notify user of error via notification
      console.error(err);
    }
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
          displayWarp: device === "large",
        }
      );
    } else {
      document.querySelector("#audioContainer").innerHTML =
        "<div class='audio-error'>Audio is not supported in this browser.</div>";
    }

    synthControl.disable(true);
    const visualObj = visualObjs[0];

    let midiBuffer = new synth.CreateSynth();
    midiBuffer
      .init({
        visualObj,
      })
      .then((response) => {
        console.log(response);
        if (synthControl) {
          synthControl
            .setTune(visualObj, false)
            .then(() => {
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
    <Grid
      fill
      align="center"
      justify="center"
      gap="none"
      rows={["auto", "auto"]}
    >
      <Box id="scoreContainer" />
      <Box
        fill="horizontal"
        align="center"
        alignSelf="start"
        pad={{ bottom: "small", horizontal: "large" }}
      >
        <Box fill="horizontal" id="audioContainer" />
      </Box>
      {openSelectionDialog && (
        <SelectionDialog
          windowSize={windowSize}
          device={device}
          onClose={openSelectionDialog.onClose}
          defaultValues={openSelectionDialog.defaultValues}
          edit={openSelectionDialog.edit}
          selectionWheelDisabled={openSelectionDialog.selectionWheelDisabled}
          target={document.querySelector("main")}
          baseFuncTypes={
            openSelectionDialog.solutionFuncs
              ? openSelectionDialog.solutionFuncs.map(
                  (func) => func.baseFunc.type
                )
              : undefined
          }
        />
      )}
    </Grid>
  );
}
