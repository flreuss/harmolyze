import abc from 'abcjs';
import React, {
  Component
} from 'react';

import config from "./config.json";

function NotationWrapper(props){
  const initialVisualObjs = abc.renderAbc(
    "*",
    props.initialAbcString,
    config
  );
  const initial = {
    visualObjs: initialVisualObjs,
    voicesArray: initialVisualObjs[0].makeVoicesArray(),
  };

  return <Notation {...props} initial={initial}/>
}

class Notation extends Component {
  constructor(props) {
    super(props);

    this.renderVisualObjs = this.renderVisualObjs.bind(this);
    this.config = config;
    this.config.clickListener = this.handleClick.bind(this);
    this.notesHighlighted = [];
    this.visualObjs = this.props.initial.visualObjs;
    this.voicesArray = this.props.initial.voicesArray;
    this.simultaneousNotes = this.analyseSimultaneousNotes();

    this.state = {
      abcString: this.props.initialAbcString,
    }
  }

  componentDidMount() {
    this.renderVisualObjs();
  }

  componentDidUpdate() {
    this.renderVisualObjs();
  }

  analyseSimultaneousNotes() {
    const voicesArray = this.voicesArray;

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
          adjacentVoicesArrayIndices.push({
            voice: i,
            noteTotal: current[i].noteIndex
          });

          current[i].countTotal += voicesArray[i][current[i].noteIndex].elem.duration;
          current[i].noteIndex++;
        }
      }

      for (let voiceArrayIndex of adjacentVoicesArrayIndices) {
        const currentNoteElem = voicesArray[voiceArrayIndex.voice][voiceArrayIndex.noteTotal].elem;
        result.set(JSON.stringify(currentNoteElem.counters), adjacentVoicesArrayIndices);
      }

      countTotal = Math.min(...current.map((voice) => voice.countTotal));
    }

    return result;
  }

  lowestAdjacentNote(abcelem) {
    const voicesArray = this.voicesArray;
    const adjacentNotes = this.simultaneousNotes.get(JSON.stringify(abcelem.abselem.counters));

    const lowestAdjacentNote = adjacentNotes[adjacentNotes.length - 1];
    return voicesArray[lowestAdjacentNote.voice][lowestAdjacentNote.noteTotal].elem.abcelem;
  }

  highlightAdjacentNotesOf(abcelem) {
    let notesHighlighted = [];
    const voicesArray = this.voicesArray;
    const adjacentNotes = this.simultaneousNotes.get(JSON.stringify(abcelem.abselem.counters));

    for (let adjacentNote of adjacentNotes) {
      voicesArray[adjacentNote.voice][adjacentNote.noteTotal].elem.highlight(undefined, "rgb(33,150,243)");
      notesHighlighted.push(voicesArray[adjacentNote.voice][adjacentNote.noteTotal].elem);
    }

    this.notesHighlighted = notesHighlighted;
  }

  handleClick(abcelem, tuneNumber, classes, analysis, drag, mouseEvent) {
    if (this.notesHighlighted) {
      this.notesHighlighted.forEach((el) => el.unhighlight(undefined, "rgb(0,0,0)"))
    };
    this.notesHighlighted = [];

    //TODO: #1 fix problem with timing when highlighting and entering chord that occurs in Chrome
    var lowestAdjacentNote = this.lowestAdjacentNote(abcelem);
    this.highlightAdjacentNotesOf(abcelem);

    if (lowestAdjacentNote.chord) {
      //TODO: #5 Edit chord, that's already existing. But only, if it wasn't already given as part of the initial abc string.
    } else if (!abcelem.rest) {
      var riemannFunc = prompt("Bitte Funktion angeben:", "D7");
      if (riemannFunc) {
        this.setState({
          abcString: insert(this.state.abcString, `"_${riemannFunc}"`, lowestAdjacentNote.startChar)
        });
      }
    }
  }

  renderVisualObjs() {
    this.visualObjs = abc.renderAbc(
      this.props.el || this.el,
      this.state.abcString,
      this.config
    );

    this.voicesArray = this.visualObjs[0].makeVoicesArray();
  }

  render() {
    return ( <
      div ref = {
        (input) => {
          this.el = input;
        }
      }
      />
    );
  }
}

//Helper functions
function insert(main_string, ins_string, pos) {
  if (typeof (pos) == "undefined") {
    pos = 0;
  }
  if (typeof (ins_string) == "undefined") {
    ins_string = '';
  }
  return main_string.slice(0, pos) + ins_string + main_string.slice(pos);
}

function existsUnclassifiedNote(voicesArray, current) {
  let result = true;

  for (let i = 0; i < voicesArray.length; i++) {
    result = result && (current[i].noteIndex < voicesArray[i].length);
  }

  return result;
}

export default NotationWrapper;