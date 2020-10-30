const homogenize = require('./homogenize')
const merge = require('./merge')

module.exports = function (comparator, collections) {
    return homogenize(comparator, collections, -1, merge(comparator, -1))
}
