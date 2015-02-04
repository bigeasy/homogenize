require('./proof')(3, prove)

function prove (async, assert) {
    var designate = require('../..')
    var skip = require('skip')
    var revise = require('revise')
    var fs = require('fs')
    var valid = {}, visited = {}
    ; [ 0, 1, 2, 4 ].forEach(function (version) { valid[version] = true })
    function deleted (record) {
        return record.deleted
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
                var strata = new Strata({
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
                skip.forward(strata, comparator, valid, visited, async())
            })(stratas)
        }, function (iterators) {
            designate.forward(comparator, deleted, iterators, async())
        }, function (iterator) {
            async(function () {
                var loop = async(function () {
                    iterator.next(async())
                }, function (record) {
                    if (record) {
                        records.push(record.value)
                        versions.push(record.version)
                    } else {
                        return [ loop ]
                    }
                })()
            }, function () {
                assert(Object.keys(visited).sort(),  [ 0, 1, 2, 3, 4 ], 'versions')
                iterator.unlock(async())
            })
        }, function () {
            assert(records, [ 'b', 'c', 'd', 'e', 'f', 'g', 'h', ], 'records')
            assert(versions, [ 1, 2, 0, 1, 2, 0, 4 ], 'versions')
        }, function () {
            async.forEach(function (strata) {
                strata.close(async())
            })(stratas)
        })
    })
}
