import path from 'path';
import fs from 'fs';
import readline from 'readline';

interface ReadOptions {
    excludeEmpty?: boolean;
    types?: any
}

interface WriteOptions {
    dynamic?: boolean;
}

export default class CSV {
    filePath: string
    fields: string[]
    fieldsIndex: number[]
    sep: string
    constructor(filePath: string) {
        this.filePath = filePath;
        this.fields = [];
        this.fieldsIndex = [];
        this.lineResolvers[0] = this.setFieldsIndex;
        this.sep = ', '
    }

    setFieldsIndex(data: string[]) {
        for (let field of this.fields) {
            this.fieldsIndex.push(data.indexOf(field));
        }
    }

    setFields(fields: string[]) {
        this.fields = fields;
    }

    lineResolvers: Function[] = [];

    defaultLineParser(data: string[], options: any) {
        const toReturn: any = {};
        this.fieldsIndex.forEach((index, position) => {
            let value = data[index]
            if (value || !options.excludeEmpty) {
                let key = this.fields[position];
                let { types } = options;
                if (value && types[key] && typeof this.typesToParsers[types[key]] === "function") {
                    value = this.typesToParsers[types[key]](value);
                }
                toReturn[key] = value;
            }
        })
        return toReturn;
    }

    typesToParsers: any = {
        'number': parseFloat,
        'date': (value: any) => {
            if (/\d+$/.test(value)) {
                value = parseInt(value)
            }
            return new Date(value)
        }
    }

    /**
    * 
    * @param {Array} fields 
    * @param {Object} options additional options
    * @param {Boolean} options.excludeEmpty dont include empty properties
    */
    async read(fields: string[], options: ReadOptions = { excludeEmpty: false, types: {} }) {
        this.setFields(fields);
        const readStream = fs.createReadStream(path.resolve(this.filePath));
        const data: any[] = [];
        const rl = readline.createInterface({
            input: readStream,
            crlfDelay: Infinity
        });
        let linePos = 0;
        for await (const line of rl) {
            const info = (this.lineResolvers[linePos] || this.defaultLineParser).bind(this)(line.split(this.sep), options)
            if (info) {
                data.push(info);
            }
            linePos += 1;
        }
        return data;
    }

    /**
     * 
     * @param {String[]} fields csv header fields
     * @param {Object[]} data data to write as array of objects
     * @param {Object} options additional options
     * @param {Boolean} optons.dynamic if disabled you'll lose the dynamic headears feature
     * @returns 
     */
    async write(fields: string[], data: any[], options: WriteOptions = { dynamic: true }) {
        const { dynamic } = options;
        if (!fs.existsSync(this.filePath) || fs.statSync(this.filePath).size === 0) {
            fs.writeFileSync(this.filePath, `${fields.join(this.sep)}\n`)
        }
        const readStream = fs.createReadStream(path.resolve(this.filePath));
        const rl = readline.createInterface({
            input: readStream,
            crlfDelay: Infinity
        });
        const allFields: string[] = [];
        const fieldPositions: any = {};

        let linePos = 0;
        let tmpFile = `${this.filePath}.tmp`;
        let o
        if (dynamic) {
            o = fs.openSync(tmpFile, "w+")
        } else {
            o = fs.openSync(this.filePath, "a+")
        }
        for await (const line of rl) {
            if (linePos++ === 0) {
                //set header
                let oldFields = line.split(this.sep)
                let newFields = fields.filter(field => {
                    return !oldFields.includes(field)
                })
                //append new field names
                allFields.push(...oldFields, ...newFields);
                for (let field of allFields) {
                    fieldPositions[field] = allFields.indexOf(field)
                }
                if (dynamic) {
                    const chunk = `${allFields.join(this.sep)}\n`;
                    const buf = Buffer.alloc(chunk.length, chunk)
                    fs.writeSync(o, buf, undefined, buf.length, undefined)
                    continue;
                } else {
                    break;
                }
            }
            const toWrite = `${line}\n`
            const buf = Buffer.alloc(toWrite.length, toWrite)
            fs.writeSync(o, buf, undefined, buf.length, undefined)
        }
        let allFieldsIndex = [...new Array(allFields.length).keys()]

        //time to append new data
        for (let json of data) {
            const toWrite = `${allFieldsIndex.map(index => json[allFields[index]] || '').join(this.sep)}\n`
            const buf = Buffer.alloc(toWrite.length, toWrite)
            fs.writeSync(o, buf, undefined, buf.length, undefined)
        }
        if (dynamic) {
            fs.renameSync(tmpFile, this.filePath);
        }
        rl.close()
        return true;
    }
}

//example
(async () => {
    const csv = new CSV('./files/test.csv');
    /* console.log(await csv.read(['name', 'url', 'lol', 'date'], {
        excludeEmpty: true,
        types: {
            'lol': 'number',
            'date': 'date'
        }
    })) */
    await csv.write(['name', 'url', 'lol', 'date'], [
        { name: 'hehe', url: "exp.com", date: new Date() },
        { name: 'lala', url: "damn.net", lol: 15 }
    ], {
        dynamic: true
    })
})()