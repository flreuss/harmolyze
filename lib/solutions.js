/**
 * removes all annotations below the lines, that are included in curly brackets
 * @param {string} abcString 
 * @returns {string}
 */
export function getInitial(abcString) {
    return abcString.replace(/"_{[^\s]+}"/g,"")
}

/**
 * removes curly brackets from all annotations below the lines 
 * @param {string} abcString 
 * @returns {string}
 */
export function getSolution(abcString) {
    return abcString.replace(/"_{([^\s]+)}"/gm,`"_$1"`)
}