import abc from 'abcjs';
import React, {
    Component
} from 'react';

import config from "./config.json";

class Score extends Component {
    constructor(props) {
        super(props);

        this.renderVisualObjs = this.renderVisualObjs.bind(this);
        this.config = config;
        this.config.clickListener = this.handleClick.bind(this);
        this.notesHighlighted = [];

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

    lowestAdjacentNote(abcelem) {
        const adjacentNotes = this.props.initial.simultaneousNotesArray.get(JSON.stringify(abcelem.abselem.counters));
        const lowestAdjacentNote = adjacentNotes[adjacentNotes.length - 1];

        return lowestAdjacentNote;
    }

    highlightAdjacentNotesOf(abcelem) {
        let notesHighlighted = [];
        const voicesArray = this.voicesArray;
        const adjacentNotes = this.props.initial.simultaneousNotesArray.get(JSON.stringify(abcelem.abselem.counters));

        for (let adjacentNote of adjacentNotes) {
            voicesArray[adjacentNote.voice][adjacentNote.noteTotal].elem.highlight(undefined, this.config.selectionColor);
            notesHighlighted.push(voicesArray[adjacentNote.voice][adjacentNote.noteTotal].elem);
        }

        this.notesHighlighted = notesHighlighted;
    }

    handleClick(abcelem, _tuneNumber, _classes, _analysis, _drag, _mouseEvent) {
        if (this.notesHighlighted) {
            this.notesHighlighted.forEach((el) => el.unhighlight(undefined, "black"))
        };
        this.notesHighlighted = [];

        //TODO: #1 fix problem with timing when highlighting and entering chord that occurs in Chrome
        this.highlightAdjacentNotesOf(abcelem);

        const lowestAdjacentNotePos = this.lowestAdjacentNote(abcelem);
        const lowestAdjacentNote = this.voicesArray[lowestAdjacentNotePos.voice][lowestAdjacentNotePos.noteTotal].elem.abcelem;
        const initialLowestAdjacentNote = this.props.initial.voicesArray[lowestAdjacentNotePos.voice][lowestAdjacentNotePos.noteTotal].elem.abcelem;

        if (!initialLowestAdjacentNote.chord && !abcelem.rest) {
            if (lowestAdjacentNote.chord) {
                const riemannFunc = prompt("Bitte Funktion angeben:", lowestAdjacentNote.chord[0].name);
                const chordLength = lowestAdjacentNote.chord[0].name.length;
                if (riemannFunc) {
                    this.setState({
                        abcString: replace(this.state.abcString, `"_${riemannFunc}"`, lowestAdjacentNote.startChar, chordLength + 3)
                    });
                }
            } else {
                const riemannFunc = prompt("Bitte Funktion angeben:");
                if (riemannFunc) {
                    this.setState({
                        abcString: insert(this.state.abcString, `"_${riemannFunc}"`, lowestAdjacentNote.startChar)
                    });
                }
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

function replace(main_string, repl_string, pos, len) {
    if (typeof (len) == "undefined") {
        len = 0;
    }
    if (typeof (pos) == "undefined") {
        pos = 0;
    }
    if (typeof (repl_string) == "undefined") {
        repl_string = '';
    }
    return main_string.slice(0, pos) + repl_string + main_string.slice(pos + len);
}

export default Score;