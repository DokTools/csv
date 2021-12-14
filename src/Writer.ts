import fs from 'fs';
import CSV from '.';
import utils from './utils'

export interface WriteOptions {
    dynamic?: boolean;
}

export default class Writer {
    context: CSV
    constructor(context: CSV) {
        this.context = context
    }

    static writeLine(o: number, text: string) {
        const buf = Buffer.from(text);
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
        if (typeof this.context.dataSource !== 'string') {
            throw new Error("Cannot write to read only interface")
        }
        const { dynamic } = options;
        if (!fs.existsSync(this.context.dataSource) || fs.statSync(this.context.dataSource).size === 0) {
            fs.writeFileSync(this.context.dataSource, `${fields.join(this.context.sep)}\n`);
        }
        const rl = utils.createInterface(this.context.dataSource)
        if (!rl) {
            throw new Error("Cannot write into readable stream")
        }
        const allFields: string[] = [];
        const tmpFile = `${this.context.dataSource}.tmp`;
        const o = fs.openSync.apply(null, dynamic ? [tmpFile, 'w+'] : [this.context.dataSource, 'a+']);
        let pos = 0;
        for await (const line of rl) {
            if (pos++ === 0) {
                //set header
                const oldFields = utils.splitLine(line, this.context.sep);
                const newFields = fields.filter((field) => !oldFields.includes(field));
                //append new field names
                allFields.push(...oldFields, ...newFields);
                if (dynamic) {
                    Writer.writeLine(o, `${allFields.join(this.context.sep)}\n`);
                    continue;
                }
                break;
            }
            Writer.writeLine(o, `${line}\n`);
        }
        rl.close();
        const allFieldsIndex = [...new Array(allFields.length).keys()];
        //time to append new data
        for (const json of data)
            Writer.writeLine(o, `${allFieldsIndex.map((index) => json[allFields[index]]).join(this.context.sep)}\n`);
        dynamic && fs.renameSync(tmpFile, this.context.dataSource);
        fs.closeSync(o)
        return true;
    }
}