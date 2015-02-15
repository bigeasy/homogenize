require('./proof')(1, prove)

function prove (async, assert) {
    var homogenize = require('../..')
    var riffle = require('riffle')
    var revise = require('revise')
    var fs = require('fs')
    var valid = {}, visited = {}
    ; [ 0, 1, 2, 4 ].forEach(function (version) { valid[version] = true })
    function deleted () {
        return false
    }
    function extractor (record) {
        return record.value
    }
    function comparator (a, b) {
        return a < b ? -1 : a > b ? 1 : 0
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
                    extractor: revise.extractor(extractor),
                    comparator: revise.comparator(comparator),
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
                riffle.forward(strata, { value: 'a' }, async())
            })(stratas)
        }, function (iterators) {
            homogenize.forward(revise.comparator(comparator), iterators, async())
        }, function (iterator) {
            var records = [], versions = []
            async(function () {
                var loop = async(function () {
                    iterator.next(async())
                }, function (items) {
                    if (items == null) {
                        return [ loop ]
                    }
                    items.forEach(function (item) {
                        records.push(item.record)
                    })
                })()
            }, function () {
                assert(records, [ { value: 'a', version: 0, deleted: true },
                  { value: 'b', version: 0 },
                  { value: 'b', version: 1 },
                  { value: 'b', version: 3 },
                  { value: 'c', version: 0 },
                  { value: 'c', version: 2 },
                  { value: 'd', version: 0 },
                  { value: 'd', version: 0 },
                  { value: 'e', version: 0 },
                  { value: 'e', version: 1 },
                  { value: 'e', version: 3 },
                  { value: 'f', version: 0 },
                  { value: 'f', version: 2 },
                  { value: 'g', version: 0 },
                  { value: 'g', version: 0 },
                  { value: 'h', version: 0 },
                  { value: 'h', version: 1 },
                  { value: 'h', version: 4 },
                  { value: 'i', version: 2, deleted: true } ], 'forward')
                iterator.unlock(async())
            })
        }, function () {
            async.forEach(function (strata) {
                strata.close(async())
            })(stratas)
        })
    })
}
