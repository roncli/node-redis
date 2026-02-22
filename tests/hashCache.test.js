require("./setup");
const Connection = require("../connection"),
    HashCache = require("../hashCache");

// MARK: HashCache
describe("HashCache", () => {
    // MARK: Success
    describe("Success", () => {
        const key = "test-hash";
        const obj = {key: "field1", value: {foo: "bar"}};

        beforeEach(() => {
            Connection.setup({host: "localhost", port: 6379, password: ""});
        });

        afterEach(async () => {
            await HashCache.add(key, [], void 0, []);
        });

        test("add and get", async () => {
            await HashCache.add(key, [obj]);

            const result = await HashCache.get(key, obj.key);
            expect(result).toEqual(obj.value);
        });

        test("add and get date value", async () => {
            const dateValue = new Date();
            await HashCache.add(key, [{key: obj.key, value: dateValue}]);

            const result = await HashCache.get(key, obj.key);
            expect(result).toEqual(dateValue);
        });

        test("add and get with invalidation list", async () => {
            const invalidateList = "test-invalidate-list";
            await HashCache.add(key, [obj], void 0, [invalidateList]);

            const result = await HashCache.get(key, obj.key);
            expect(result).toEqual(obj.value);
        });

        test("add and get with expiration", async () => {
            const expireDate = new Date(Date.now() + 1000);
            await HashCache.add(key, [obj], expireDate);

            const result = await HashCache.get(key, obj.key);
            expect(result).toEqual(obj.value);
        });

        test("get on non-existent hash returns undefined", async () => {
            const result = await HashCache.get(key, "non-existent-field");
            expect(result).toBeUndefined();
        });

        test("exists returns true for existing hash", async () => {
            await HashCache.add(key, [obj]);

            const exists = await HashCache.exists(key, obj.key);
            expect(exists).toBe(true);
        });

        test("exists returns false for non-existent hash", async () => {
            const exists = await HashCache.exists(key, "non-existent-field");
            expect(exists).toBe(false);
        });
    });

    // MARK: Failure
    describe("Failure", () => {
        beforeEach(() => {
            Connection.setup({host: "localhost", port: 6379, password: "Create Error"});
        });

        test("calling all HashCache functions throws error when connection fails", async () => {
            await expect(HashCache.add("key", [{key: "field", value: "value"}])).rejects.toThrow();
            await expect(HashCache.exists("key", "field")).rejects.toThrow();
            await expect(HashCache.get("key", "field")).rejects.toThrow();
        });
    });
});
