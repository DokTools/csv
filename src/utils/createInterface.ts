import path from 'path';
import fs, { ReadStream } from 'fs';
import readline from 'readline';
import { ICSVDataSource } from '../types';

export default function createInterface(dataSource: ICSVDataSource) {
    const readStream = typeof dataSource === 'string' ? createStream(dataSource) : dataSource.readStream;
    if (!readStream) return false;
    return readline.createInterface({
        input: readStream,
        crlfDelay: Infinity,
    })
}

export function createInterfaceFromStream(stream: ReadStream) {
    return readline.createInterface({
        input: stream,
        crlfDelay: Infinity,
    })
}

export function createStream(filePath: string) {
    return fs.createReadStream(path.resolve(filePath));
}