import CSV from "./CSV";

//example
(async () => {
    const csv = new CSV('./files/test.csv');
    const data = await csv.read(['name', 'url', 'price', 'date'], {
        excludeEmpty: true,
        ticks: true,
        types: {
            'price': 'number',
            'date': 'date'
        },
        getters: ['value', 'pos', 'line']
    });
    while (true) {
        const tick = await data.next()
        if (tick.done) break
        const { _value: info, pos } = tick.value
        console.log(tick.value)
    }
    // console.log(await csv.getLines())
    /* await csv.write(['name', 'url', 'price', 'date', 'test'], [
        { name: 'hehe', url: "exp.com", date: new Date(), test: 'sdf' },
        { name: 'lala', url: "damn.net", price: 15 }
    ], {
        dynamic: true
    }) */
})()