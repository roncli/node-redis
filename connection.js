/**
 * @typedef {import("./redisEventEmitter")} RedisEventEmitter
 */

const IoRedis = require("ioredis"),
    Pool = require("./pool");

// MARK: class Connection
/**
 * A class that handles calls to Redis.
 */
class Connection {
    /** @type {Pool} */
    static #pool;

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
            return Promise.reject(err);
        }

        return new Promise((res, rej) => {
            client.on("ready", () => {
                res(client);
            });

            client.on("error", (err) => {
                client.disconnect();
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
        return Promise.resolve(client.disconnect());
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
     * @returns {void}
     */
    static setup(options) {
        Connection.#redisOptions = options;
    }

    // MARK: static get pool
    /**
     * Gets the pool to get a Redis client.
     * @returns {Pool} A promise that returns the Redis client.
     */
    static get pool() {
        if (!Connection.#pool) {
            Connection.#pool = new Pool({
                create: Connection.#create,
                destroy: Connection.#destroy,
                validate: Connection.#validate,
                max: 50,
                min: 0
            });
        }

        return Connection.#pool;
    }
}

module.exports = Connection;
