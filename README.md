Merge one or more b-tree cursors into a single iterator.

Homogenize merges two or more MVCC iterators into a single iterator. Homogenize
will first advance all of the iterators. It then selects the least value from
the all iterators, returns that value, and then advances the iterator from which
the value was returned. For reverse iterators the greatest value is selected.
