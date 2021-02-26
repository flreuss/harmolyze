export function removeSolutions(abcString) {
    return abcString.replace(/"_{[^\s]+}"/g,"")
}