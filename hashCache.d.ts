declare class HashCache {
    /**
     * Adds an object to the cache.
     * @param {string} key The key to add.
     * @param {{key: string, value: any}[]} objs The objects to save.
     * @param {Date} [expiration] The date and time to expire the cache.
     * @param {string[]} [invalidationLists] A list of invalidation lists to add the key to.
     * @returns {Promise} A promise that resolves when the object has been added to the cache.
     */
    static add(key: string, objs: {key: string, value: any}[], expiration?: Date, invalidationLists?: string[]): Promise<void>

    /**
     * Gets an object from the cache.
     * @param {string} key The key to get.
     * @param {string} hash The hash to get.
     * @returns {Promise<any>} A promise that returns the object.
     */
    static get(key: string, hash: string): Promise<any>
}

export = HashCache
