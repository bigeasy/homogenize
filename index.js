var cadence = require('cadence')

function Merge (comparator, deleted, iterators, forward) {
    var negate = forward ? 1 : -1

    this._iterations = []
    this._iterators = iterators
    this._comparator = comparator
    this._deleted = deleted
    this._versioned = function (a, b) {
        var compare = comparator(a.key.value, b.key.value) * negate
        if (compare) return compare
        return b.key.version - a.key.version
    }

    this.versions = []
}

Merge.prototype._advance = cadence(function (step, iterations) {
    step(function (iteration) {
        step(function () {
            iteration.iterator.next(step())
        }, function (record, key) {
            if (record && key) {
                if (!~this.versions.indexOf(record.version)) {
                    this.versions.push(record.version)
                }
                iteration.record = record
                iteration.key = key
                this._iterations.push(iteration)
            }
        })
    })(iterations)
})

Merge.prototype.unlock = function () {
    this._iterators.forEach(function (iterator) { iterator.unlock() })
}

Merge.prototype._candidate = function (winner) {
    return this._iterations.length &&
           this._comparator(winner.key.value, this._iterations[0].key.value) == 0
}

Merge.prototype.next = cadence(function (step) {
    if (!this._iterations.length) return step(null)

    var consumed = []

    this._iterations.sort(this._versioned)

    consumed.push(this._iterations.shift())

    while (this._candidate(consumed[0])) {
        consumed.push(this._iterations.shift())
    }

    var winner = [ consumed[0].record, consumed[0].key ]

    step(function () {
        this._advance(consumed, step())
    }, function () {
        if (this._deleted(winner[0])) this.next(step())
        else step(null, winner[0], winner[1])
    })
})

var prime = cadence(function (step, merge, iterators) {
    step(function () {
        merge._advance(iterators.map(function (iterator) {
            return { iterator: iterator }
        }), step())
    }, function () {
        return merge
    })
})

exports.forward = function (comparator, deleted, iterators, callback) {
    prime(new Merge(comparator, deleted, iterators, true), iterators, callback)
}

exports.reverse = function (comparator, deleted, iterators, callback) {
    prime(new Merge(comparator, deleted, iterators, false), iterators, callback)
}
