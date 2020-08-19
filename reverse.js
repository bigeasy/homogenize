const homogenize = require('./homogenize')

module.exports = function (comparator, collections) {
    return homogenize(comparator, collections, true)
}
