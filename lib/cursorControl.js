export default function CursorControl(scoreContainerId) {
  var self = this;

  self.onStart = function () {
    var svg = document.querySelector(`${scoreContainerId} svg`);
    var cursor = document.createElementNS("http://www.w3.org/2000/svg", "line");
    cursor.setAttribute("class", "abcjs-cursor");
    cursor.setAttributeNS(null, "x1", 0);
    cursor.setAttributeNS(null, "y1", 0);
    cursor.setAttributeNS(null, "x2", 0);
    cursor.setAttributeNS(null, "y2", 0);
    svg.appendChild(cursor);
  };
  self.beatSubdivisions = 2;
  self.onEvent = function (ev) {
    if (ev.measureStart && ev.left === null) return; // this was the second part of a tie across a measure line. Just ignore it.

    var lastSelection = document.querySelectorAll(
      `${scoreContainerId} svg .highlight`
    );
    for (var k = 0; k < lastSelection.length; k++)
      lastSelection[k].classList.remove("highlight");

    for (var i = 0; i < ev.elements.length; i++) {
      var note = ev.elements[i];
      for (var j = 0; j < note.length; j++) {
        note[j].classList.add("highlight");
      }
    }

    var cursor = document.querySelector(
      `${scoreContainerId} svg .abcjs-cursor`
    );
    if (cursor) {
      cursor.setAttribute("x1", ev.left - 2);
      cursor.setAttribute("x2", ev.left - 2);
      cursor.setAttribute("y1", ev.top);
      cursor.setAttribute("y2", ev.top + ev.height);
    }
  };
  self.onFinished = function () {
    var els = document.querySelectorAll("svg .highlight");
    for (let el of els) {
      el.classList.remove("highlight");
    }
    var cursor = document.querySelector(
      `${scoreContainerId} svg .abcjs-cursor`
    );
    if (cursor) {
      cursor.setAttribute("x1", 0);
      cursor.setAttribute("x2", 0);
      cursor.setAttribute("y1", 0);
      cursor.setAttribute("y2", 0);
    }
  };
}
