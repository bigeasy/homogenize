var cadence = require('cadence')

function Homogenize (comparator, iterators, negate) {
    this._iterations = []
    this._consumed = iterators.slice()
    this._iterators = iterators
    this._order = function (a, b) {
        return comparator(a.item.key, b.item.key) * negate
    }
}

Homogenize.prototype.unlock = cadence(function (async) {
    async.forEach(function (iterator) {
        iterator.unlock(async())
    })(this._iterators)
})

Homogenize.prototype.get = function () {
    var iterations = this._iterations
    if (iterations[0].item == null) {
        this._consumed.push(iterations.shift().iterator)
        return null
    }
    if (iterations.length !== 1) {
        iterations.sort(this._order)
    }
    var iteration = iterations[0]
    var item = iteration.item
    iteration.item = iteration.iterator.get()
    return item
}

Homogenize.prototype.next = cadence(function (async) {
    async(function () {
        var loop = async(function (iterator) {
            if (this._consumed.length === 0) return [ loop.break ]
            var iterator = this._consumed.pop()
            async(function () {
                iterator.next(async())
            }, function (more) {
                if (more) {
                    var item = iterator.get()
                    if (item == null) {
                        this._consumed.push(iterator)
                    } else {
                        this._iterations.push({
                            iterator: iterator,
                            item: item
                        })
                    }
                }
            })
        })()
    }, function () {
        return this._iterations.length !== 0
    })
})

exports.forward = function (comparator, iterators, callback) {
    return new Homogenize(comparator, iterators, 1)
}

exports.reverse = function (comparator, iterators, callback) {
    return new Homogenize(comparator, iterators, -1)
}
