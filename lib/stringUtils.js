export function insert(mainString, insString = "", pos = 0) {
  while (mainString[pos] === " ") {
    pos += 1;
  }
  return mainString.slice(0, pos) + insString + mainString.slice(pos);
}

export function replace(mainString, replString = "", pos = 0, len = 0) {
  //workaround for chords
  if (mainString[pos] === "[") {
    pos -= len;
  }
  while (mainString[pos] === " ") {
    pos += 1;
  }
  return mainString.slice(0, pos) + replString + mainString.slice(pos + len);
}
