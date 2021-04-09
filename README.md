# node-redis
A simple library to make redis calls without having to worry about connections and command syntax.

## Prerelease
This library is in a prerelease state.  It does not yet provide functionality for all Redis commands, and may never be developed fully to encompass them all.

## Version History

### v0.1.2
* New Cache.expireAt function.
* Cache.get now has an optional expire date to set the expiration of a retrieved key.
* Cache.set now uses the PXAT option.

### v0.1.1
* Include TTL function.

### v0.1.0
* Initial version.
