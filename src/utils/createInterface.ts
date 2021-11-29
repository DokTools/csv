import path from 'path';
import fs from 'fs';
import readline from 'readline';

export default function createInterface(filePath: string) {
    const readStream = fs.createReadStream(path.resolve(filePath));
    return readline.createInterface({
        input: readStream,
        crlfDelay: Infinity,
    })
}