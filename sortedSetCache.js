const Connection = require("./connection"),

    dateMatch = /^(?:\d{4})-(?:\d{2})-(?:\d{2})T(?:\d{2}):(?:\d{2}):(?:\d{2}(?:\.\d*))(?:Z|(?:\+|-)(?:[\d|:]*))?$/;

//   ###                  #                #   ###           #      ###                 #
//  #   #                 #                #  #   #          #     #   #                #
//  #       ###   # ##   ####    ###    ## #  #       ###   ####   #       ###    ###   # ##    ###
//   ###   #   #  ##  #   #     #   #  #  ##   ###   #   #   #     #          #  #   #  ##  #  #   #
//      #  #   #  #       #     #####  #   #      #  #####   #     #       ####  #      #   #  #####
//  #   #  #   #  #       #  #  #      #  ##  #   #  #       #  #  #   #  #   #  #   #  #   #  #
//   ###    ###   #        ##    ###    ## #   ###    ###     ##    ###    ####   ###   #   #   ###
/**
 * A class that handles caching for sorted sets.
 */
class SortedSetCache {
    //          #     #
    //          #     #
    //  ###   ###   ###
    // #  #  #  #  #  #
    // # ##  #  #  #  #
    //  # #   ###   ###
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

    //                   #      #
    //                   #
    //  ##    ##   # #   ###   ##    ###    ##
    // #     #  #  ####  #  #   #    #  #  # ##
    // #     #  #  #  #  #  #   #    #  #  ##
    //  ##    ##   #  #  ###   ###   #  #   ##
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

    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Retrieves data from a set.
     * @param {string} key The key to get the data for.
     * @param {number} min The minimum index of the set.
     * @param {number} max The maximum index of the set.
     * @returns {Promise<any[]>} A promise that returns the objects.
     */
    static async get(key, min, max) {
        let client;
        try {
            client = await Connection.pool.acquire();

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

    //              #    ###
    //              #    #  #
    //  ###   ##   ###   #  #   ##   # #    ##   ###    ###    ##
    // #  #  # ##   #    ###   # ##  # #   # ##  #  #  ##     # ##
    //  ##   ##     #    # #   ##    # #   ##    #       ##   ##
    // #      ##     ##  #  #   ##    #     ##   #     ###     ##
    //  ###
    /**
     * Retrieves data from a set in reverse order.
     * @param {string} key The key to get the data for.
     * @param {number} min The minimum index of the set.
     * @param {number} max The maximum index of the set.
     * @returns {Promise<any[]>} A promise that returns the objects.
     */
    static async getReverse(key, min, max) {
        let client;
        try {
            client = await Connection.pool.acquire();

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
}

module.exports = SortedSetCache;
