require("./setup");
const Redis = require("../index");

// MARK: index.js
describe("index.js", () => {
    test("Cache getter returns Cache", () => {
        expect(Redis.Cache).toBeDefined();
    });

    test("HashCache getter returns HashCache", () => {
        expect(Redis.HashCache).toBeDefined();
    });

    test("SortedSetCache getter returns SortedSetCache", () => {
        expect(Redis.SortedSetCache).toBeDefined();
    });

    test("setup does not throw", () => {
        expect(() => Redis.setup({host: "127.0.0.1", port: 6379, password: ""})).not.toThrow();
    });

    test("getClient returns a client", async () => {
        Redis.setup({host: "127.0.0.1", port: 6379, password: ""});

        const client = await Redis.getClient();
        expect(client).toBeDefined();
        expect(typeof client.set).toBe("function");
    });
});
