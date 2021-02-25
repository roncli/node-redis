/**
 * @typedef {typeof import("./cache")} CacheType
 * @typedef {typeof import("./hashCache")} HashCacheType
 * @typedef {typeof import("./sortedSetCache")} sortedSetCacheType
 */

const Cache = require("./cache"),
    Connection = require("./connection"),
    HashCache = require("./hashCache"),
    RedisEventEmitter = require("./redisEventEmitter"),
    SortedSetCache = require("./sortedSetCache"),

    eventEmitter = new RedisEventEmitter();

//  ####              #    #
//  #   #             #
//  #   #   ###    ## #   ##     ###
//  ####   #   #  #  ##    #    #
//  # #    #####  #   #    #     ###
//  #  #   #      #  ##    #        #
//  #   #   ###    ## #   ###   ####
/**
 * A class to provide access to Redis.
 */
class Redis {
    //  ##               #
    // #  #              #
    // #      ###   ##   ###    ##
    // #     #  #  #     #  #  # ##
    // #  #  # ##  #     #  #  ##
    //  ##    # #   ##   #  #   ##
    /**
     * The Cache class for basic caching functions.
     * @returns {CacheType} The Cache class.
     */
    static get Cache() {
        return Cache;
    }

    //                          #    ####         #     #     #
    //                          #    #                  #     #
    //  ##   # #    ##   ###   ###   ###   # #   ##    ###   ###    ##   ###
    // # ##  # #   # ##  #  #   #    #     ####   #     #     #    # ##  #  #
    // ##    # #   ##    #  #   #    #     #  #   #     #     #    ##    #
    //  ##    #     ##   #  #    ##  ####  #  #  ###     ##    ##   ##   #
    /**
     * An event emitter that can be used to return events from the library.
     * @returns {RedisEventEmitter} The event emitter.
     */
    static get eventEmitter() {
        return eventEmitter;
    }

    // #  #               #      ##               #
    // #  #               #     #  #              #
    // ####   ###   ###   ###   #      ###   ##   ###    ##
    // #  #  #  #  ##     #  #  #     #  #  #     #  #  # ##
    // #  #  # ##    ##   #  #  #  #  # ##  #     #  #  ##
    // #  #   # #  ###    #  #   ##    # #   ##   #  #   ##
    /**
     * The HashCache class for caching functions related to hashes.
     * @returns {HashCacheType} The HashCache class.
     */
    static get HashCache() {
        return HashCache;
    }

    //  ##                #             #   ##          #     ##               #
    // #  #               #             #  #  #         #    #  #              #
    //  #     ##   ###   ###    ##    ###   #     ##   ###   #      ###   ##   ###    ##
    //   #   #  #  #  #   #    # ##  #  #    #   # ##   #    #     #  #  #     #  #  # ##
    // #  #  #  #  #      #    ##    #  #  #  #  ##     #    #  #  # ##  #     #  #  ##
    //  ##    ##   #       ##   ##    ###   ##    ##     ##   ##    # #   ##   #  #   ##
    /**
     * The SortedSet class for caching functions related to sorted sets.
     * @returns {sortedSetCacheType} The SortedSetCache class.
     */
    static get SortedSetCache() {
        return SortedSetCache;
    }

    //               #
    //               #
    //  ###    ##   ###   #  #  ###
    // ##     # ##   #    #  #  #  #
    //   ##   ##     #    #  #  #  #
    // ###     ##     ##   ###  ###
    //                          #
    /**
     * Setup the connection to Redis.
     * @param {{host: string, port: number, password: string}} options The connection options.
     * @returns {void}
     */
    static setup(options) {
        Connection.setup(options, eventEmitter);
    }
}

module.exports = Redis;
