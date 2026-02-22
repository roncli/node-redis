const Pool = require("../pool");

// MARK: Pool
describe("Pool", () => {
    let created = 0;
    let destroyed = 0;
    let validated = 0;
    let throwOnValidate = false;

    beforeEach(() => {
        created = 0;
        destroyed = 0;
        validated = 0;
        throwOnValidate = false;
    });

    /**
     * Creates a new resource with a unique id and tracks the number of times create, destroy, and validate are called.
     * @returns {object} A new resource with a unique id.
     */
    const create = () => {
        created++;
        return {id: created, valid: true};
    };

    /**
     * Destroys a resource and tracks the number of times destroy is called.
     * @param {any} _res The resource to destroy.
     * @returns {void}
     */
    const destroy = (_res) => {
        destroyed++;
    };

    /**
     * Validates a resource and tracks the number of times validate is called.
     * @param {any} _res The resource to validate.
     * @returns {boolean} Always returns true to indicate the resource is valid.
     */
    const validate = (_res) => {
        validated++;
        if (throwOnValidate) {
            throw new Error("Validation failed");
        }
        return _res.valid;
    };

    // MARK: Success
    describe("Success", () => {
        test("should create and acquire a resource", async () => {
            const pool = new Pool({create, destroy, min: 1, max: 2});
            await pool.start();

            const res = await pool.acquire();
            expect(res).toBeDefined();
            expect(created).toBe(1);

            await pool.release(res);
        });

        test("should not exceed max resources", async () => {
            const pool = new Pool({create, destroy, min: 0, max: 2});
            const res1 = await pool.acquire();
            const res2 = await pool.acquire();

            let acquired = false;
            const p = pool.acquire().then(() => {
                acquired = true;
            });

            await new Promise((r) => {
                setTimeout(r, 10);
            });
            expect(acquired).toBe(false);

            await pool.release(res1);
            await p;
            expect(acquired).toBe(true);

            await pool.release(res2);
        });

        test("should destroy a resource and maintain min", async () => {
            const pool = new Pool({create, destroy, min: 1, max: 2});
            await pool.start();

            const res = await pool.acquire();
            await pool.release(res);
            await pool.destroy(res);
            expect(destroyed).toBe(1);
            expect(created).toBe(2);
        });

        test("should validate resources if validate is provided", async () => {
            const pool = new Pool({create, destroy, validate, min: 1, max: 2});
            await pool.start();

            const res = await pool.acquire();
            await pool.release(res);
            expect(validated).toBeGreaterThan(0);
        });

        test("when validation fails on a resource in the pool, it should be destroyed on acquire", async () => {
            const pool = new Pool({create, destroy, validate, min: 1, max: 2});
            await pool.start();

            const res = await pool.acquire();
            await pool.release(res);

            res.valid = false;
            const res2 = await pool.acquire();
            expect(res2).not.toBe(res);
            expect(destroyed).toBe(1);
        });

        test("when validation throws on a resource in the pool, it should be destroyed on acquire", async () => {
            const pool = new Pool({create, destroy, validate, min: 1, max: 2});
            await pool.start();

            const res = await pool.acquire();
            await pool.release(res);

            throwOnValidate = true;
            const res2 = await pool.acquire();
            expect(res2).not.toBe(res);
            expect(destroyed).toBe(1);
        });

        test("should constrain options to valid values", async () => {
            const pool = new Pool({create, destroy, validate, min: -1, max: 0});
            await pool.start();
            expect(pool.active).toBe(0);

            const res1 = await pool.acquire();

            let acquired = false;
            const p = pool.acquire().then(() => {
                acquired = true;
            });

            await new Promise((r) => {
                setTimeout(r, 10);
            });
            expect(acquired).toBe(false);

            await pool.release(res1);
            await p;
            expect(acquired).toBe(true);
        });

        test("should set min to max if min is greater than max", async () => {
            const pool = new Pool({create, destroy, validate, min: 3, max: 2});
            await pool.start();
            expect(pool.active).toBe(2);
        });

        test("destroy should create new resources to satisfy queue if under max", async () => {
            const pool = new Pool({create, destroy, validate, min: 0, max: 2});
            await pool.start();

            const res1 = await pool.acquire();
            const res2 = await pool.acquire();

            let acquired = false;
            const p = pool.acquire().then(() => {
                acquired = true;
            });

            await new Promise((r) => {
                setTimeout(r, 10);
            });
            expect(acquired).toBe(false);

            await pool.destroy(res1);
            await p;
            expect(acquired).toBe(true);

            await pool.release(res2);
        });
    });

    // MARK: Failure
    describe("Failure", () => {
        /**
         * A create function that always throws an error to simulate a failure during resource creation.
         * @returns {never} This function always throws an error and never returns a value.
         */
        const createFailed = () => {
            throw new Error("Create failed");
        };

        test("should throw if options are invalid", () => {
            // @ts-ignore Testing missing create function.
            expect(() => new Pool({destroy})).toThrow();
            // @ts-ignore Testing missing destroy function.
            expect(() => new Pool({create})).toThrow();
            // @ts-ignore Testing invalid create type.
            expect(() => new Pool({create: 1, destroy, validate})).toThrow();
            // @ts-ignore Testing invalid destroy type.
            expect(() => new Pool({create, destroy: 1, validate})).toThrow();
            // @ts-ignore Testing invalid validate type.
            expect(() => new Pool({create, destroy, validate: 1})).toThrow();
            // @ts-ignore Testing invalid min type.
            expect(() => new Pool({create, destroy, validate, min: "a"})).toThrow();
            // @ts-ignore Testing invalid max type.
            expect(() => new Pool({create, destroy, validate, max: "b"})).toThrow();
        });

        test("acquire should throw if create throws", async () => {
            const pool = new Pool({
                create: createFailed,
                destroy
            });
            await pool.start();
            await expect(pool.acquire()).rejects.toThrow("Create failed");
        });

        test("destroy should throw if resource is not from the pool", async () => {
            const pool = new Pool({create, destroy});
            await pool.start();
            await expect(pool.destroy({})).rejects.toThrow("Resource not found in pool");
        });

        test("release should throw if resource is not from the pool", async () => {
            const pool = new Pool({create, destroy});
            await pool.start();
            await expect(pool.release({})).rejects.toThrow("Resource not found in pool");
        });

        test("release should throw if resource is not allocated", async () => {
            const pool = new Pool({create, destroy, min: 1});
            await pool.start();

            const res = await pool.acquire();
            await pool.release(res);
            await expect(pool.release(res)).rejects.toThrow("Resource not currently allocated");
        });
    });
});
