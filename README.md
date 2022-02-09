# node-redis
A simple library to make redis calls without having to worry about connections and command syntax.

## Prerelease
This library is in a prerelease state.  It does not yet provide functionality for all Redis commands, and may never be developed fully to encompass them all.

## Version History

### v0.1.13
* Package updates.

### v0.1.12
* For compatibility, don't use commands that aren't available in Window redis servers.
* Package updates.

### v0.1.11
* Package updates.

### v0.1.10
* Package updates.

### v0.1.9
* Add option to check if a hash key exists.

### v0.1.8
* Add option to include scores with a SortedSetCache.getReverse result.

### v0.1.7
* New Cache.getAllKeys function.

### v0.1.6
* Add option to include scores with a SortedSetCache.get result.
* Add count, rank, and rankReverse functions to SortedSetCache.

### v0.1.5
* Typings for new Redis.getClient function.

### v0.1.4
* New Redis.getClient function.

### v0.1.3
* New Cache.remove function.

### v0.1.2
* New Cache.expireAt function.
* Cache.get now has an optional expire date to set the expiration of a retrieved key.
* Cache.set now uses the PXAT option.

### v0.1.1
* Include TTL function.

### v0.1.0
* Initial version.
