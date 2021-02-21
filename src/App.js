//TODO: Documentation
//TODO: Write Unit tests

import abc from 'abcjs';
import React, {
  Component
} from 'react';
import ReactDOM from 'react-dom'

//TODO: Preprocess abcfiles to Tunebook & Routing for different files
//Turn into tunebook
import data from './data';

import logo from './logo.svg';
import './App.css';
import './App.scss';

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

function simultaneousNotes(abcString) {
  const visualObjs = abc.renderAbc("*", abcString);
  const voicesArray = visualObjs[0].makeVoicesArray();

  let countTotal = 0;
  let result = new Map();

  let current = Array.from({
    length: voicesArray.length
  }, (_) => ({
    "noteIndex": 0,
    "countTotal": 0
  }));
  //Array(voicesArray.length).fill({"noteIndex": 0, "countTotal": 0});
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

    //Adjazenzmatrix bilden!
    for (let voiceArrayIndex of adjacentVoicesArrayIndices) {
      //remove note itself
      result.set(JSON.stringify(voicesArray[voiceArrayIndex.voice][voiceArrayIndex.noteTotal].elem.counters), adjacentVoicesArrayIndices);
    }

    countTotal = Math.min(...current.map((voice) => voice.countTotal));
  }

  return result;
}

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return ( <
      Notation initialAbcString = {
        data
      }
      solutionAbcString = {
        data
      }
      />
    );
  }
}

class Notation extends Component {
  constructor(props) {
    super(props);

    this.renderVisualObjs = this.renderVisualObjs.bind(this);
    this.simultaneousNotes = simultaneousNotes(this.props.initialAbcString);

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

  //returns abcelem of lowest AdjacentNote
  highlightAdjacentNotesOf(abcelem) {
    let notesHighlighted = [];
    const voicesArray = this.visualObjs[0].makeVoicesArray();
    const adjacentNotes = this.simultaneousNotes.get(JSON.stringify(abcelem.abselem.counters));

    for (let adjacentNote of adjacentNotes) {
      voicesArray[adjacentNote.voice][adjacentNote.noteTotal].elem.highlight(undefined, "rgb(33,150,243)");
      notesHighlighted.push(voicesArray[adjacentNote.voice][adjacentNote.noteTotal].elem);
    }

    this.notesHighlighted = notesHighlighted;

    const lowestAdjacentNote = adjacentNotes[adjacentNotes.length - 1];
    return voicesArray[lowestAdjacentNote.voice][lowestAdjacentNote.noteTotal].elem.abcelem;
  }

  handleClick(abcelem, tuneNumber, classes, analysis, drag, mouseEvent) {
    if (this.notesHighlighted) {
      this.notesHighlighted.forEach((el) => el.unhighlight(undefined, "rgb(0,0,0)"))
    };
    this.notesHighlighted = [];

    var lowestAdjacentNote = this.highlightAdjacentNotesOf(abcelem);

    if (lowestAdjacentNote.chord) {
      //TODO: Edit chord, that's already existing
    } else if (!abcelem.rest) {
      var riemannFunc = prompt("Bitte Funktion angeben:", "D7");
      if (riemannFunc) {
        this.setState({
          abcString: insert(this.state.abcString, `"_${riemannFunc}"`, lowestAdjacentNote.startChar + 1)
        });
      }
    }
  }

  //TODO: Use ConfigFile insted
  renderVisualObjs() {
    this.visualObjs = abc.renderAbc(
      this.props.el || this.el,
      this.state.abcString, {
        //add_classes: true,
        clickListener: this.handleClick.bind(this),
        //dragColor: "green",
        //dragging: true,
        paddingbottom: 30,
        paddingleft: 15,
        paddingright: 50,
        paddingtop: 15,
        responsive: "resize",
        scale: 1,
        selectionColor: "rgb(33,150,243)",
        //selectTypes: true,
        staffwidth: 740,
        header_only: false,
        hint_measures: false,
        print: false,
        stop_on_warning: false,
        oneSvgPerLine: false,
        scrollHorizontal: false,
        //startingTune: 0,
        viewportHorizontal: false,
        //wrap: { minSpacing: 1.8, maxSpacing: 2.7, preferredMeasuresPerLine: 4 },
      },
    );
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

export default App;