require('proof')(2, async okay => {
    const Trampoline = require('reciprocate')
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

        const gathered = [], trampoline = new Trampoline
        const iterator = homogenize.forward(comparator, pages)
        while (! iterator.done) {
            iterator.next(trampoline, items => {
                for (const item of items) {
                    gathered.push(item)
                }
            })
            while (trampoline.seek()) {
                await trampoline.shift()
            }
        }
        okay(gathered, merged, 'forward')
    }

    {
        const pages = merge.map(array => advance.reverse(array))

        const gathered = [], trampoline = new Trampoline
        const iterator = homogenize.reverse(comparator, pages)
        while (! iterator.done) {
            iterator.next(trampoline, items => {
                for (const item of items) {
                    gathered.push(item)
                }
            })
            while (trampoline.seek()) {
                await trampoline.shift()
            }
        }
        okay(gathered, merged.slice().reverse(), 'reverse')
    }
})
