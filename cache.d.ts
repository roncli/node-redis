declare class Cache {
    /**
     * Adds an object to the cache.
     * @param {string} key The key to add.
     * @param {any} obj The object to save.
     * @param {Date} [expiration] The date and time to expire the cache.
     * @param {string[]} [invalidationLists] A list of invalidation lists to add the key to.
     * @returns {Promise} A promise that resolves when the object has been added to the cache.
     */
    static add(key: string, obj: any, expiration?: Date, invalidationLists?: string[]): Promise<void>

    /**
     * Check if all keys exist.
     * @param {string[]} keys The list of keys to check.
     * @returns {Promise<boolean>} A promise that returns whether all keys exist.
     */
    static exists(keys: string[]): Promise<boolean>

    /**
     * Flushes the cache.
     * @returns {Promise} A promise that resolves when the cache has been flushed.
     */
    static flush(): Promise<void>

    /**
     * Gets an object from the cache.
     * @param {string} key The key to get.
     * @returns {Promise<any>} A promise that returns the retrieved object.
     */
    static get(key: string): Promise<any>

    /**
     * Invalidates keys from a list of invalidate lists.
     * @param {string[]} invalidationLists The invalidation lists to invalidate.
     * @returns {Promise} A promise that resolves when the invalidation lists have been invalidated.
     */
    static invalidate(invalidationLists: string[]): Promise<void>

    /**
     * Gets the time remaining until a key expires.
     * @param {string} key The key to check.
     * @returns {Promise<number>} A promise that returns the amount of time remaining in seconds until the key expires.
     */
    static ttl(key: string): Promise<number>
}

export = Cache
