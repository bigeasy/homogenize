const assert = require('assert')

module.exports = function (comparator, iterators, direction) {
    let previous = null
    iterators = iterators.map(iterator => {
        return { outer: iterator, inner: [], index: 0, done: false }
    })
    function compare (left, right) {
        return comparator(left.inner[left.index].key, right.inner[right.index].key) * direction
    }
    const iterator = {
        done: false,
        next: function (promises, consume, terminator = iterator) {
            let i = 0
            if (iterators[0].inner.length == iterators[0].index) {
                iterators[0].outer.next(promises, function (items) {
                    if (items.length == 0) {
                        // Let's not blow the stack if we are iterating over a
                        // bunch of somehow empty pages.
                        promises.push(async function () {
                            iterator.next(promises, consume, terminator)
                        } ())
                    } else {
                        iterators[0].inner = items
                        iterators[0].index = 0
                        iterators.push(iterators.shift())
                        iterator.next(promises, consume, terminator)
                    }
                }, {
                    set done (done) {
                        iterators.shift()
                        if (iterators.length == 0) {
                            terminator.done = done
                        } else {
                            iterator.next(promises, consume, terminator)
                        }
                    }
                })
            } else {
                const gathered = []
                do {
                    iterators.sort(compare)
                    gathered.push(iterators[0].inner[iterators[0].index++])
                } while (iterators[0].inner.length != iterators[0].index)
                assert.notEqual(gathered.length, 0)
                previous = gathered[gathered.length - 1]
                consume(gathered)
            }
        }
    }
    return iterator
}
