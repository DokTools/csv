export default function splitLine(line: string, sep: string) {
    const columns = line.split(sep);
    let pos = 0;
    for (const col of columns) {
        if (col[0] === '"') {
            for (let i = pos; i < columns.length; i++) {
                const secondCol = columns[i];
                const lastQuoteIndex = secondCol && secondCol.lastIndexOf('"');
                if (lastQuoteIndex && lastQuoteIndex !== -1) {
                    const newCol = columns.slice(pos, i + 1).join(sep);
                    columns.splice(pos, i - pos);
                    columns[pos] = newCol;
                    break;
                }
            }
        }
        pos++;
    }
    return columns;
}