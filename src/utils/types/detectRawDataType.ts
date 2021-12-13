import CSV from '../..';
import fixedJSON from '../fixedJSON';
import rawDataParsers, { defaultKey } from './rawDataParsers';
const keys = Object.keys(rawDataParsers)
export default function detectRawDataType(raw: unknown) {
    if (!raw) return defaultKey;
    for (let key of keys) {
        for (let parser of rawDataParsers[key]) {
            if (parser(raw)) return key;
        }
    }
    return defaultKey;
}

export function setRawDataTypes(this: CSV, { data, options }: any) {
    const object: any = {}
    this.fields.forEach((field, position) => {
        let value = data.value[field]
        const type = detectRawDataType(value);
        object[field] = type
    });
    return object
}


interface FunctionOfStringParam {
    [name: string]: (value: string) => any;
}

export const typesToParsers: FunctionOfStringParam = {
    string: (value) => value,
    number: parseFloat,
    date: (value: unknown) => {
        if (/\d+$/.test(value as string)) {
            value = parseInt(value as string);
        }
        return new Date(value as any);
    },
    json: (value: string) => {
        return fixedJSON(value)
    }
};