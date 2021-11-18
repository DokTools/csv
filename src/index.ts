import CSV from "./CSV";

//example
(async () => {
    const csv = new CSV('./files/test.csv');
    console.log(await csv.read(['product_name', 'brand', 'ean', 'sku', 'stock'], {
        excludeEmpty: true
    }))
    /* await csv.write(['name', 'url', 'price', 'date'], [
        { name: 'hehe', url: "exp.com", date: new Date() },
        { name: 'lala', url: "damn.net", price: 15 }
    ], {
        dynamic: false
    }) */
})()