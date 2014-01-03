require('./proof')(3, function (step, serialize, deepEqual, Strata, tmp) {
    var designate = require('../..')
    var skip = require('skip')
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
    step(function () {
        names.forEach(step([], function (name) {
            step(function () {
                fs.mkdir(tmp + '/' + name, step())
            }, function () {
                serialize(__dirname + '/fixtures/' + name + '.json', tmp + '/' + name, step())
            }, function () {
                var strata = new Strata({
                    extractor: revise.extractor(extractor),
                    comparator: revise.comparator(comparator),
                    leafSize: 3, branchSize: 3,
                    directory: tmp + '/' + name
                })
                step(function () {
                    strata.open(step())
                }, function () {
                    return strata
                })
            })
        }))
    }, function (stratas) {
        var records = [], versions = []
        step(function () {
            stratas.forEach(step([], function (strata) {
                skip.forward(strata, comparator, valid, visited, 'a', step())
            }))
        }, function (iterators) {
            designate.forward(comparator, deleted, iterators, step())
        }, function (iterator) {
            step(function () {
                step(function () {
                    iterator.next(step())
                }, function (record) {
                    if (record) {
                        records.push(record.value)
                        versions.push(record.version)
                    } else {
                        step(null)
                    }
                })()
            }, function () {
                deepEqual(Object.keys(visited).sort(),  [ 0, 1, 2, 3, 4 ], 'versions')
                iterator.unlock()
            })
        }, function () {
            deepEqual(records, [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i' ], 'records')
            deepEqual(versions, [ 0, 1, 2, 0, 1, 2, 0, 4, 2 ], 'versions')
        }, function () {
            step(function (strata) {
                strata.close(step())
            })(stratas)
        })
    })
})
