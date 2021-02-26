import abc from "abcjs";
import React, { Component } from "react";

import config from "./Score.config.json";
import RiemannFunc from "../lib/RiemannFunc";
import VoiceArrayPosition from "../lib/voiceArrayPosition";

class Score extends Component {
  constructor(props) {
    super(props);

    if (typeof window !== "undefined") {
      this.renderVisualObjs = this.renderVisualObjs.bind(this);
      this.config = config;
      this.config.clickListener = this.handleClick.bind(this);
      this.notesHighlighted = [];

      //TODO: #21 staffwidth Änderung soll auch bei resize passieren
      switch (props.size) {
        case "small":
          this.config.staffwidth = window.innerWidth;
          break;
        case "medium":
          this.config.staffwidth = window.innerWidth / 1.5;
          break;
        case "large":
          this.config.staffwidth = window.innerWidth / 2;
          break;
        default:
          this.config.staffwidth = window.innerWidth / 2.5;
      }

      //TODO: Muss in Bezug auf den viewport gerendert werden, damit die line counters stimmen (wrapping) -> useEffect mit Überprüfung ob resizehook callt
      const initialVisualObjs = abc.renderAbc(
        "*",
        props.abcString,
        this.config
      );
      const voicesArray = initialVisualObjs[0].makeVoicesArray();

      this.initial = {
        abcString: props.abcString,
        visualObjs: initialVisualObjs,
        voicesArray: voicesArray,
        simultaneousNotesArray: makeSimultaneousNotesArray(voicesArray),
      };

      this.state = {
        abcString: this.initial.abcString,
      };
    }
  }

  componentDidMount() {
    this.renderVisualObjs();
  }

  componentDidUpdate() {
    this.renderVisualObjs();
  }

  lowestAdjacentNote(abcelem) {
    const adjacentNotes = this.initial.simultaneousNotesArray.get(
      JSON.stringify(abcelem.abselem.counters)
    );
    const lowestAdjacentNote = adjacentNotes[adjacentNotes.length - 1];

    return lowestAdjacentNote;
  }

  highlightAdjacentNotesOf(abcelem) {
    let notesHighlighted = [];
    const voicesArray = this.voicesArray;
    const adjacentNotes = this.initial.simultaneousNotesArray.get(
      JSON.stringify(abcelem.abselem.counters)
    );

    for (let adjacentNote of adjacentNotes) {
      voicesArray[adjacentNote.voice][adjacentNote.noteTotal].elem.highlight(
        undefined,
        this.config.selectionColor
      );
      notesHighlighted.push(
        voicesArray[adjacentNote.voice][adjacentNote.noteTotal].elem
      );
    }

    this.notesHighlighted = notesHighlighted;
  }

  handleClick(abcelem, _tuneNumber, _classes, _analysis, _drag, _mouseEvent) {
    if (this.notesHighlighted) {
      this.notesHighlighted.forEach((el) => el.unhighlight(undefined, "currentColor"));
    }
    this.notesHighlighted = [];

    this.highlightAdjacentNotesOf(abcelem);

    const lowestAdjacentNotePos = this.lowestAdjacentNote(abcelem);
    const lowestAdjacentNote = this.voicesArray[lowestAdjacentNotePos.voice][
      lowestAdjacentNotePos.noteTotal
    ].elem.abcelem;
    const initialLowestAdjacentNote = this.initial.voicesArray[
      lowestAdjacentNotePos.voice
    ][lowestAdjacentNotePos.noteTotal].elem.abcelem;

    if (!initialLowestAdjacentNote.chord && !abcelem.rest) {
      if (lowestAdjacentNote.chord) {
        this.props
          .openDialog(lowestAdjacentNote.chord[0].name)
          .then((riemannFunc) => {
            const chordLength = lowestAdjacentNote.chord[0].name.length;
            if (
              riemannFunc &&
              riemannFunc !== lowestAdjacentNote.chord[0].name
            ) {
              this.setState({
                abcString: replace(
                  this.state.abcString,
                  `"_${riemannFunc}"`,
                  lowestAdjacentNote.startChar,
                  chordLength + 3
                ),
              });
            }
          });
      } else {
        this.props.openDialog().then((riemannFunc) => {
          if (riemannFunc) {
            this.setState({
              abcString: insert(
                this.state.abcString,
                `"_${riemannFunc}"`,
                lowestAdjacentNote.startChar
              ),
            });
          }
        });
      }
    }
  }

  renderVisualObjs() {
    if (typeof window !== "undefined") {
      this.visualObjs = abc.renderAbc(
        this.props.el || this.el,
        this.state.abcString,
        this.config
      );

      this.voicesArray = this.visualObjs[0].makeVoicesArray();
    }
  }

  render() {
    return (
      <div
        ref={(input) => {
          this.el = input;
        }}
      />
    );
  }
}

//Helper functions
function insert(main_string, ins_string, pos) {
  if (typeof pos == "undefined") {
    pos = 0;
  }
  if (typeof ins_string == "undefined") {
    ins_string = "";
  }
  return main_string.slice(0, pos) + ins_string + main_string.slice(pos);
}

function replace(main_string, repl_string, pos, len) {
  if (typeof len == "undefined") {
    len = 0;
  }
  if (typeof pos == "undefined") {
    pos = 0;
  }
  if (typeof repl_string == "undefined") {
    repl_string = "";
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

export default Score;
