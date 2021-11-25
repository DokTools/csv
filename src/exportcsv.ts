import CSV from "./CSV";
import fs from 'fs';

(async () => {
    const csv = new CSV('./files/MRKEAN_Beauty (3).csv')
    const data = await csv.read(['mrkean'], {
        excludeEmpty: true,
        getters: ['value', 'pos', 'line']
    });
    console.log(data[0])
    const o = fs.openSync('./files/MRKEAN_Beauty.json', 'w+')
    const newData = data.map((x: Record<"_value", any>) => x._value);
    fs.writeSync(o, Buffer.from(`${JSON.stringify(newData)}`))
})()