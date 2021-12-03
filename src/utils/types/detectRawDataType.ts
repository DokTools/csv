import rawDataParsers, { defaultKey } from './rawDataParsers';
const keys = Object.keys(rawDataParsers)
export default function detectRawDataType(raw: unknown) {
    for (let key of keys) {
        for (let parser of rawDataParsers[key]) {
            if(parser(raw)) return key;
        }
    }
    return defaultKey;
}