### Dependency Upgrades

Upgraded [Skip](https://github.com/bigeasy/skip). The project MVCC has been
converted into module that is a collection of other modules, including this one.
The functions that we were using in MVCC have been moved into
[Revise](https://github.com/bigeasy/revise), so we've replaced the MVCC
dependency with Revise.

### Issue by Issue

 * Upgrade Skip to 0.0.4. #17.
