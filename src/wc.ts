import os from 'os';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const platform = os.platform();

const optionToIndex: any = {
    'l': 0,
    'w': 1,
    'c': 2
}

interface WcOptions {
    [name: string]: boolean
}

/**
 * 
 * @param {string} filePath 
 * @param {object} options 
 * @param {boolean} l lines
 * @param {boolean} w words
 * @param {boolean} c chars
 * @returns 
 */
export default async function wc(filePath: string, options: WcOptions) {
    if (platform === 'win32') {
        const readStream = fs.createReadStream(path.resolve(filePath));
        const rl = readline.createInterface({
            input: readStream,
            crlfDelay: Infinity
        });
        let count = 0;
        for await (const line of rl) {
            count++;
        }
        return {
            l: count - 1
        }
    }

    const fields = Object.entries(options).filter(([key, value]) => value && optionToIndex[key] !== undefined).map(([key, value]) => {
        return key;
    });
    const cmd = `wc ${fields.map(x => `-${x}`).join(' ')} ${filePath}`;
    const stdout = execSync(cmd).toString().trim()
    const splited = stdout.split(/\s{1,}/)
    const toReturn: any = {}
    for (const field of fields) {
        toReturn[field] = parseInt(splited[optionToIndex[field]])
    }
    if (toReturn.l) {
        toReturn.l -= 1;
    }
    return toReturn;
}