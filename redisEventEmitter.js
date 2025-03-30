const EventEmitter = require("events").EventEmitter;

// MARK: class RedisEventEmitter
/**
 * An event emitter that emits events specified by this library.
 */
class RedisEventEmitter extends EventEmitter {}

module.exports = RedisEventEmitter;
