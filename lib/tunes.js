import fs from "fs";
import path from "path";
import abc from "abcjs";

const tunesDirectory = path.join(process.cwd(), "abcFiles");

/**
 *
 * @param {boolean} sorted specifies, whether the tunes should be returned in sorted order (ASC)
 */
export function getTunes(sorted = false) {
  const fileNames = fs
    .readdirSync(tunesDirectory)
    .filter((fileName) => fileName.endsWith(".abc"));
  const allTunesData = fileNames.map((fileName) => {
    // Read markdown file as string
    const fullPath = path.join(tunesDirectory, fileName);
    const fileContent = fs.readFileSync(fullPath, "utf8");
    //Converts EOL sequence CRLF to LF
    return fileContent.replace(/\r\n/gm, "\n");
  });

  let tunes = new abc.TuneBook(allTunesData.join("\n\n")).tunes;
  if (sorted) {
    tunes.sort((tune1, tune2) => +tune1.id - +tune2.id);
  }
  return tunes;
}

/**
 *
 * @param {string} id
 */
export function getTuneById(id) {
  return getTunes().find((tune) => tune.id === id);
}
