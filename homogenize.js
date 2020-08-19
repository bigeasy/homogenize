module.exports = function (comparator, collections, reversed) {
    const negate = reversed ? -1 : 1
    const iterators = collections.map(collection => {
        return { outer: collection[Symbol.asyncIterator](), inner: [], index: 0, done: false }
    })
    function compare (left, right) {
        return comparator(left.inner[left.index], right.inner[right.index]) * negate
    }
    return {
        [Symbol.asyncIterator]: function () {
            return this
        },
        next: async function () {
            let i = 0
            while (i < iterators.length && iterators[i].inner.length == iterators[i].index) {
                const paginator = iterators[i]
                for (;;) {
                    const outer = await paginator.outer.next()
                    if (outer.done) {
                        paginator.done = true
                        iterators.splice(i, 1)
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
            if (iterators.length == 0) {
                return { done: true }
            }
            const gathered = []
            do {
                iterators.sort(compare)
                gathered.push(iterators[0].inner[iterators[0].index++])
            } while (iterators[0].inner.length != iterators[0].index)
            return { done: false, value: gathered }
        }
    }
}
