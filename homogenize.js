const assert = require('assert')

module.exports = function (comparator, collections, reversed) {
    const negate = reversed ? -1 : 1, resumable = []
    let previous = null
    const paginators = collections.map(collection => {
        return { outer: collection[Symbol.asyncIterator](), inner: [], index: 0, done: false }
    })
    function compare (left, right) {
        return comparator(left.inner[left.index].key, right.inner[right.index].key) * negate
    }
    return {
        [Symbol.asyncIterator]: function () {
            return this
        },
        next: async function () {
            resumable.splice(0).forEach(iterator => {
                iterator.outer.resume(previous)
                paginators.unshift(iterator)
            })
            let i = 0
            while (i < paginators.length && paginators[i].inner.length == paginators[i].index) {
                const paginator = paginators[i]
                for (;;) {
                    const outer = await paginator.outer.next()
                    if (outer.done) {
                        paginator.done = true
                        paginators.splice(i, 1)
                        if (paginator.outer.resumable) {
                            resumable.push(paginator)
                        }
                        break
                    }
                    if (outer.value.length != 0) {
                        paginator.inner = outer.value
                        paginator.index = 0
                        i++
                        break
                    }
                }
            }
            if (paginators.length == 0) {
                return { done: true }
            }
            const gathered = []
            do {
                paginators.sort(compare)
                gathered.push(paginators[0].inner[paginators[0].index++])
            } while (paginators[0].inner.length != paginators[0].index)
            assert.notEqual(gathered.length, 0)
            previous = gathered[gathered.length - 1]
            return { done: false, value: gathered }
        }
    }
}
