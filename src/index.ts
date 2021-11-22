import CSV from "./CSV";

//example
(async () => {
    const csv = new CSV('./files/test.csv');
    const data = await csv.read(['name', 'url', 'price', 'date'], {
        excludeEmpty: true,
        ticks: false,
        types: {
            'price': 'number',
            'date': 'date'
        }
    });
    console.log(data)
    /* while(true){
        const tick = await data.next()
        if(tick.done) break;
        const json = tick.value;
        console.log(json)
    } */
    /* await csv.write(['name', 'url', 'price', 'date', 'hehe'], [
        { name: 'hehe', url: "exp.com", date: new Date() },
        { name: 'lala', url: "damn.net", price: 15 }
    ], {
        dynamic: true
    }) */
})()