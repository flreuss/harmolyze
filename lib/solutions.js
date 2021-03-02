/**
 * removes all annotations below the lines, that are included in curly brackets {...}
 * @param {string} abcString 
 */
export function getInitial(abcString) {
    return abcString.replace(/"_{[^\s]+}"/g,"")
}

export function getSolution(abcString) {
    return abcString.replace(/"_{([^\s]+)}"/gm,`"_$1"`)
}