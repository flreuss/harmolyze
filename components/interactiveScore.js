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

export default function InteractiveScore({
  abc,
  initial,
  solution,
  solved,
  showMistakes,
  device,
  onValidate,
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

  //State
  const windowSize = useWindowSize();
  const [openSelectionDialog, setOpenSelectionDialog] = useState(undefined);

  useEffect(() => {
    renderVisualObjs();
    return () => {
      if (synthControl) synthControl.pause();
      const ctx = synth.activeAudioContext();
      if (ctx.state !== "closed") ctx.close();
    };
  }, [abc, solved]);
  useLayoutEffect(() => {
    renderVisualObjs();
  }, [windowSize, device]);

  //Event handlers
  function handleValidate() {
    //TODO: Check why this render call is necessary...
    renderVisualObjs();
    const solutionVoicesArray = new NotesVoicesArray(
      renderAbc("*", solution)[0]
    );

    const initialVoicesArray = new NotesVoicesArray(renderAbc("*", initial)[0]);

    let mistakes = 0;
    let solvedCount = 0;
    let solvedArray = [];
    voicesArray.forEachElem((elem, pos) => {
      const filledInChord = elem.abcelem.chord;
      const solutionChord = solutionVoicesArray.getElem(pos).abcelem.chord;

      if (
        solutionChord &&
        !chordOf(elem, initialVoicesArray, simultaneousNotesMap)
      ) {
        const solutionChords = solutionChord[0].name.split("\n");

        if (!filledInChord || !solutionChords.includes(filledInChord[0].name)) {
          mistakes += 1;
          adjacentElemsOf(elem, voicesArray, simultaneousNotesMap).forEach(
            (elem) => {
              addClasses(elem, ["abcjs-mistake"]);
            }
          );
        } else {
          solvedCount += 1;
          if (!hasClass(elem, "abcjs-solved")) {
            solvedArray = solvedArray.concat(
              simultaneousNotesMap.get(elem.counters)
            );
          }
        }
      }
    });

    onValidate(mistakes, solvedCount, solvedArray);
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

    onChange(
      replace(abc, newChordString, abcelem.startChar, oldChordStringLength)
    );
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
    let config = configFromFile;
    config.clickListener = handleClick;
    switch (device) {
      case "small":
        config.staffwidth = windowSize.width;
        break;
      case "medium":
        config.staffwidth = windowSize.width / 1.5;
        break;
      case "large":
        config.staffwidth = windowSize.width / 2;
        break;
      default:
        config.staffwidth = windowSize.width / 2.5;
    }

    try {
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
          } else if (showMistakes) {
            elem.highlight(undefined, "red");
            notesHighlighted.push(elem);
          }
        });
      }

      loadAudio(visualObjs);
    } catch (err) {
      document.querySelector(
        "main"
      ).innerHTML = `<Box align="center"><Text>Diese .musicxml-Datei ist fehlerhaft und kann nicht dargestellt werden. Bitte reparieren Sie die zugehörige .musicxml-Datei.</Text></Box>`;
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

    const audioContext = new AudioContext();
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
    <Grid
      fill
      align="center"
      justify="center"
      gap="none"
      rows={["auto", "auto"]}
    >
      <Box id="scoreContainer" />
      <Box
        direction="column"
        fill="horizontal"
        gap="medium"
        align="center"
        alignSelf="start"
        pad={{ bottom: "small", horizontal: "large" }}
      >
        <Box fill="horizontal" id="audioContainer" />
        {onValidate && (
          <Button
            pad="medium"
            type="submit"
            label={
              <Text color="white">
                <strong>Überprüfen</strong>
              </Text>
            }
            fill={false}
            onClick={handleValidate}
            primary
          />
        )}
      </Box>
      {openSelectionDialog && (
        <SelectionDialog
          windowSize={windowSize}
          device={device}
          onClose={openSelectionDialog.onClose}
          defaultValues={openSelectionDialog.defaultValues}
          edit={openSelectionDialog.edit}
          target={document.querySelector("main")}
        />
      )}
    </Grid>
  );
}
