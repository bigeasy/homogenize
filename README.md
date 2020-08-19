[![Actions Status](https://github.com/bigeasy/homogenize/workflows/Node%20CI/badge.svg)](https://github.com/bigeasy/homogenize/actions)
[![codecov](https://codecov.io/gh/bigeasy/homogenize/branch/master/graph/badge.svg)](https://codecov.io/gh/bigeasy/homogenize)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Merge one or more b-tree cursors into a single iterator.

| What          | Where                                             |
| --- | --- |
| Discussion    | https://github.com/bigeasy/homogenize/issues/1    |
| Documentation | https://bigeasy.github.io/homogenize              |
| Source        | https://github.com/bigeasy/homogenize             |
| Issues        | https://github.com/bigeasy/homogenize/issues      |
| CI            | https://travis-ci.org/bigeasy/homogenize          |
| Coverage:     | https://codecov.io/gh/bigeasy/homogenize          |
| License:      | MIT                                               |


```
npm install homogenize
```

Homogenize merges two or more MVCC iterators into a single iterator. Homogenize
will first advance all of the iterators. It then selects the least value from
the all iterators, returns that value, and then advances the iterator from which
the value was returned. For reverse iterators the greatest value is selected.
