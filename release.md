### Accumulate Visited Versions

This is actually done by [Skip
0.0.2](https://github.com/bigeasy/skip/releases/tag/v0.0.2). We've upgraded to
Skip 0.0.2 and we test that we don't get in the way of visited version
accumulation.

### 100% Test Coverage

We now test the following conditions.

 * Versions not included in the value versions set are ignored.
 * Deleted records are skipped.

Instead of tracking open cursors in two lists, one list of active iterations and
one list of iterators whose iterations have completed, we now have a list of all
the iterators and we unlock those.

### Issue by Issue

 * Place all locked iterators in `_iterators`. #16.
 * Skip deleted records. #15.
 * Implement reverse iterators. #14.
 * Upgrade Skip to 0.0.3. #13.
 * Upgrade Skip to 0.0.2. #12.
 * Test that invalid versions are excluded. #11.
