var cadence = require('cadence/redux')

require('cadence/loops')

function Homogenize (comparator, iterators, negate) {
    this._iterations = []
    this._consumed = iterators.slice()
    this._iterators = iterators
    this._order = function (a, b) {
        return comparator(a.items[a.index].key, b.items[b.index].key) * negate
    }
}

Homogenize.prototype.unlock = cadence(function (async) {
    async.forEach(function (iterator) {
        iterator.unlock(async())
    })(this._iterators)
})

Homogenize.prototype.next = cadence(function (async) {
    async(function () {
        async.forEach(function (iterator) {
            async(function () {
                iterator.next(async())
            }, function (items) {
                if (items != null) {
                    this._iterations.push({ iterator: iterator, items: items, index: 0 })
                }
            })
        })(this._consumed)
    }, function () {
        var items = [], iterations = this._iterations
        if (iterations.length === 0) {
            return [ null ]
        }
        for (;;) {
            if (iterations.length !== 1) {
                iterations.sort(this._order)
            }
            var iteration = iterations[0]
            items.push(iteration.items[iteration.index++])
            if (iteration.items.length === iteration.index) {
                this._consumed.push(iterations.shift().iterator)
                break
            }
        }
        return [ items ]
    })
})

exports.forward = function (comparator, iterators, callback) {
    callback(null, new Homogenize(comparator, iterators, 1))
}

exports.reverse = function (comparator, iterators, callback) {
    callback(null, new Homogenize(comparator, iterators, -1))
}
