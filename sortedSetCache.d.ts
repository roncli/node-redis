declare class SortedSetCache {
    /**
     * Adds an object to the cache.
     * @param {string} key The key to add.
     * @param {{score: number, value: any}[]} objs The objects to save.
     * @param {Date} [expiration] The date and time to expire the cache.
     * @param {string[]} [invalidationLists] A list of invalidation lists to add the key to.
     * @returns {Promise} A promise that resolves when the object has been added to the cache.
     */
    static add(key: string, objs: {score: number, value: any}[], expiration?: Date, invalidationLists?: string[]): Promise<void>

    /**
     * Combines two sorted sets into one.
     * @param {string} key The key to combine into.
     * @param {string[]} keys The keys to combine.
     * @param {Date} [expiration] The date and time to expire the cache.
     * @param {string[]} [invalidationLists] A list of invalidation lists to add the key to.
     * @returns {Promise} A promise that resolves when the object has been added to the cache.
     */
    static combine(key: string, keys: string[], expiration?: Date, invalidationLists?: string[]): Promise<void>

    /**
     * Retrieves data from a set.
     * @param {string} key The key to get the data for.
     * @param {number} min The minimum index of the set.
     * @param {number} max The maximum index of the set.
     * @returns {Promise<any[]>} A promise that returns the objects.
     */
    static get(key: string, min: number, max: number): Promise<any[]>

    /**
     * Retrieves data from a set.
     * @param {string} key The key to get the data for.
     * @param {number} min The minimum index of the set.
     * @param {number} max The maximum index of the set.
     * @param {boolean} withScores Whether to include scores with the results.
     * @returns {Promise<any[]>} A promise that returns the objects.
     */
    static get(key: string, min: number, max: number, withScores: false): Promise<any[]>

    /**
     * Retrieves data from a set.
     * @param {string} key The key to get the data for.
     * @param {number} min The minimum index of the set.
     * @param {number} max The maximum index of the set.
     * @param {boolean} withScores Whether to include scores with the results.
     * @returns {Promise<{value: any, score: number}[]>} A promise that returns the objects.
     */
    static get(key: string, min: number, max: number, withScores: true): Promise<{value: any, score: number}[]>

    /**
     * Retrieves data from a set in reverse order.
     * @param {string} key The key to get the data for.
     * @param {number} min The minimum index of the set.
     * @param {number} max The maximum index of the set.
     * @returns {Promise<any[]>} A promise that returns the objects.
     */
    static getReverse(key: string, min: number, max: number): Promise<any[]>
}

export = SortedSetCache
