const ignoredChars = ['\t', ' ']

const getFirstChar = (raw: string) => {
    for (let c of raw) {
        if (ignoredChars.includes(c)) continue;
        return c;
    }
}

const getLastChar = (raw: string) => {
    for (let i = raw.length - 1; i >= 0; i--) {
        let c = raw[i]
        if (ignoredChars.includes(c)) continue;
        return c;
    }
}

const isNumber = (raw: unknown) => {
    return /^([" ]+)?\d+([.]\d+)?([" ]+)?$/.test(raw as string)
}

const isDate = (raw: unknown) => {
    const date = new Date(raw as string)
    return !isNaN(date as unknown as number)
}

const isJSON = (raw: unknown) => {
    const closures = [
        ['[', ']'],
        ['{', '}']
    ]
    const f = getFirstChar(raw as string);
    const l = getLastChar(raw as string);
    const closure = closures.find(_case => _case[0] === f)
    return !!(closure && closure[1] === l)
}

export const defaultKey = "string"

interface IParsers {
    [name: string]: Array<(raw: unknown) => boolean>
}

const parsers: IParsers = {
    "number": [isNumber],
    "date": [isDate],
    "json": [isJSON]
}

export default parsers;