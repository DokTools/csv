# csv

this project is dedicated to simplify csv parsing for developers.

automatic data retrieving, data parsing (json), dynamic writing along with custom control of a lot of functionalities.

## usage

this project is written in typescript and you can compile the code into javascript by running `npm run build` or `tsc`,

for developement use `ts-node src` instead.

we need to import CSV class first:

```
const csv = new CSV('./files/test.csv', {
    // separator of csv columns, default: ;
    sep: ';'
})
```

### reading data

#### data retrieving
to read from file we use:

```
const data = await csv.read(['name', 'url', 'price', 'date', 'extra'])
```

we get something like
```
console.log(data)
>>>
[
    {
        value: {
            name: 'product 1',
            url: 'example.com/productPage',
            price: '99.99',
            date: 'Mon Nov 22 2021 15:01:59 GMT+0100 (GMT+01:00)',
            extra: ''
        }
    },
    ...
]
```

in this case we had property extra empty because it's empty in the file, if you want to exclude it add an option `excludeEmpty: true` as follows
```
const data = await csv.read(['name', 'url', 'price', 'date', 'extra'], {
    excludeEmpty: true
})
```

now sometimes we work with large files and iterating on every line and push to an array and then iterate again from your side to use the parsed data is resource consuming.

for that you can use Javascript Generator Functions with the option `ticks: true` as follows

```
const cursor = await csv.read(['name', 'url', 'price', 'date', 'extra'], {
    ticks: true
});
while (true) {
    const tick = await cursor.next()
    if (tick.done) break
    const { value: info } = tick.value
    console.log(info)
}
```

#### data parsing
you can parse data automatically by specifying types of columns using csv headers

for now we can parse `number, date` more will be added in the future, an auto type detector can be possibly integrated in the future using machine learning for data labeling.

```
const data = await csv.read(['name', 'url', 'price', 'date', 'extra'], {
    types: {
        price: 'number',
        date: 'date'
    }
})
```
```
console.log(data)
>>>
[
    {
        value: {
            name: 'product 1', 
            url: 'example.com/productPage', 
            price: 99.99, 
            date: 2021-11-22T14:01:59.000Z
        }
    },
    ...
]
```

#### extra info
by default you get an object with property `value` containing the columns data.

additionally you can get `pos, line, columns`

`pos` refers to line position in the file making it easier for debugging

`line` returns the whole line

`columns` return an array of all columns but not labeled with headers

you can get the extra info using `getters` option

```
const data = await csv.read(['name', 'url', 'price', 'date', 'extra'], {
    // default: ['value']
    getters: ['value', 'pos', 'line', 'columns']
})
```
```
console.log(data)
>>>
[
    {
        value: {
            name: 'product 1',
            url: 'example.com/productPage',
            price: '99.99',
            date: 'Mon Nov 22 2021 15:01:59 GMT+0100 (GMT+01:00)',
            extra: ''
        }
        pos: 2,
        line: "product 1;example.com/productPage;99.99;Mon Nov 22 2021 15:01:59 GMT+0100 (GMT+01:00);",
        columns: ["product 1, "example.com/productPage", "99.99", "Mon Nov 22 2021 15:01:59 GMT+0100 (GMT+01:00)"]
    },
    ...
]
```

Note:

as you may see in src/utils/splitLine.ts i created a custom parser for lines not depending on ; separator alone

we may face a case when one columns has the delimiter ; but it's inside double quotes like "product 1 ; for product 2"

so we have to ignore that delimiter and that's what this function do

### writing data

#### writing simplified
writing data made simple, you just pass an array of objects and the header positions in the file will be automatically recognized

```
await csv.write(['name', 'url', 'price', 'date'], [
    { name: 'product 2', url: "exp.com/productPage/2", price: 69.96, date: new Date() },
    ...
])
```
```
>>> test.csv
name;url;price;date
product 2;exp.com/productPage/2;69.96;Mon Nov 22 2021 15:01:59 GMT+0100 (GMT+01:00)
```

#### dynamic writing
optionally, this function can handle new columns of data that dont exist in file's headers

for that you can use the option `dynamic: true` to let the function know that you want dynamic headers

Note: this functionality is resource consuming as it write the whole file again instead of appending

```
await csv.write(['name', 'url', 'price', 'date', 'newHeader'], [
    {
        name: 'product 3',
        url: "exp.com/productPage/3",
        price: 69.96,
        date: new Date(),
        newHeader: 'newData'
    },
    ...
])
```
```
>>> test.csv
name;url;price;date;newHeader
product 2;exp.com/productPage/2;69.96;Mon Nov 22 2021 15:01:59 GMT+0100 (GMT+01:00);newData
```