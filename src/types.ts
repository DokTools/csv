import { ReadStream, WriteStream } from "fs";
import { ReadLine } from "readline";

export interface ICSVDataPair {
    readStream?: ReadStream;
    writeStream?: WriteStream;
}

export type ICSVDataSource = string | ICSVDataPair