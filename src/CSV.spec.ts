import CSV from '.'
import readline from 'readline'
import fs from 'fs'

it('Read from file', async function () {
    const csv = new CSV(readline.createInterface({
        input: fs.createReadStream('./files/test.csv')
    }));
    const data = await csv.read(['name', 'url', 'price', 'date', 'extra', 'ean'], {
        excludeEmpty: true,
        ticks: true,
        /* types: {
            price: 'number',
            date: 'date'
        }, */
        detectType: true,
        getters: ['value', 'pos'],
    });
    while (true) {
        const tick = await data.next()
        if (tick.done) break
        const { value: info, pos } = tick.value
        console.log(tick.value)
    }
})

/* it('Write to file', async function () {
    const csv = new CSV('./files/test.csv');
    await csv.write(['name', 'url', 'price', 'date', 'test'], [
        { name: 'hehe', url: "exp.com", date: new Date(), test: 'sdf' },
        { name: 'lala', url: "damn.net", price: 15 }
    ], {
        dynamic: true
    })
}) */