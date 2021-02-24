import Cache from "./cache"
import {EventEmitter} from "events"
import HashCache from "./hashCache"
import IORedis from "ioredis"
import SortedSetCache from "./sortedSetCache"

declare class Redis {
    /**
     * The Cache class for basic caching functions.
     * @returns {typeof Cache} The Cache class.
     */
    static get Cache(): typeof Cache

    /**
     * An event emitter that can be used to return events from the library.
     * @returns {EventEmitter} The event emitter.
     */
    static get eventEmitter(): EventEmitter

    /**
     * The HashCache class for caching functions related to hashes.
     * @returns {typeof HashCache} The HashCache class.
     */
    static get HashCache(): typeof HashCache

    static get options(): IORedis.RedisOptions

    /**
     * The SortedSet class for caching functions related to sorted sets.
     * @returns {typeof SortedSetCache} The SortedSetCache class.
     */
    static get SortedSetCache(): typeof SortedSetCache

    /**
     * Setup the connection to Redis.
     * @param {IORedis.RedisOptions} options The connection options.
     * @returns {void}
     */
    static setup(options: IORedis.RedisOptions): void
}

export = Redis
