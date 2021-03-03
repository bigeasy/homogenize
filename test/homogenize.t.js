require('proof')(3, async okay => {
    const ascension = require('ascension')
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
        const pages = merge.map(array => advance(array))

        const gathered = [], trampoline = new Trampoline
        const iterator = homogenize(comparator, pages)
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
        const pages = merge.map(array => advance(array, { reverse: true }))

        const gathered = [], trampoline = new Trampoline
        const iterator = homogenize(comparator, pages)
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

    {
        const pages = [
            advance([[{
                key: [ 'a' ],
                value: [ 'a' ],
                items: [{ key: [ 'a', 0 ] }, { key: [ 'a', 2 ] }]
            }], [{
                key: [ 'b' ],
                value: [ 'b' ],
                items: [{ key: [ 'b', 3 ] }, { key: [ 'b', 4 ] }]
            }, {
                key: [ 'c' ],
                value: [ 'c' ],
                items: []
            }], [{
                key: [ 'd' ],
                value: [ 'd' ],
                items: []
            }]], { map: true }),
            advance([[{
                key: [ 'a' ],
                value: [ 'a' ],
                items: [{ key: [ 'a', 1 ] }, { key: [ 'a', 3 ] }]
            }, {
                key: [ 'b' ],
                value: [ 'b' ],
                items: [{ key: [ 'b', 1 ] }, { key: [ 'b', 2 ] }]
            }, {
                key: [ 'c' ],
                value: [ 'c' ],
                items: []
            }, {
                key: [ 'd' ],
                value: [ 'd' ],
                items: []
            }]], { map: true })
        ]

        const comparator = ascension([ String, Number ])

        const gathered = [], trampoline = new Trampoline
        const iterator = homogenize(comparator, pages)

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
        okay(gathered, [{
            key: [ 'a' ],
            value: [ 'a' ],
            items: [{ key: [ 'a', 0 ] }, { key: [ 'a', 1 ] }, { key: [ 'a', 2 ] }, { key: [ 'a', 3 ] }]
        }, {
            key: [ 'b' ],
            value: [ 'b' ],
            items: [{ key: [ 'b', 1 ] }, { key: [ 'b', 2 ] }, { key: [ 'b', 3 ] }, { key: [ 'b', 4 ] }]
        }, {
            key: [ 'c' ],
            value: [ 'c' ],
            items: []
        }, {
            key: [ 'd' ],
            value: [ 'd' ],
            items: []
        }], 'merge')
    }
})
