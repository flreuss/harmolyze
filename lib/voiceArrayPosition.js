export default class VoiceArrayPosition {
  /**
   * UID for the position of a note in the VoiceArray
   * @param {number} voice 
   * @param {number} noteTotal 
   */
  constructor(voice, noteTotal) {
    this.voice = voice;
    this.noteTotal = noteTotal;
  }
};