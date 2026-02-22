require("./setup");
const Cache = require("../cache"),
    Connection = require("../connection"),
    SortedSetCache = require("../sortedSetCache");

// MARK: SortedSetCache
describe("SortedSetCache", () => {
    const key = "test-sorted-set";
    const objs = [
        {score: 1, value: "a"},
        {score: 2, value: "b"}
    ];

    // MARK: Success
    describe("Success", () => {
        const key2 = "test-sorted-set-2";
        const objs2 = [
            {score: 3, value: "c"},
            {score: 4, value: "d"}
        ];
        const combinedKey = "combined-sorted-set";
        const invalidateList = "test-invalidate-list";

        afterEach(async () => {
            await Cache.remove([key]);
        });

        test("add and get", async () => {
            await SortedSetCache.add(key, objs);
            expect(await SortedSetCache.get(key, 0, -1)).toEqual(["a", "b"]);
        });

        test("add and get date value", async () => {
            const dateValue = new Date();
            await SortedSetCache.add(key, [{score: 1, value: dateValue}]);
            const result = await SortedSetCache.get(key, 0, -1);
            expect(result).toEqual([dateValue]);
        });

        test("add and get with scores", async () => {
            await SortedSetCache.add(key, objs);
            const result = await SortedSetCache.get(key, 0, -1, true);
            expect(result).toEqual([
                {value: "a", score: 1},
                {value: "b", score: 2}
            ]);
        });

        test("add and get with scores and date value", async () => {
            const dateValue = new Date();
            await SortedSetCache.add(key, [{score: 1, value: dateValue}]);
            const result = await SortedSetCache.get(key, 0, -1, true);
            expect(result).toEqual([{value: dateValue, score: 1}]);
        });

        test("add and get with invalidation list", async () => {
            await SortedSetCache.add(key, objs, void 0, [invalidateList]);
            const result = await SortedSetCache.get(key, 0, -1);
            expect(result).toEqual(["a", "b"]);
        });

        test("add and get with expiration", async () => {
            const expireDate = new Date(Date.now() + 1000);
            await SortedSetCache.add(key, objs, expireDate);
            const result = await SortedSetCache.get(key, 0, -1, false);
            expect(result).toEqual(["a", "b"]);
        });

        test("get with no items returns undefined", async () => {
            const result = await SortedSetCache.get(key, 0, -1);
            expect(result).toBeUndefined();
        });

        test("get with no items and with scores returns undefined", async () => {
            const result = await SortedSetCache.get(key, 0, -1, true);
            expect(result).toBeUndefined();
        });

        test("get with min greater than max returns empty array", async () => {
            await SortedSetCache.add(key, objs);
            const result = await SortedSetCache.get(key, 1, 0);
            expect(result).toEqual([]);
        });

        test("get with min greater than length of set returns empty array", async () => {
            await SortedSetCache.add(key, objs);
            const result = await SortedSetCache.get(key, 10, 20);
            expect(result).toEqual([]);
        });

        test("get with negative start works", async () => {
            await SortedSetCache.add(key, objs);
            const result = await SortedSetCache.get(key, -1, -1);
            expect(result).toEqual(["b"]);
        });

        test("count returns correct number", async () => {
            await SortedSetCache.add(key, objs);
            expect(await SortedSetCache.count(key, "-inf", "+inf")).toBe(2);
        });

        test("count returns correct number with score range", async () => {
            await SortedSetCache.add(key, objs);
            expect(await SortedSetCache.count(key, 1.5, 2.5)).toBe(1);
        });

        test("combine works", async () => {
            await SortedSetCache.add(key, objs);
            await SortedSetCache.add(key2, objs2);
            await SortedSetCache.combine(combinedKey, [key, key2]);
            const result = await SortedSetCache.get(combinedKey, 0, -1);
            expect(result).toEqual(["a", "b", "c", "d"]);
        });

        test("combine with invalidation list works", async () => {
            await SortedSetCache.add(key, objs);
            await SortedSetCache.add(key2, objs2);
            await SortedSetCache.combine(combinedKey, [key, key2], void 0, [invalidateList]);
            const result = await SortedSetCache.get(combinedKey, 0, -1);
            expect(result).toEqual(["a", "b", "c", "d"]);
        });

        test("combine with invalid key works", async () => {
            await SortedSetCache.add(key, objs);
            await SortedSetCache.combine(combinedKey, [key, "non-existent-key"]);
            const result = await SortedSetCache.get(combinedKey, 0, -1);
            expect(result).toEqual(["a", "b"]);
        });

        test("combine with expiration works", async () => {
            const expireDate = new Date(Date.now() + 1000);
            await SortedSetCache.add(key, objs);
            await SortedSetCache.add(key2, objs2);
            await SortedSetCache.combine(combinedKey, [key, key2], expireDate);
            const result = await SortedSetCache.get(combinedKey, 0, -1);
            expect(result).toEqual(["a", "b", "c", "d"]);
        });

        test("getReverse works", async () => {
            await SortedSetCache.add(key, objs);
            const result = await SortedSetCache.getReverse(key, 0, -1);
            expect(result).toEqual(["b", "a"]);
        });

        test("getReverse with scores works", async () => {
            await SortedSetCache.add(key, objs);
            const result = await SortedSetCache.getReverse(key, 0, -1, true);
            expect(result).toEqual([
                {value: "b", score: 2},
                {value: "a", score: 1}
            ]);
        });

        test("getReverse with no items returns undefined", async () => {
            const result = await SortedSetCache.getReverse(key, 0, -1);
            expect(result).toBeUndefined();
        });

        test("getReverse with no items and with scores returns undefined", async () => {
            const result = await SortedSetCache.getReverse(key, 0, -1, true);
            expect(result).toBeUndefined();
        });

        test("getReverse with date value works", async () => {
            const dateValue = new Date();
            await SortedSetCache.add(key, [{score: 1, value: dateValue}]);
            const result = await SortedSetCache.getReverse(key, 0, -1);
            expect(result).toEqual([dateValue]);
        });

        test("getReverse with scores and date value works", async () => {
            const dateValue = new Date();
            await SortedSetCache.add(key, [{score: 1, value: dateValue}]);
            const result = await SortedSetCache.getReverse(key, 0, -1, true);
            expect(result).toEqual([{value: dateValue, score: 1}]);
        });

        test("rank works", async () => {
            await SortedSetCache.add(key, objs);
            const rankA = await SortedSetCache.rank(key, "a");
            const rankB = await SortedSetCache.rank(key, "b");
            expect(rankA).toBe(0);
            expect(rankB).toBe(1);
        });

        test("rank on non-existent value returns null", async () => {
            await SortedSetCache.add(key, objs);
            const rank = await SortedSetCache.rank(key, "non-existent");
            expect(rank).toBeNull();
        });

        test("rank on non-existent key returns null", async () => {
            const rank = await SortedSetCache.rank("non-existent-key", "a");
            expect(rank).toBeNull();
        });

        test("rankReverse works", async () => {
            await SortedSetCache.add(key, objs);
            const rankA = await SortedSetCache.rankReverse(key, "a");
            const rankB = await SortedSetCache.rankReverse(key, "b");
            expect(rankA).toBe(1);
            expect(rankB).toBe(0);
        });

        test("rankReverse on non-existent value returns null", async () => {
            await SortedSetCache.add(key, objs);
            const rank = await SortedSetCache.rankReverse(key, "non-existent");
            expect(rank).toBeNull();
        });

        test("rankReverse on non-existent key returns null", async () => {
            const rank = await SortedSetCache.rankReverse("non-existent-key", "a");
            expect(rank).toBeNull();
        });
    });

    // MARK: Failure
    describe("Failure", () => {
        beforeEach(() => {
            Connection.setup({host: "localhost", port: 6379, password: "Create Error"});
        });

        test("calling all SortedSetCache functions throws error when connection fails", async () => {
            await expect(SortedSetCache.add(key, objs)).rejects.toThrow("Mock create error");
            await expect(SortedSetCache.combine("combined-key", [key])).rejects.toThrow("Mock create error");
            await expect(SortedSetCache.count(key, "-inf", "+inf")).rejects.toThrow("Mock create error");
            await expect(SortedSetCache.get(key, 0, -1)).rejects.toThrow("Mock create error");
            await expect(SortedSetCache.getReverse(key, 0, -1)).rejects.toThrow("Mock create error");
            await expect(SortedSetCache.rank(key, "a")).rejects.toThrow("Mock create error");
            await expect(SortedSetCache.rankReverse(key, "a")).rejects.toThrow("Mock create error");
        });
    });
});
