import path from 'path';
import fs from 'fs';
import readline from 'readline';

interface ReadOptions {
    excludeEmpty?: boolean;
    types?: any;
}

interface WriteOptions {
    dynamic?: boolean;
}

interface CSVOptions {
    sep?: string
}

export default class CSV {
    filePath: string
    fields: string[]
    fieldsIndex: number[]
    sep: string
    constructor(filePath: string, options?: CSVOptions) {
        this.filePath = filePath;
        this.fields = [];
        this.fieldsIndex = [];
        this.lineResolvers[0] = this.setFieldsIndex;
        this.sep = (options && options.sep) || ";";
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
                if (value && types && types[key] && typeof this.typesToParsers[types[key]] === "function") {
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

    splitLine(line: string) {
        let columns = line.split(this.sep)
        let pos = 0
        for (let col of columns) {
            if (col[0] === "\"") {
                for (let i = pos; i < columns.length; i++) {
                    let secondCol = columns[i]
                    let lastQuoteIndex = secondCol && secondCol.lastIndexOf("\"")
                    if (lastQuoteIndex && lastQuoteIndex !== -1) {
                        let newCol = columns.slice(pos, pos + (i + 1)).join(this.sep)
                        columns.splice(pos, i)
                        columns[pos] = newCol
                    }
                }
            }
            pos++
        }
        return columns
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
            let columns = this.splitLine(line)
            const info = (this.lineResolvers[linePos] || this.defaultLineParser).bind(this)(columns, options)
            if (info) {
                data.push(info);
            }
            linePos += 1;
        }
        return data;
    }

    static writeLine(o: number, text: string) {
        const buf = Buffer.from(text)
        fs.writeSync(o, buf, undefined, buf.length, undefined);
    }

    /**
     * 
     * @param {String[]} fields csv header fields
     * @param {Object[]} data data to write as array of objects
     * @param {Object} options additional options
     * @param {Boolean} optons.dynamic if disabled you'll lose the dynamic headears feature
     * @returns 
     */
    async write(fields: string[], data: any[], options: WriteOptions = { dynamic: false }) {
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
        let linePos = 0;
        let tmpFile = `${this.filePath}.tmp`;
        let o: number
        if (dynamic) {
            o = fs.openSync(tmpFile, "w+")
        } else {
            //append new data
            o = fs.openSync(this.filePath, "a+")
        }
        for await (const line of rl) {
            if (linePos++ === 0) {
                //set header
                let oldFields = this.splitLine(line)
                let newFields = fields.filter(field => !oldFields.includes(field))
                //append new field names
                allFields.push(...oldFields, ...newFields);
                if (dynamic) {
                    CSV.writeLine(o, `${allFields.join(this.sep)}\n`);
                    continue;
                } else {
                    break;
                }
            }
            CSV.writeLine(o, `${line}\n`);
        }
        const allFieldsIndex = [...new Array(allFields.length).keys()]
        //time to append new data
        data.forEach((json) => CSV.writeLine(o, `${allFieldsIndex.map(index => json[allFields[index]] || '').join(this.sep)}\n`))
        dynamic && fs.renameSync(tmpFile, this.filePath)
        rl.close()
        return true;
    }
}