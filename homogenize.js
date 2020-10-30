const assert = require('assert')

module.exports = function (comparator, iterators, direction, gather) {
    iterators = iterators.map(iterator => {
        return { outer: iterator, inner: [], index: 0, done: false }
    })
    const iterator = {
        done: false,
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
