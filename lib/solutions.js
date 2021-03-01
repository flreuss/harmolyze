/**
 * removes all annotations below the lines, that are included in curly brackets {...}
 * @param {string} abcString 
 */
export function removeSolutions(abcString) {
    return abcString.replace(/"_{[^\s]+}"/g,"")
}