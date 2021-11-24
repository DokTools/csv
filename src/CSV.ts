import path from 'path';
import fs from 'fs';
import readline from 'readline';
import wc from './wc';

interface ReadOptions {
  excludeEmpty?: boolean;
  types?: any;
  ticks?: boolean;
  getters?: any;
}

interface WriteOptions {
  dynamic?: boolean;
}

interface ObjectOfStrings {
  [name: string]: string;
}

interface FunctionOfStringParam {
  [name: string]: (value: string) => any;
}

interface CSVOptions {
  sep?: string;
}

interface InfoInterface {
  _value?: any;
  pos?: number;
}

interface DataInterface {
  columns: string[];
  line?: string;
}

export default class CSV {
  filePath: string;
  fields: string[];
  fieldsIndex: number[];
  sep: string;
  constructor(filePath: string, options?: CSVOptions) {
    this.filePath = filePath;
    this.fields = [];
    this.fieldsIndex = [];
    this.lineResolvers[0] = this.setFieldsIndex;
    this.sep = (options && options.sep) || ';';
  }

  setFieldsIndex(data: DataInterface) {
    for (const field of this.fields) {
      this.fieldsIndex.push(data.columns.indexOf(field));
    }
    return undefined; //so we dont trigger yield in readTicks
  }

  setFields(fields: string[]) {
    this.fields = fields;
  }

  lineResolvers: any[] = [];

  valueGetter({ info, data, options }: any) {
    const _value: any = {};
    this.fieldsIndex.forEach((index, position) => {
      let value = data.columns[index];
      if (value || !options.excludeEmpty) {
        const key = this.fields[position];
        const { types } = options;
        if (value && types && types[key] && typeof this.typesToParsers[types[key]] === 'function') {
          value = this.typesToParsers[types[key]](value);
        }
        _value[key] = value;
      }
    });
    info._value = _value;
  }

  posGetter({ info, pos }: any) {
    info.pos = pos + 1;
  }

  lineGetter({ info, data }: any) {
    info.line = data.line;
  }

  gettersCollection: any = {
    value: this.valueGetter,
    pos: this.posGetter,
    line: this.lineGetter,
  };

  defaultGetters: string[] = ['value'];

  defaultLineParser(data: DataInterface, pos: number, options: ReadOptions): InfoInterface {
    const info: InfoInterface = {};
    for (const getter of options.getters) {
      const fn = this.gettersCollection[getter];
      typeof fn === 'function' && fn.bind(this)({ info, data, pos, options });
    }
    return info;
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

  splitLine(line: string) {
    const columns = line.split(this.sep);
    let pos = 0;
    for (const col of columns) {
      if (col[0] === '"') {
        for (let i = pos; i < columns.length; i++) {
          const secondCol = columns[i];
          const lastQuoteIndex = secondCol && secondCol.lastIndexOf('"');
          if (lastQuoteIndex && lastQuoteIndex !== -1) {
            const newCol = columns.slice(pos, i + 1).join(this.sep);
            columns.splice(pos, i - pos);
            columns[pos] = newCol;
          }
        }
      }
      pos++;
    }
    return columns;
  }

  async getLines() {
    return (await wc(this.filePath, { l: true })).l - 1;
  }

  async getWords() {
    return (await wc(this.filePath, { w: true })).w;
  }

  async readLine(line: string, pos: number, options: ReadOptions) {
    const columns = this.splitLine(line);
    const data = {
      columns,
      line,
    };
    return (this.lineResolvers[pos] || this.defaultLineParser).bind(this)(data, pos, options);
  }

  /**
   *
   * @param {readline.ReadLine}
   * @return {Array<Object>}
   */
  async readNormal(rl: readline.Interface, options: ReadOptions) {
    const data: InfoInterface[] = [];
    let linePos = 0;
    for await (const line of rl) {
      const info = await this.readLine(line, linePos, options);
      if (info) {
        data.push(info);
      }
      linePos += 1;
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
    let linePos = 0;
    for await (const line of rl) {
      const info = await this.readLine(line, linePos, options);
      if (info) {
        yield info;
      }
      linePos += 1;
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
    this.setFields(fields);
    const readStream = fs.createReadStream(path.resolve(this.filePath));
    const rl = readline.createInterface({
      input: readStream,
      crlfDelay: Infinity,
    });
    if (options.ticks) {
      return this.readTicks(rl, options);
    }
    return this.readNormal(rl, options);
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
    if (!fs.existsSync(this.filePath) || fs.statSync(this.filePath).size === 0) {
      fs.writeFileSync(this.filePath, `${fields.join(this.sep)}\n`);
    }
    const readStream = fs.createReadStream(path.resolve(this.filePath));
    const rl = readline.createInterface({
      input: readStream,
      crlfDelay: Infinity,
    });
    const allFields: string[] = [];
    let linePos = 0;
    const tmpFile = `${this.filePath}.tmp`;
    let o: number;
    if (dynamic) {
      o = fs.openSync(tmpFile, 'w+');
    } else {
      //append new data
      o = fs.openSync(this.filePath, 'a+');
    }
    for await (const line of rl) {
      if (linePos++ === 0) {
        //set header
        const oldFields = this.splitLine(line);
        const newFields = fields.filter((field) => !oldFields.includes(field));
        //append new field names
        allFields.push(...oldFields, ...newFields);
        if (dynamic) {
          CSV.writeLine(o, `${allFields.join(this.sep)}\n`);
          continue;
        }
        break;
      }
      CSV.writeLine(o, `${line}\n`);
    }
    const allFieldsIndex = [...new Array(allFields.length).keys()];
    //time to append new data
    for (const json of data)
      CSV.writeLine(o, `${allFieldsIndex.map((index) => json[allFields[index]]).join(this.sep)}\n`);
    dynamic && fs.renameSync(tmpFile, this.filePath);
    rl.close();
    return true;
  }
}
