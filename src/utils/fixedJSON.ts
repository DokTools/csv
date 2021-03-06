//https://stackoverflow.com/questions/9637517/parsing-relaxed-json-without-eval
export default function fixedJSON(str: string) {
    return JSON.parse(
        str
            .replace(/:\s*"([^"]*)"/g, function (match, p1) {
                return ': "' + p1.replace(/:/g, '@colon@') + '"'
            })

            // Replace ":" with "@colon@" if it's between single-quotes
            .replace(/:\s*'([^']*)'/g, function (match, p1) {
                return ': "' + p1.replace(/:/g, '@colon@') + '"'
            })

            // Add double-quotes around any tokens before the remaining ":"
            .replace(/(['"])?([a-z0-9A-Z_]+)(['"])?\s*:/g, '"$2": ')

            // Turn "@colon@" back into ":"
            .replace(/@colon@/g, ':')
    )
}
