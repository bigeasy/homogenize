const assert = require('assert')

const mvcc = require('mvcc')

function merge (comparator, direction) {
    return function (iterators, consume) {
        const gathered = []
        do {
            iterators.sort((left, right) => {
                return comparator(left.inner[left.index].key, right.inner[right.index].key) * direction
            })
            gathered.push(iterators[0].inner[iterators[0].index++])
        } while (iterators[0].inner.length != iterators[0].index)
        assert.notEqual(gathered.length, 0)
        consume(gathered)
    }
}

function homogenize (type, iterators, gather) {
    iterators = iterators.map(iterator => {
        return { outer: iterator, inner: [], index: 0, done: false }
    })
    const iterator = {
        done: false,
        type: type,
        next: function (trampoline, consume, terminator = iterator) {
            let i = 0
            if (iterators[0].inner.length == iterators[0].index) {
                iterators[0].outer.next(trampoline, function (items) {
                    if (items.length == 0) {
                        trampoline.sync(() => iterator.next(trampoline, consume, terminator))
                    } else {
                        iterators[0].inner = items
                        iterators[0].index = 0
                        iterators.push(iterators.shift())
                        trampoline.sync(() => iterator.next(trampoline, consume, terminator))
                    }
                }, {
                    set done (done) {
                        iterators.shift()
                        if (iterators.length == 0) {
                            terminator.done = done
                        } else {
                            trampoline.sync(() => iterator.next(trampoline, consume, terminator))
                        }
                    }
                })
            } else {
                gather(iterators, consume)
            }
        }
    }
    return iterator
}

module.exports = function (comparator, iterators) {
    assert(iterators.every(iterator => iterator.type == iterators[0].type))
    const type = iterators[0].type
    switch (type) {
        case mvcc.FORWARD: {
                return homogenize(type, iterators, merge(comparator, 1))
            }
        case mvcc.REVERSE: {
                return homogenize(type, iterators, merge(comparator, -1))
            }
        case mvcc.MAP: {
                return homogenize(type, iterators, (iterators, consume) => {
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
                    iterators.sort((left, right) => {
                        const remaining = {
                            left: left.inner.length - left.index,
                            right: right.inner.length - right.index
                        }
                        return (remaining.left > remaining.right) - (remaining.left < remaining.right)
                    })
                    consume(got)
                })
            }
    }
}
