import readline from "readline";
import utils from './utils'
import CSV from ".";
import dataGetters from './dataGetters';
import { setRawDataTypes } from "./utils/types/detectRawDataType";
import { ICSVDataPair, ICSVDataSource } from "./types";
import { createInterfaceFromStream } from "./utils/createInterface";
import { ReadStream } from "fs";

export interface ReadOptions {
    excludeEmpty?: boolean;
    types?: any;
    ticks?: boolean;
    getters?: any;
    detectType?: boolean;
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

export default class Reader {
    context: CSV;
    lineResolvers: any[] = [];
    readInterface?: readline.Interface
    constructor(context: CSV, props: { dataSource?: ICSVDataSource }) {
        this.context = context;
        this.lineResolvers[0] = this.context.setFieldsIndex;
        if (props.dataSource && typeof props.dataSource !== 'string') {
            if (props.dataSource.readStream) {
                this.readInterface = readline.createInterface({
                    input: props.dataSource.readStream
                });
            }
        }
    }

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

    async *readGenerator(rl: readline.Interface | undefined): AsyncGenerator<string> {
        if (!rl) return false;
        for await (const line of rl) {
            yield line;
        }
        this.readInterface = undefined;
        rl.close();
    }

    getLineData(line: string, pos: number) {
        const columns = utils.splitLine(line, this.context.sep);
        const data = {
            columns,
            line,
            pos
        };
        return data;
    }

    async parseLine(line: string, pos: number, options: ReadOptions) {
        const data = this.getLineData(line, pos);
        return this.defaultLineParser.bind(this.context)(data, options);
    }

    async readNormal(gen: AsyncGenerator<string>, options: ReadOptions) {
        const data: InfoInterface[] = [];
        for await (const info of this.readTicks(gen, options)) {
            data.push(info);
        }
        return data;
    }

    async *readTicks(gen: AsyncGenerator<string>, options: ReadOptions) {
        let pos = 1; //we start from the second line
        const firstDataLine = (await gen.next()).value;
        const firstDataInfo = await this.parseLine(firstDataLine, pos++, options);
        //set raw data types
        if (options.detectType) {
            if (!options.getters.includes('value')) {
                throw new Error("value should be parsed to detect type!")
            }
            options.types = {
                ...options.types,
                ...setRawDataTypes.bind(this.context)({ data: firstDataInfo, options })
            }
        }
        yield await this.parseLine(firstDataLine, pos++, options) //parse first line for a second time
        for await (const line of gen) {
            const info = await this.parseLine(line, pos, options);
            yield info;
            pos += 1;
        }
    }

    /**
     * pauses readline interface
     */
    pause() {
        if (this.readInterface) {
            this.readInterface.pause()
        }
    }

    /**
     * resumes readline interface
     */
    resume() {
        if (this.readInterface) {
            this.readInterface.resume()
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
        if (!options.types) options.types = {};
        const rl = utils.createInterface(this.context.dataSource)
        if (!rl) {
            throw new Error("dataSource should be a string or an object with readStream property!")
        }
        this.readInterface = rl;
        this.context.setFields(fields);
        const gen = this.readGenerator(this.readInterface)
        //getting the headers
        const tick = await gen.next()
        this.context.setFieldsIndex(this.getLineData(tick.value, 0))
        if (options.ticks) {
            return this.readTicks(gen, options);
        }
        return this.readNormal(gen, options);
    }
}