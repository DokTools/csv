import readline from "readline";
import utils from './utils'
import CSV from ".";
import dataGetters from './dataGetters';

export interface ReadOptions {
    excludeEmpty?: boolean;
    types?: any;
    ticks?: boolean;
    getters?: any;
}

export interface ObjectOfStrings {
    [name: string]: string;
}
export interface InfoInterface {
    _value?: any;
    pos?: number;
    [name: string]: any;
}

export interface DataInterface {
    columns: string[];
    line?: string;
}

interface FunctionOfStringParam {
    [name: string]: (value: string) => any;
}

export default class Reader {
    context: CSV;
    lineResolvers: any[] = [];
    constructor(context: CSV) {
        this.context = context;
        this.lineResolvers[0] = this.context.setFieldsIndex;
    }

    typesToParsers: FunctionOfStringParam = {
        number: parseFloat,
        date: (value: any) => {
            if (/\d+$/.test(value)) {
                value = parseInt(value);
            }
            return new Date(value);
        },
    };

    defaultGetters: string[] = ['value'];

    defaultLineParser(data: DataInterface, options: ReadOptions): InfoInterface {
        const info: InfoInterface = {};
        for (const getter of options.getters) {
            const fn = dataGetters[getter];
            if (typeof fn === 'function') {
                const result = fn.bind(this)({ data, options });
                if (result)
                    info[getter] = result
            }
        }
        return info;
    }

    async readLine(line: string, pos: number, options: ReadOptions) {
        const columns = utils.splitLine(line, this.context.sep);
        const data = {
            columns,
            line,
            pos
        };
        return (this.lineResolvers[pos] || this.defaultLineParser).bind(this.context)(data, options);
    }

    /**
     *
     * @param {readline.ReadLine}
     * @return {Array<Object>}
     */
    async readNormal(rl: readline.Interface, options: ReadOptions) {
        const data: InfoInterface[] = [];
        let pos = 0;
        for await (const line of rl) {
            const info = await this.readLine(line, pos, options);
            if (info) {
                data.push(info);
            }
            pos += 1;
        }
        return data;
    }

    /**
     *
     * @param rl
     * @param options
     * @return {AsyncGenerator}
     */
    async *readTicks(rl: readline.Interface, options: ReadOptions) {
        let pos = 0;
        for await (const line of rl) {
            const info = await this.readLine(line, pos, options);
            if (info) {
                yield info;
            }
            pos += 1;
        }
    }

    /**
     *
     * @param {Array} fields
     * @param {Object} options additional options
     * @param {Boolean} options.excludeEmpty dont include empty properties
     * @param {Object} options.types specify each column type to parse it automatically
     * @param {Boolean} options.ticks specify if you want to get the whole data as false or iterate line by line using JavaScript Generators
     * @param {string[]} options.getters
     * @returns {Array|AsyncGenerator}
     */
    async read(fields: string[], options: ReadOptions = { excludeEmpty: false, types: {} }): Promise<any> {
        if (!options.getters) options.getters = this.defaultGetters;
        this.context.setFields(fields);
        const rl = utils.createInterface(this.context.filePath)
        if (options.ticks) {
            return this.readTicks(rl, options);
        }
        return this.readNormal(rl, options);
    }
}