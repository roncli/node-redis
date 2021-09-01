import Cache from "./cache"
import HashCache from "./hashCache"
import RedisEventEmitter from "./redisEventEmitter"
import SortedSetCache from "./sortedSetCache"

declare class Redis {
    /**
     * The Cache class for basic caching functions.
     * @returns {typeof Cache} The Cache class.
     */
    static get Cache(): typeof Cache

    /**
     * An event emitter that can be used to return events from the library.
     * @returns {RedisEventEmitter} The event emitter.
     */
    static get eventEmitter(): RedisEventEmitter

    /**
     * The HashCache class for caching functions related to hashes.
     * @returns {typeof HashCache} The HashCache class.
     */
    static get HashCache(): typeof HashCache

    /**
     * The SortedSet class for caching functions related to sorted sets.
     * @returns {typeof SortedSetCache} The SortedSetCache class.
     */
    static get SortedSetCache(): typeof SortedSetCache

    /**
     * Gets a redis client.  Intended to be called by services that only need one client.
     * @returns {PromiseLike<Redis>} A promise that resolves with the client.
     */
    static getClient(): PromiseLike<Redis>

    /**
     * Setup the connection to Redis.
     * @param {{host: string, port: number, password: string}} options The connection options.
     * @returns {void}
     */
    static setup(options: {host: string, port: number, password: string}): void
}

export = Redis
