const Connection = require("./connection"),

    dateMatch = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T(?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2}(?:\.\d*))(?<timezone>Z|(?:\+|-)(?:[\d|:]*))?$/;

// MARK: SortedSetCache
/**
 * A class that handles caching for sorted sets.
 */
class SortedSetCache {
    // MARK: static async add
    /**
     * Adds an object to the cache.
     * @param {string} key The key to add.
     * @param {{score: number, value: any}[]} objs The objects to save.
     * @param {Date} [expiration] The date and time to expire the cache.
     * @param {string[]} [invalidationLists] A list of invalidation lists to add the key to.
     * @returns {Promise} A promise that resolves when the object has been added to the cache.
     */
    static async add(key, objs, expiration, invalidationLists) {
        let client;
        try {
            client = await Connection.pool.acquire();

            const values = [];

            for (const obj of objs) {
                values.push(obj.score);
                values.push(JSON.stringify(obj.value));
            }

            await client.zadd(key, ...values);

            if (invalidationLists) {
                for (const list of invalidationLists) {
                    await client.sadd(list, key);
                }
            }

            if (expiration) {
                await client.pexpireat(key, expiration.getTime());
            }
        } finally {
            if (client) {
                await Connection.pool.release(client);
            }
        }
    }

    // MARK: static async combine
    /**
     * Combines two sorted sets into one.
     * @param {string} key The key to combine into.
     * @param {string[]} keys The keys to combine.
     * @param {Date} [expiration] The date and time to expire the cache.
     * @param {string[]} [invalidationLists] A list of invalidation lists to add the key to.
     * @returns {Promise} A promise that resolves when the object has been added to the cache.
     */
    static async combine(key, keys, expiration, invalidationLists) {
        let client;
        try {
            client = await Connection.pool.acquire();

            await client.zunionstore(key, keys.length, ...keys);

            if (invalidationLists) {
                for (const list of invalidationLists) {
                    await client.sadd(list, key);
                }
            }

            if (expiration) {
                await client.pexpireat(key, expiration.getTime());
            }
        } finally {
            if (client) {
                await Connection.pool.release(client);
            }
        }
    }

    // MARK: static async count
    /**
     * Counts the number of items in the sorted set.
     * @param {string} key The key.
     * @param {string} min The minimum value to count.
     * @param {string} max The maximum value to count.
     * @returns {Promise<number>} A promise that returns the number of items in the sorted set.
     */
    static async count(key, min, max) {
        let client;
        try {
            client = await Connection.pool.acquire();

            return await client.zcount(key, min, max);
        } finally {
            if (client) {
                await Connection.pool.release(client);
            }
        }
    }

    // MARK: static async get
    /**
     * Retrieves data from a set.
     * @param {string} key The key to get the data for.
     * @param {number} min The minimum index of the set.
     * @param {number} max The maximum index of the set.
     * @param {boolean} [withScores] Whether to include scores with the results.
     * @returns {Promise<any[]|{value: any, score: number}[]>} A promise that returns the objects.
     */
    static async get(key, min, max, withScores) {
        let client;
        try {
            client = await Connection.pool.acquire();

            if (withScores) {
                const items = await client.zrange(key, min, max, "WITHSCORES");

                if (!items) {
                    return void 0;
                }

                const result = [];

                for (let index = 0; index < items.length; index += 2) {
                    const item = items[index];

                    result.push({
                        value: JSON.parse(item, (k, v) => {
                            if (typeof v === "string" && dateMatch.test(v)) {
                                return new Date(v);
                            }

                            return v;
                        }),
                        score: +items[index + 1]
                    });
                }

                return result;
            }

            const items = await client.zrange(key, min, max);

            if (!items) {
                return void 0;
            }

            return items.map((s) => JSON.parse(s, (k, v) => {
                if (typeof v === "string" && dateMatch.test(v)) {
                    return new Date(v);
                }

                return v;
            }));
        } finally {
            if (client) {
                await Connection.pool.release(client);
            }
        }
    }

    // MARK: static async getReverse
    /**
     * Retrieves data from a set in reverse order.
     * @param {string} key The key to get the data for.
     * @param {number} min The minimum index of the set.
     * @param {number} max The maximum index of the set.
     * @param {boolean} [withScores] Whether to include scores with the results.
     * @returns {Promise<any[]>} A promise that returns the objects.
     */
    static async getReverse(key, min, max, withScores) {
        let client;
        try {
            client = await Connection.pool.acquire();

            if (withScores) {
                const items = await client.zrevrange(key, min, max, "WITHSCORES");

                if (!items) {
                    return void 0;
                }

                const result = [];

                for (let index = 0; index < items.length; index += 2) {
                    const item = items[index];

                    result.push({
                        value: JSON.parse(item, (k, v) => {
                            if (typeof v === "string" && dateMatch.test(v)) {
                                return new Date(v);
                            }

                            return v;
                        }),
                        score: +items[index + 1]
                    });
                }

                return result;
            }

            const items = await client.zrevrange(key, min, max);

            if (!items) {
                return void 0;
            }

            return items.map((s) => JSON.parse(s, (k, v) => {
                if (typeof v === "string" && dateMatch.test(v)) {
                    return new Date(v);
                }

                return v;
            }));
        } finally {
            if (client) {
                await Connection.pool.release(client);
            }
        }
    }

    // MARK: static async rank
    /**
     * Retrieves the rank of an item in a set.
     * @param {string} key The key to get the data for.
     * @param {any} member The member to get the data for.
     * @returns {Promise<number>} A promise that returns the rank of the item in the set.
     */
    static async rank(key, member) {
        let client;
        try {
            client = await Connection.pool.acquire();

            return client.zrank(key, JSON.stringify(member));
        } finally {
            if (client) {
                await Connection.pool.release(client);
            }
        }
    }

    // MARK: static async rankReverse
    /**
     * Retrieves the reverse rank of an item in a set.
     * @param {string} key The key to get the data for.
     * @param {any} member The member to get the data for.
     * @returns {Promise<number>} A promise that returns the rank of the item in the set.
     */
    static async rankReverse(key, member) {
        let client;
        try {
            client = await Connection.pool.acquire();

            return client.zrevrank(key, JSON.stringify(member));
        } finally {
            if (client) {
                await Connection.pool.release(client);
            }
        }
    }
}

module.exports = SortedSetCache;
