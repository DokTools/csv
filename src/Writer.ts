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
        const { dynamic } = options;
        if (!fs.existsSync(this.context.filePath) || fs.statSync(this.context.filePath).size === 0) {
            fs.writeFileSync(this.context.filePath, `${fields.join(this.context.sep)}\n`);
        }
        const rl = utils.createInterface(this.context.filePath)
        const allFields: string[] = [];
        const tmpFile = `${this.context.filePath}.tmp`;
        const o = fs.openSync.apply(null, dynamic ? [tmpFile, 'w+'] : [this.context.filePath, 'a+']);
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
        dynamic && fs.renameSync(tmpFile, this.context.filePath);
        fs.closeSync(o)
        return true;
    }
}