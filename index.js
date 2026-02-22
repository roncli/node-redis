/**
 * @typedef {typeof import("./cache")} CacheType
 * @typedef {typeof import("./hashCache")} HashCacheType
 * @typedef {import("ioredis").Redis} IoRedis.Redis
 * @typedef {typeof import("./sortedSetCache")} SortedSetCacheType
 */

const Cache = require("./cache"),
    Connection = require("./connection"),
    HashCache = require("./hashCache"),
    SortedSetCache = require("./sortedSetCache");

// MARK: class Redis
/**
 * A class to provide access to Redis.
 */
class Redis {
    // MARK: static get Cache
    /**
     * The Cache class for basic caching functions.
     * @returns {CacheType} The Cache class.
     */
    static get Cache() {
        return Cache;
    }

    // MARK: static get HashCache
    /**
     * The HashCache class for caching functions related to hashes.
     * @returns {HashCacheType} The HashCache class.
     */
    static get HashCache() {
        return HashCache;
    }

    // MARK: static get SortedSetCache
    /**
     * The SortedSet class for caching functions related to sorted sets.
     * @returns {SortedSetCacheType} The SortedSetCache class.
     */
    static get SortedSetCache() {
        return SortedSetCache;
    }

    // MARK: static getClient
    /**
     * Gets a redis client.  Intended to be called by services that only need one client.
     * @returns {PromiseLike<IoRedis.Redis>} A promise that resolves with the client.
     */
    static getClient() {
        return Connection.pool.acquire();
    }

    // MARK: static setup
    /**
     * Setup the connection to Redis.
     * @param {{host: string, port: number, password: string}} options The connection options.
     * @returns {void}
     */
    static setup(options) {
        Connection.setup(options);
    }
}

module.exports = Redis;
