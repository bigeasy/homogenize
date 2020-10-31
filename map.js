const assert = require('assert')
const homogenize = require('./homogenize')

module.exports = function (comparator, collections) {
    return homogenize(comparator, collections, 1, (iterators, consume) => {
        const got = []
        do {
            const set = iterators.map(iterator => iterator.inner[iterator.index++])
            const items = []
            got.push({
                key: set[0].key,
                value: set[0].value,
                items: items.concat.apply(items, set.map(entry => entry.items))
                            .sort((left, right) => comparator(left.key, right.key))
            })
        } while (iterators.every(iterator => iterator.inner.length != iterator.index))
        consume(got)
    })
}
