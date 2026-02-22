# node-redis
A simple library to make redis calls without having to worry about connections and command syntax.

## Prerelease
This library is in a prerelease state.  It does not yet provide functionality for all Redis commands, and may never be developed fully to encompass them all.

## Version History

### v0.2.0 - 2/22/2026
* Replaced `generic-pool` with a simpler implementation.
* Removed `RedisEventEmitter` as it's no longer necessary.
* Add unit tests.
* Package updates.

### v0.1.20 - 3/29/2025
* Uses `hset` instead of `hmset` in HashCache.
* Package updates.

### v0.1.19 - 7/10/2024
* Package updates.

### v0.1.18 - 5/17/2023
* Package updates.

### v0.1.17 - 11/6/2022
* Package updates.

### v0.1.16 - 10/1/2022
* Package updates.

### v0.1.15 - 7/18/2022
* Package updates.

### v0.1.14 - 5/21/2022
* Package updates.

### v0.1.13 - 2/8/2022
* Package updates.

### v0.1.12 - 1/27/2022
* For compatibility, don't use commands that aren't available in Window redis servers.
* Package updates.

### v0.1.11 - 12/1/2021
* Package updates.

### v0.1.10 - 11/23/2021
* Package updates.

### v0.1.9 - 11/1/2021
* Add option to check if a hash key exists.

### v0.1.8 - 10/15/2021
* Add option to include scores with a SortedSetCache.getReverse result.

### v0.1.7 - 10/13/2021
* New Cache.getAllKeys function.

### v0.1.6 - 10/13/2021
* Add option to include scores with a SortedSetCache.get result.
* Add count, rank, and rankReverse functions to SortedSetCache.

### v0.1.5 - 8/31/2021
* Typings for new Redis.getClient function.

### v0.1.4 - 8/30/2021
* New Redis.getClient function.

### v0.1.3 - 4/14/2021
* New Cache.remove function.

### v0.1.2 - 4/8/2021
* New Cache.expireAt function.
* Cache.get now has an optional expire date to set the expiration of a retrieved key.
* Cache.set now uses the PXAT option.

### v0.1.1 - 4/6/2021
* Include TTL function.

### v0.1.0 - 2/25/2021
* Initial version.
