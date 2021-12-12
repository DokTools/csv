import CSV from '../..';
import rawDataParsers, { defaultKey } from './rawDataParsers';
const keys = Object.keys(rawDataParsers)
export default function detectRawDataType(raw: unknown) {
    for (let key of keys) {
        for (let parser of rawDataParsers[key]) {
            if (parser(raw)) return key;
        }
    }
    return defaultKey;
}

export function setRawDataTypes(this: CSV, { data, options }: any) {
    const object: any = {}
    this.fieldsIndex.forEach((index, position) => {
        const field = this.fields[index]
        let value = data.value[field]
        const type = detectRawDataType(value);
        object[field] = type
    });
    return object
}