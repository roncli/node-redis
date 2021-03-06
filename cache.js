const Connection = require("./connection"),

    dateMatch = /^(?:\d{4})-(?:\d{2})-(?:\d{2})T(?:\d{2}):(?:\d{2}):(?:\d{2}(?:\.\d*))(?:Z|(?:\+|-)(?:[\d|:]*))?$/;

//   ###                 #
//  #   #                #
//  #       ###    ###   # ##    ###
//  #          #  #   #  ##  #  #   #
//  #       ####  #      #   #  #####
//  #   #  #   #  #   #  #   #  #
//   ###    ####   ###   #   #   ###
/**
 * A class that handles caching.
 */
class Cache {
    //          #     #
    //          #     #
    //  ###   ###   ###
    // #  #  #  #  #  #
    // # ##  #  #  #  #
    //  # #   ###   ###
    /**
     * Adds an object to the cache.
     * @param {string} key The key to add.
     * @param {any} obj The object to save.
     * @param {Date} [expiration] The date and time to expire the cache.
     * @param {string[]} [invalidationLists] A list of invalidation lists to add the key to.
     * @returns {Promise} A promise that resolves when the object has been added to the cache.
     */
    static async add(key, obj, expiration, invalidationLists) {
        let client;
        try {
            client = await Connection.pool.acquire();

            if (expiration) {
                // TODO: redis 6.2 will introduce PXAT expiration method.
                // await client.set(key, JSON.stringify(obj), "PXAT", expiration.getTime());

                const time = Math.ceil(Math.max(expiration.getTime() - new Date().getTime(), 1));
                await client.set(key, JSON.stringify(obj), "PX", time);
            } else {
                await client.set(key, JSON.stringify(obj));
            }

            if (invalidationLists) {
                for (const list of invalidationLists) {
                    await client.sadd(list, key);
                }
            }
        } finally {
            if (client) {
                await Connection.pool.release(client);
            }
        }
    }

    //              #            #
    //                           #
    //  ##   #  #  ##     ###   ###    ###
    // # ##   ##    #    ##      #    ##
    // ##     ##    #      ##    #      ##
    //  ##   #  #  ###   ###      ##  ###
    /**
     * Check if all keys exist.
     * @param {string[]} keys The list of keys to check.
     * @returns {Promise<boolean>} A promise that returns whether all keys exist.
     */
    static async exists(keys) {
        let client;
        try {
            client = await Connection.pool.acquire();

            return await client.exists(...keys) === keys.length;
        } finally {
            if (client) {
                await Connection.pool.release(client);
            }
        }
    }

    //   #   ##                 #
    //  # #   #                 #
    //  #     #    #  #   ###   ###
    // ###    #    #  #  ##     #  #
    //  #     #    #  #    ##   #  #
    //  #    ###    ###  ###    #  #
    /**
     * Flushes the cache.
     * @returns {Promise} A promise that resolves when the cache has been flushed.
     */
    static async flush() {
        let client;
        try {
            client = await Connection.pool.acquire();

            await client.flushdb();
        } finally {
            if (client) {
                await Connection.pool.release(client);
            }
        }
    }

    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets an object from the cache.
     * @param {string} key The key to get.
     * @returns {Promise<any>} A promise that returns the retrieved object.
     */
    static async get(key) {
        let client;
        try {
            client = await Connection.pool.acquire();

            const value = await client.get(key);

            if (!value) {
                return void 0;
            }

            return JSON.parse(value, (k, v) => {
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

    //  #                      ##     #       #         #
    //                          #             #         #
    // ##    ###   # #    ###   #    ##     ###   ###  ###    ##
    //  #    #  #  # #   #  #   #     #    #  #  #  #   #    # ##
    //  #    #  #  # #   # ##   #     #    #  #  # ##   #    ##
    // ###   #  #   #     # #  ###   ###    ###   # #    ##   ##
    /**
     * Invalidates keys from a list of invalidate lists.
     * @param {string[]} invalidationLists The invalidation lists to invalidate.
     * @returns {Promise} A promise that resolves when the invalidation lists have been invalidated.
     */
    static async invalidate(invalidationLists) {
        let client;
        try {
            client = await Connection.pool.acquire();

            const keys = [];

            for (const list of invalidationLists) {
                keys.push(list);

                const items = await client.smembers(list);

                if (items) {
                    keys.push(...items);
                }
            }

            await client.del(...keys);
        } finally {
            if (client) {
                await Connection.pool.release(client);
            }
        }
    }
}

module.exports = Cache;
