/**
 * @typedef {import("./redisEventEmitter")} RedisEventEmitter
 */

const GenericPool = require("generic-pool"),
    IoRedis = require("ioredis");

/** @type {GenericPool.Pool<IoRedis.Redis>} */
let pool;

/** @type {RedisEventEmitter} */
let redisEventEmitter;

/** @type {{host: string, port: number, password: string}} */
let redisOptions;

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
    //               #
    //               #
    //  ###    ##   ###   #  #  ###
    // ##     # ##   #    #  #  #  #
    //   ##   ##     #    #  #  #  #
    // ###     ##     ##   ###  ###
    //                          #
    /**
     * Sets up the options to use with Redis.
     * @param {{host: string, port: number, password: string}} options The connection options.
     * @param {RedisEventEmitter} eventEmitter The event emitter to use for errors.
     * @returns {void}
     */
    static setup(options, eventEmitter) {
        redisOptions = options;
        redisEventEmitter = eventEmitter;
    }

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
                        client = new IoRedis(redisOptions);
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
                redisEventEmitter.emit("error", {err, message: "There was an error creating a Redis object in the pool."});
            });

            pool.on("factoryDestroyError", (err) => {
                redisEventEmitter.emit("error", {err, message: "There was an error destroying a Redis object in the pool."});
            });
        }

        return pool;
    }
}

module.exports = Connection;
