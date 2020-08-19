require('proof')(2, async okay => {
    const advance = require('advance')
    const homogenize = require('..')
    const merge = [[
        [ 1 ], [], [ 2, 7, 10 ]
    ], [
        [ 3, 8 ]
    ], [
        [ 4, 5, 6, 9, 11 ]
    ]]

    const merged = new Array(11).fill(0).map((_, index) => index + 1)

    function comparator (left, right) {
        return +left - +right
    }

    {
        const pages = merge.map(array => advance.forward(array))

        const gathered = []
        for await (const items of homogenize.forward(comparator, pages)) {
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
})
