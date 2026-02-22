require("./setup");

const Connection = require("../connection");

// MARK: Connection
describe("Connection", () => {
    // MARK: Success
    describe("Success", () => {
        test("setup sets redis options", () => {
            expect(() => Connection.setup({host: "127.0.0.1", port: 6379, password: ""})).not.toThrow();
        });

        test("pool returns a pool instance", () => {
            Connection.setup({host: "127.0.0.1", port: 6379, password: ""});

            const {pool} = Connection;
            expect(pool).toBeDefined();
            expect(typeof pool.acquire).toBe("function");
        });

        test("acquire returns a redis client", async () => {
            Connection.setup({host: "127.0.0.1", port: 6379, password: ""});

            const client = await Connection.pool.acquire();
            expect(client).toBeDefined();
            expect(typeof client.set).toBe("function");
            await Connection.pool.release(client);
        });
    });

    // MARK: Failure
    describe("Failure", () => {
        test("should handle acquisition errors", async () => {
            Connection.setup({host: "127.0.0.1", port: 6379, password: "Create Error"});
            await expect(Connection.pool.acquire()).rejects.toThrow("Mock create error");
        });

        test("should handle client errors", async () => {
            Connection.setup({host: "127.0.0.1", port: 6379, password: "Client Error"});
            await expect(Connection.pool.acquire()).rejects.toThrow("Mock client error");
        });
    });
});
