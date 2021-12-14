import wc from './wc';
import Reader, { DataInterface, ReadOptions } from './Reader';
import Writer, { WriteOptions } from './Writer';
import { ICSVDataSource } from './types';

interface CSVOptions {
  sep?: string;
}

export default class CSV {
  dataSource: ICSVDataSource;
  fields: string[];
  fieldsIndex: number[];
  sep: string;
  reader: Reader;
  writer: Writer;
  constructor(dataSource: ICSVDataSource, options?: CSVOptions) {
    this.dataSource = dataSource;
    this.fields = [];
    this.fieldsIndex = [];
    this.sep = (options && options.sep) || ';';
    this.reader = new Reader(this, { dataSource });
    this.writer = new Writer(this);
  }

  setFields(fields: string[]) {
    this.fields = fields;
  }

  setFieldsIndex(data: DataInterface) {
    for (const field of this.fields) {
      this.fieldsIndex.push(data.columns.indexOf(field));
    }
    return undefined; //so we dont trigger yield in readTicks
  }

  async getLines() {
    return (await wc(this.dataSource, { l: true })).l - 1;
  }

  async getWords() {
    return (await wc(this.dataSource, { w: true })).w;
  }

  async read(fields: string[], options?: ReadOptions) {
    return this.reader.read(fields, options);
  }

  pause() {
    this.reader.pause()
  }

  resume() {
    this.reader.resume()
  }

  async write(fields: string[], data: any[], options?: WriteOptions) {
    return this.writer.write(fields, data, options);
  }
}
