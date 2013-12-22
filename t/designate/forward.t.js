require('./proof')(1, function (step, serialize, deepEqual, Strata, tmp) {
    var designate = require('../..')
    var skip = require('skip')
    var mvcc = require('mvcc')
    var fs = require('fs')
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
                    extractor: mvcc.extractor(extractor),
                    comparator: mvcc.comparator(comparator),
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
        step(function () {
            stratas.forEach(step([], function (strata) {
                skip.forward(strata, comparator, { 0: true }, 'a', step())
            }))
        }, function (iterators) {
            designate.forward(comparator, deleted, iterators, step())
        }, function (iterator) {
            var records = []
            step(function () {
                step(function () {
                    iterator.next(step())
                }, function (record) {
                    if (record) {
                        records.push(record.value)
                    } else {
                        step(null, records)
                    }
                })()
            }, function () {
                iterator.unlock()
            }, function () {
                return records
            })
        }, function (records) {
            deepEqual(records, [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i' ], 'records')
        }, function () {
            step(function (strata) {
                strata.close(step())
            })(stratas)
        })
    })
})
