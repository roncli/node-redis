const GenericPool = require("generic-pool"),
    IoRedis = require("ioredis"),
    Redis = require(".");

/** @type {GenericPool.Pool<IoRedis.Redis>} */
let pool;

//   ###                                       #       #
//  #   #                                      #
//  #       ###   # ##   # ##    ###    ###   ####    ##     ###   # ##
//  #      #   #  ##  #  ##  #  #   #  #   #   #       #    #   #  ##  #
//  #      #   #  #   #  #   #  #####  #       #       #    #   #  #   #
//  #   #  #   #  #   #  #   #  #      #   #   #  #    #    #   #  #   #
//   ###    ###   #   #  #   #   ###    ###     ##    ###    ###   #   #
/**
 * A class that handles calls to Redis.
 */
class Connection {
    //                   ##
    //                    #
    // ###    ##    ##    #
    // #  #  #  #  #  #   #
    // #  #  #  #  #  #   #
    // ###    ##    ##   ###
    // #
    /**
     * Gets the pool to get a Redis client.
     * @returns {GenericPool.Pool<IoRedis.Redis>} A promise that returns the Redis client.
     */
    static get pool() {
        if (!pool) {
            pool = GenericPool.createPool({
                create: () => {
                    /** @type {IoRedis.Redis} */
                    let client;

                    try {
                        client = new IoRedis(Redis.options);
                    } catch (err) {
                        if (client) {
                            client.removeAllListeners().disconnect();
                        }
                        return Promise.reject(err);
                    }

                    return new Promise((res, rej) => {
                        client.on("ready", () => {
                            res(client);
                        });

                        client.on("error", (err) => {
                            if (client) {
                                client.removeAllListeners().disconnect();
                            }

                            rej(err);
                        });
                    });
                },
                destroy: (client) => Promise.resolve(client.removeAllListeners().disconnect()),
                validate: (client) => Promise.resolve(client.status === "ready")
            }, {
                max: 50,
                min: 0,
                autostart: true,
                testOnBorrow: true,
                testOnReturn: true,
                idleTimeoutMillis: 300000
            });

            pool.on("factoryCreateError", (err) => {
                Redis.eventEmitter.emit("error", {err, message: "There was an error creating a Redis object in the pool."});
            });

            pool.on("factoryDestroyError", (err) => {
                Redis.eventEmitter.emit("error", {err, message: "There was an error destroying a Redis object in the pool."});
            });
        }

        return pool;
    }
}

module.exports = Connection;
