const assert = require('assert')

module.exports = function (comparator, direction) {
    function compare (left, right) {
        return comparator(left.inner[left.index].key, right.inner[right.index].key) * direction
    }
    return function (iterators, consume) {
        const gathered = []
        do {
            iterators.sort(compare)
            gathered.push(iterators[0].inner[iterators[0].index++])
        } while (iterators[0].inner.length != iterators[0].index)
        assert.notEqual(gathered.length, 0)
        gathered[gathered.length - 1]
        consume(gathered)
    }
}
