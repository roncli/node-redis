globalThis.RedisStore = {...globalThis.RedisStore};

jest.mock("ioredis", () => {
    const store = globalThis.RedisStore;

    /**
     * A mock implementation of the ioredis library for testing purposes.
     * @param {object} options The options for the Redis client.
     * @returns {object} An object that mimics the ioredis Redis client.
     */
    const Redis = function (options) {
        if (options && options.password === "Create Error") {
            throw new Error("Mock create error");
        }

        const client = {
            status: "",

            del: jest.fn((...args) => {
                let deleted = 0;
                for (const k of args) {
                    if (Object.hasOwn(store, k)) {
                        delete store[k];
                        deleted++;
                    }
                }
                return Promise.resolve(deleted);
            }),

            disconnect: jest.fn(() => {
                client.status = "disconnected";
                return Promise.resolve();
            }),

            exists: jest.fn((...keys) => {
                const count = keys.reduce((acc, k) => acc + (Object.hasOwn(store, k) ? 1 : 0), 0);
                return Promise.resolve(count);
            }),

            flushdb: jest.fn(() => {
                for (const k of Object.keys(store)) {
                    delete store[k];
                }
                return Promise.resolve("OK");
            }),

            get: jest.fn((key) => Promise.resolve(store[key] || null)),

            hget: jest.fn((key, field) => Promise.resolve(store[key]?.[field] || null)),

            hexists: jest.fn((key, field) => Promise.resolve(store[key]?.[field] ? 1 : 0)),

            hset: jest.fn((key, ...args) => {
                if (!store[key]) {
                    store[key] = {};
                }
                for (let i = 0; i < args.length; i += 2) {
                    store[key][args[i]] = args[i + 1];
                }
                return Promise.resolve("OK");
            }),

            on: jest.fn((event, callback) => {
                if (event === "ready" && (!options || options.password !== "Client Error")) {
                    client.status = "ready";
                    setTimeout(callback, 100);
                }

                if (event === "error" && options && options.password === "Client Error") {
                    client.status = "error";
                    setTimeout(() => callback(new Error("Mock client error")), 100);
                }
            }),

            pexpireat: jest.fn(() => Promise.resolve(1)),

            sadd: jest.fn((key, value) => {
                if (!store[key]) {
                    store[key] = new Set();
                }
                store[key].add(value);
                return Promise.resolve(1);
            }),

            scan: jest.fn((...args) => {
                const [cursor] = args;

                const matchPatternIndex = args.indexOf("MATCH");
                let pattern;
                if (matchPatternIndex !== -1) {
                    pattern = args[matchPatternIndex + 1];
                }

                const count = 1;

                const start = Number(cursor);
                const end = start + count;
                const allKeys = Object.keys(store);
                let page = allKeys.slice(start, end);
                if (pattern) {
                    const regex = new RegExp(pattern);
                    const filtered = [];
                    for (let i = 0; i < page.length; ++i) {
                        if (regex.test(page[i])) {
                            filtered.push(page[i]);
                        }
                    }
                    page = filtered;
                }
                return Promise.resolve([end >= allKeys.length ? "0" : end.toString(), page]);
            }),

            set: jest.fn((key, value) => {
                store[key] = value;
                return Promise.resolve("OK");
            }),

            smembers: jest.fn((key) => {
                const val = store[key] ? Array.from(store[key]) : [];
                return Promise.resolve(val);
            }),

            ttl: jest.fn(() => Promise.resolve(-1)),

            zadd: jest.fn((key, ...args) => {
                if (!store[key]) {
                    store[key] = [];
                }
                for (let i = 0; i < args.length; i += 2) {
                    store[key].push({score: Number(args[i]), value: args[i + 1]});
                }
                store[key].sort((/** @type {{ score: number; }} */ a, /** @type {{ score: number; }} */ b) => a.score - b.score);
                return Promise.resolve(store[key].length);
            }),

            zcount: jest.fn((key, min, max) => {
                const arr = store[key];
                const minScore = min === "-inf" ? -Infinity : Number(min);
                const maxScore = max === "+inf" ? Infinity : Number(max);
                return Promise.resolve(arr.filter((/** @type {{ score: number; }} */ e) => e.score >= minScore && e.score <= maxScore).length);
            }),

            zrange: jest.fn((key, start, stop, ...args) => {
                // If there are no items or the key doesn't exist, return undefined.
                if (!store[key]) {
                    return Promise.resolve(void 0);
                }

                // Redis zrange can be called as zrange(key, start, stop, 'WITHSCORES')
                const withScores = typeof args[0] === "string" && args[0].toUpperCase() === "WITHSCORES";

                const arr = store[key].slice();
                const len = arr.length;
                const min = start < 0 ? Math.max(len + start, 0) : start;
                let max = stop < 0 ? len + stop : stop;
                max = Math.min(max, len - 1);
                if (min > max || min >= len) {
                    return Promise.resolve([]);
                }
                const sliced = arr.slice(min, max + 1);

                if (withScores) {
                    // Return [value, score, value, score, ...]
                    const result = [];
                    for (const e of sliced) {
                        result.push(e.value, e.score.toString());
                    }
                    return Promise.resolve(result);
                }
                return Promise.resolve(sliced.map((/** @type {{ value: any; }} */ e) => e.value));
            }),

            zrank: jest.fn((key, member) => {
                const arr = store[key] || [];
                const index = arr.findIndex((/** @type {{ value: any; }} */ e) => e.value === member);
                return Promise.resolve(index >= 0 ? index : null);
            }),

            zrevrange: jest.fn((key, start, stop, ...args) => {
                // If there are no items or the key doesn't exist, return undefined.
                if (!store[key]) {
                    return Promise.resolve(void 0);
                }

                // Temporarily reverse the array for this call
                store[key].reverse();
                // Call zrange with the reversed array
                const result = client.zrange(key, start, stop, ...args);
                // Restore the original order
                store[key].reverse();
                return result;
            }),

            zrevrank: jest.fn((key, member) => {
                const arr = store[key] || [];
                const index = arr.findIndex((/** @type {{ value: any; }} */ e) => e.value === member);
                return Promise.resolve(index >= 0 ? arr.length - 1 - index : null);
            }),

            zunionstore: jest.fn((dest, numKeys, ...keys) => {
                let combined = [];
                for (let i = 0; i < numKeys; i++) {
                    const key = keys[i];
                    combined = combined.concat(store[key] || []);
                }
                const map = new Map();
                for (const item of combined) {
                    if (!map.has(item.value)) {
                        map.set(item.value, 0);
                    }
                    map.set(item.value, map.get(item.value) + item.score);
                }
                store[dest] = Array.from(map.entries()).map(([value, score]) => ({value, score}));
                return Promise.resolve(store[dest].length);
            })
        };

        return client;
    };

    return {Redis};
});

module.exports = {};
