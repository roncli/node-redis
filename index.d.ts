import Cache from "./cache"
import HashCache from "./hashCache"
import {Redis as IoRedis} from "ioredis"
import SortedSetCache from "./sortedSetCache"

declare class Redis {
    /**
     * The Cache class for basic caching functions.
     * @returns {typeof Cache} The Cache class.
     */
    static get Cache(): typeof Cache

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
     * @returns {PromiseLike<IoRedis>} A promise that resolves with the client.
     */
    static getClient(): PromiseLike<IoRedis>

    /**
     * Setup the connection to Redis.
     * @param {{host: string, port: number, password: string}} options The connection options.
     * @returns {void}
     */
    static setup(options: {host: string, port: number, password: string}): void
}

export = Redis
