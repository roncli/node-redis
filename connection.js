/**
 * @typedef {import("./redisEventEmitter")} RedisEventEmitter
 */

const GenericPool = require("generic-pool"),
    IoRedis = require("ioredis");

// MARK: class Connection
/**
 * A class that handles calls to Redis.
 */
class Connection {
    /** @type {GenericPool.Pool<IoRedis.Redis>} */
    static #pool;

    /** @type {RedisEventEmitter} */
    static #redisEventEmitter;

    /** @type {{host: string, port: number, password: string}} */
    static #redisOptions;

    // MARK: static #create
    /**
     * Creates a Redis client.
     * @returns {Promise<IoRedis.Redis>} A promise that returns the Redis client.
     * @throws {Error} If there was an error creating the Redis client.
     */
    static #create() {
        /** @type {IoRedis.Redis} */
        let client;

        try {
            client = new IoRedis.Redis(Connection.#redisOptions);
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
    }

    // MARK: static #destroy
    /**
     * Releases a Redis client.
     * @param {IoRedis.Redis} client The Redis client to release.
     * @returns {Promise<void>}
     */
    static #destroy(client) {
        return Promise.resolve(client.removeAllListeners().disconnect());
    }

    // MARK: static #validate
    /**
     * Validates a Redis client.
     * @param {IoRedis.Redis} client The Redis client to validate.
     * @returns {Promise<boolean>} A promise that returns whether the client is valid or not.
     */
    static #validate(client) {
        return Promise.resolve(client.status === "ready");
    }

    // MARK: static setup
    /**
     * Sets up the options to use with Redis.
     * @param {{host: string, port: number, password: string}} options The connection options.
     * @param {RedisEventEmitter} eventEmitter The event emitter to use for errors.
     * @returns {void}
     */
    static setup(options, eventEmitter) {
        Connection.#redisOptions = options;
        Connection.#redisEventEmitter = eventEmitter;
    }

    // MARK: static get pool
    /**
     * Gets the pool to get a Redis client.
     * @returns {GenericPool.Pool<IoRedis.Redis>} A promise that returns the Redis client.
     */
    static get pool() {
        if (!Connection.#pool) {
            Connection.#pool = GenericPool.createPool({
                create: Connection.#create,
                destroy: Connection.#destroy,
                validate: Connection.#validate
            }, {
                max: 50,
                min: 0,
                autostart: true,
                testOnBorrow: true,
                testOnReturn: true,
                idleTimeoutMillis: 300000
            });

            Connection.#pool.on("factoryCreateError", (err) => {
                Connection.#redisEventEmitter.emit("error", {err, message: "There was an error creating a Redis object in the pool."});
            });

            Connection.#pool.on("factoryDestroyError", (err) => {
                Connection.#redisEventEmitter.emit("error", {err, message: "There was an error destroying a Redis object in the pool."});
            });
        }

        return Connection.#pool;
    }
}

module.exports = Connection;
