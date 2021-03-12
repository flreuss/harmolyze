/**
 * removes all annotations below the lines, that are included in curly brackets
 * @param {string} abcString 
 * @returns {string}
 */
export function getInitial(abcString) {
    //Workaround, because \n is coming from the database already escaped (\\n)
    return abcString.replace(/"_{[^\s]+}"/g,"").replace(/\\n/g, '\n')
}

/**
 * removes curly brackets from all annotations below the lines 
 * @param {string} abcString 
 * @returns {string}
 */
export function getSolution(abcString) {
    //Workaround, because \n is coming from the database already escaped (\\n)
    return abcString.replace(/"_{([^\s}]+)}"/gm,`"_$1"`).replace(/\\n/g, '\n')
}