require('./proof')(1, prove)

function prove (async, assert) {
    var homogenize = require('../..')
    var riffle = require('riffle')
    var fs = require('fs')
    var valid = {}, visited = {}
    ; [ 0, 1, 2, 4 ].forEach(function (version) { valid[version] = true })
    function deleted () {
        return false
    }
    function extractor (record) {
        return record
    }
    function comparator (a, b) {
        var compare = a.value < b.value ? -1 : a.value > b.value ? 1 : 0
        if (compare === 0) {
            return a.version - b.version
        }
        return compare
    }
    var names = 'one two three'.split(/\s+/)
    async(function () {
        async.map(function (name) {
            async(function () {
                fs.mkdir(tmp + '/' + name, async())
            }, function () {
                serialize(__dirname + '/fixtures/' + name + '.json', tmp + '/' + name, async())
            }, function () {
                var strata = createStrata({
                    extractor: extractor,
                    comparator: comparator,
                    leafSize: 3, branchSize: 3,
                    directory: tmp + '/' + name
                })
                async(function () {
                    strata.open(async())
                }, function () {
                    return strata
                })
            })
        })(names)
    }, function (stratas) {
        var records = [], versions = []
        async(function () {
            async.map(function (strata) {
                riffle.reverse(strata, async())
            })(stratas)
        }, function (iterators) {
            var iterator = homogenize.reverse(comparator, iterators)
            async(function () {
                var loop = async(function () {
                    iterator.next(async())
                }, function (more) {
                    if (more) {
                        var item
                        while (item = iterator.get()) {
                            records.push(item.record)
                        }
                    } else {
                        return [ loop.break ]
                    }
                })()
            }, function () {
                assert(records, [ { value: 'i', version: 2, deleted: true },
                                  { value: 'h', version: 4 },
                                  { value: 'h', version: 1 },
                                  { value: 'h', version: 0 },
                                  { value: 'g', version: 0 },
                                  { value: 'g', version: 0 },
                                  { value: 'f', version: 2 },
                                  { value: 'f', version: 0 },
                                  { value: 'e', version: 3 },
                                  { value: 'e', version: 1 },
                                  { value: 'e', version: 0 },
                                  { value: 'd', version: 0 },
                                  { value: 'd', version: 0 },
                                  { value: 'c', version: 2 },
                                  { value: 'c', version: 0 },
                                  { value: 'b', version: 3 },
                                  { value: 'b', version: 1 },
                                  { value: 'b', version: 0 },
                                  { value: 'a', version: 0, deleted: true } ], 'records')
                iterator.unlock(async())
            })
        }, function () {
            async.forEach(function (strata) {
                strata.close(async())
            })(stratas)
        })
    })
}
