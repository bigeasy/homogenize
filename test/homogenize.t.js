require('proof')(4, async okay => {
    const advance = require('advance')
    const homogenize = require('..')
    const merge = [[
        [ 1 ], [], [ 2, 7, 10 ]
    ], [
        [ 3, 8 ]
    ], [
        [ 4, 5, 6, 9, 11 ]
    ]].map(array => {
        return array.map(array => {
            return array.map(value => { return { key: value } })
        })
    })

    const merged = new Array(11).fill(0).map((_, index) => { return { key: index + 1 } })

    function comparator (left, right) {
        return +left - +right
    }

    {
        const pages = merge.map(array => advance.forward(array))

        const gathered = []
        for await (const items of homogenize.forward(comparator, pages)) {
            console.log(items)
            for (const item of items) {
                gathered.push(item)
            }
        }
        okay(gathered, merged, 'forward')
    }

    {
        const pages = merge.map(array => advance.reverse(array))

        const gathered = []
        for await (const items of homogenize.reverse(comparator, pages)) {
            for (const item of items) {
                gathered.push(item)
            }
        }
        okay(gathered, merged.slice().reverse(), 'reverse')
    }

    {
        const pages = merge.map(array => advance.forward(array))

        const test = []

        pages.push({
            [Symbol.asyncIterator]: function () { return this },
            resumable: true,
            resume: function (key) {
                test.push(key)
            },
            next: async function () {
                return { done: true, values: null }
            }
        })

        const gathered = []
        for await (const items of homogenize.forward(comparator, pages)) {
            for (const item of items) {
                gathered.push(item)
            }
        }

        okay(gathered, merged, 'resumable')
        okay(test, [{ key: 1 }, { key: 8 }, { key: 10 }, { key: 11 }], 'resumed')
    }
})
