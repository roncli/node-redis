const Connection = require("./connection"),

    dateMatch = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T(?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2}(?:\.\d*))(?<timezone>Z|(?:\+|-)(?:[\d|:]*))?$/;

// MARK: class HashCache
/**
 * A class that handles caching for hashes.
 */
class HashCache {
    // MARK: static async add
    /**
     * Adds an object to the cache.
     * @param {string} key The key to add.
     * @param {{key: string, value: any}[]} objs The objects to save.
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
                values.push(obj.key);
                values.push(JSON.stringify(obj.value));
            }

            await client.hset(key, ...values);

            if (invalidationLists) {
                await invalidationLists.reduce(
                    (prev, list) => prev.then(() => client.sadd(list, key)),
                    Promise.resolve()
                );
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

    // MARK: static async exists
    /**
     * Checks if a hash exists in the cache.
     * @param {string} key The key to get.
     * @param {string} hash The hash to get.
     * @returns {Promise<boolean>} A promise that returns whether the hash exists or not.
     */
    static async exists(key, hash) {
        let client;
        try {
            client = await Connection.pool.acquire();

            return await client.hexists(key, hash) === 1;
        } finally {
            if (client) {
                await Connection.pool.release(client);
            }
        }
    }

    // MARK: static async get
    /**
     * Gets an object from the cache.
     * @param {string} key The key to get.
     * @param {string} hash The hash to get.
     * @returns {Promise<any>} A promise that returns the object.
     */
    static async get(key, hash) {
        let client;
        try {
            client = await Connection.pool.acquire();

            const value = await client.hget(key, hash);

            if (!value) {
                return void 0;
            }

            return JSON.parse(value, (_k, v) => {
                if (typeof v === "string" && dateMatch.test(v)) {
                    return new Date(v);
                }

                return v;
            });
        } finally {
            if (client) {
                await Connection.pool.release(client);
            }
        }
    }
}

module.exports = HashCache;
