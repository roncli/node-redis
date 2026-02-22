require("./setup");
const Cache = require("../cache"),
    Connection = require("../connection");

// MARK: Cache
describe("Cache", () => {
    // MARK: Success
    describe("Success", () => {
        const key = "test-key";
        const value = {foo: "bar"};

        beforeEach(() => {
            Connection.setup({host: "localhost", port: 6379, password: ""});
        });

        afterEach(async () => {
            await Cache.flush();
        });

        test("add and get", async () => {
            await Cache.add(key, value);

            const result = await Cache.get(key);
            expect(result).toEqual(value);
        });

        test("add and get date value", async () => {
            const dateValue = new Date();
            await Cache.add(key, dateValue);

            const result = await Cache.get(key);
            expect(result).toEqual(dateValue);
        });

        test("add, get, and expireAt with expiration", async () => {
            const expireDate = new Date(Date.now() + 1000);
            await Cache.add(key, value, expireDate);

            const result = await Cache.get(key, expireDate);
            expect(result).toEqual(value);
            await Cache.expireAt(key, new Date(Date.now() + 2000));

            const result2 = await Cache.get(key, new Date(Date.now() + 2000));
            expect(result2).toEqual(value);
        });

        test("add with invalidation list", async () => {
            const invalidateList = "test-invalidate-list";
            await Cache.add(key, value, void 0, [invalidateList]);

            const result = await Cache.get(key);
            expect(result).toEqual(value);
        });

        test("exists returns true for existing key", async () => {
            await Cache.add(key, value);

            const exists = await Cache.exists([key]);
            expect(exists).toBe(true);
        });

        test("exists returns false for non-existent key", async () => {
            const exists = await Cache.exists([key]);
            expect(exists).toBe(false);
        });

        test("remove deletes key", async () => {
            await Cache.add(key, value);
            await Cache.remove([key]);

            const exists = await Cache.exists([key]);
            expect(exists).toBe(false);
        });

        test("flush clears all keys", async () => {
            await Cache.add(key, value);
            await Cache.flush();

            const exists = await Cache.exists([key]);
            expect(exists).toBe(false);
        });

        test("get all keys with pattern", async () => {
            const numericKeys = Array.from({length: 3}, () => Math.floor(Math.random() * 1e12).toString());
            const keys = ["key1", "key2", ...numericKeys, "key3", "lock4"];
            await Promise.all(keys.map((k) => Cache.add(k, value)));

            const result = await Cache.getAllKeys("key");
            expect(result.sort()).toEqual(["key1", "key2", "key3"]);
        });

        test("get all keys without pattern", async () => {
            const numericKeys = Array.from({length: 3}, () => Math.floor(Math.random() * 1e12).toString());
            const keys = ["key1", "key2", ...numericKeys, "key3", "lock4"];
            await Promise.all(keys.map((k) => Cache.add(k, value)));

            const result = await Cache.getAllKeys();
            expect(result.sort()).toEqual(keys.sort());
        });

        test("invalidate keys with invalidate list", async () => {
            const invalidateList = "test-invalidate-list";
            const key1 = "key1";
            const key2 = "key2";
            await Cache.add(key1, value, void 0, [invalidateList]);
            await Cache.add(key2, value, void 0, [invalidateList]);
            await Cache.invalidate([invalidateList]);

            const exists1 = await Cache.exists([key1]);
            const exists2 = await Cache.exists([key2]);
            expect(exists1).toBe(false);
            expect(exists2).toBe(false);
        });

        test("invalidate keys with empty invalidation list", async () => {
            const invalidateList = "test-invalidate-list";
            const key1 = "key1";
            const key2 = "key2";
            await Cache.add(key1, value);
            await Cache.add(key2, value);
            await Cache.invalidate([invalidateList]);

            const exists1 = await Cache.exists([key1]);
            const exists2 = await Cache.exists([key2]);
            expect(exists1).toBe(true);
            expect(exists2).toBe(true);
        });

        test("ttl returns -1 since we're only mocking the function", async () => {
            const ttl = await Cache.ttl("any-key");
            expect(ttl).toBe(-1);
        });

        test("get non-existent key returns undefined", async () => {
            const result = await Cache.get("non-existent-key");
            expect(result).toBeUndefined();
        });
    });

    // MARK: Failure
    describe("Failure", () => {
        beforeEach(() => {
            Connection.setup({host: "localhost", port: 6379, password: "Create Error"});
        });

        test("calling all Cache functions throws error when connection fails", async () => {
            await expect(Cache.add("key", "value")).rejects.toThrow("Mock create error");
            await expect(Cache.get("key")).rejects.toThrow("Mock create error");
            await expect(Cache.getAllKeys()).rejects.toThrow("Mock create error");
            await expect(Cache.exists(["key"])).rejects.toThrow("Mock create error");
            await expect(Cache.remove(["key"])).rejects.toThrow("Mock create error");
            await expect(Cache.flush()).rejects.toThrow("Mock create error");
            await expect(Cache.expireAt("key", new Date())).rejects.toThrow("Mock create error");
            await expect(Cache.invalidate(["list"])).rejects.toThrow("Mock create error");
            await expect(Cache.ttl("key")).rejects.toThrow("Mock create error");
        });
    });
});
