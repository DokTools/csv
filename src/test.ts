import CSV from ".";
import fs from 'fs'
import readline from 'readline'

const test = async () => {
    const csv = new CSV('./files/crawlo_es.csv')
    const cursor = await csv.read(['ean', 'stock'], {
        ticks: true
    })
    let inStock = 0, outOfStock = 0
    while (true) {
        const tick = await cursor.next()
        if (tick.done) break;
        const { value } = tick.value;
        if (value.stock === 'IN') inStock += 1
            else outOfStock += 1
    }
    console.log('Stock:', inStock)
    console.log('OUT:', outOfStock)
    console.log('IN percentage: ', (inStock / (inStock + outOfStock)) * 100)
}
test()