import detectRawDataType from './src/utils/types/detectRawDataType';
import splitLine from './src/utils/splitLine';

const typesToParsers: any = {
    number: parseFloat,
    date: (raw: unknown) => {
        if (/\d+$/.test(raw as string)) {
            raw = parseInt(raw as string);
        }
        return new Date(raw as string|number);
    },
    json: (raw: unknown) => {
        return JSON.parse(raw as string)
    }
};

const line = `"hehe ; dfg ; sdf ; sdfdfg";exp.com;0;5.9;"400";Mon Nov 22 2021 15:01:59 GMT+0100 (GMT+01:00); [1, 2]`

for (let col of splitLine(line, ';')) {
    const type = detectRawDataType(col);
    let value = typesToParsers[type] ? typesToParsers[type](col) : col
    console.log(value)
}