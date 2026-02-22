/**
 * @typedef {import("./poolOptions").Options} Pool.Options
 */

// MARK: class Pool
/**
 * A class that manages a pool of Redis clients using the generic-pool library.
 */
class Pool {
    /** @type {Pool.Options} */
    #options = null;

    /** @type {Array<(res: any) => void>} */
    #queue = [];

    /** @type {{resource: any, allocated: boolean}[]} */
    #resources = [];

    // MARK: get active
    /**
     * Gets the number of active resources in the pool.
     * @returns {Number} The number of active resources in the pool.
     */
    get active() {
        return this.#resources.length;
    }

    // MARK: async #createResource
    /**
     * Creates a new resource using the create function provided in the options.
     * @returns {Promise<any>} A promise that resolves to the newly created resource.
     */
    async #createResource() {
        const res = await Promise.resolve(this.#options.create());
        this.#resources.push({resource: res, allocated: false});
        return res;
    }

    // MARK: async #ensureMinResources
    /**
     * Ensures the pool has at least min resources, creating them sequentially.
     * @returns {Promise<void>}
     */
    async #ensureMinResources() {
        // Validate all existing free resources, destroying any that are not valid.
        if (this.#options.validate) {
            let promise = Promise.resolve();
            for (const entry of this.#resources.filter((r) => !r.allocated)) {
                promise = promise.then(async () => {
                    try {
                        if (!await this.#validate(entry.resource)) {
                            await this.destroy(entry.resource, true);
                        }
                    } finally { } // eslint-disable-line no-empty -- If destroy throws, we still want to continue validating the rest of the resources and creating new ones as needed to get to min.
                });
            }
            await promise;
        }

        // Create new resources as needed.
        const needed = this.#options.min - this.#resources.length;
        if (needed > 0) {
            let promise = Promise.resolve();
            for (let i = 0; i < needed; i++) {
                promise = promise.then(() => this.#createResource());
            }
            await promise;
        }
    }

    // MARK: async #validate
    /**
     * Validates a resource using the validate function provided in the options.
     * @param {any} res The resource to validate.
     * @returns {Promise<boolean>} A promise that resolves to whether the resource is valid or not.
     */
    async #validate(res) {
        if (!this.#options.validate) {
            return true;
        }
        try {
            return await Promise.resolve(this.#options.validate(res));
        } catch {
            return false;
        }
    }

    // MARK: constructor
    /**
     * Creates a new instance of the Pool class.
     * @param {Pool.Options} options The options for the pool.
     */
    constructor(options) {
        // Validate options.
        if (!options.create) {
            throw new Error("The create function is required.");
        }
        if (!options.destroy) {
            throw new Error("The destroy function is required.");
        }
        if (options.create && typeof options.create !== "function") {
            throw new Error("The create option must be a function.");
        }
        if (options.destroy && typeof options.destroy !== "function") {
            throw new Error("The destroy option must be a function.");
        }
        if (options.validate && typeof options.validate !== "function") {
            throw new Error("The validate option must be a function when provided.");
        }
        if (options.min && (typeof options.min !== "number" || !Number.isSafeInteger(options.min))) {
            throw new Error("The min option must be an integer.");
        }
        if (options.max && (typeof options.max !== "number" || !Number.isSafeInteger(options.max))) {
            throw new Error("The max option must be an integer.");
        }

        this.#options = {...{min: 0, max: 1}, ...options};

        // Constrain options.
        if (this.#options.max < 1) {
            this.#options.max = 1;
        }
        if (this.#options.min < 0) {
            this.#options.min = 0;
        }
        if (this.#options.min > this.#options.max) {
            this.#options.min = this.#options.max;
        }
    }

    #acquireLock = Promise.resolve();

    // MARK: acquire
    /**
     * Acquires a resource from the pool.
     * @returns {Promise<any>} A promise that returns a resource from the pool.
     */
    async acquire() {
        const prevLock = this.#acquireLock;
        let error, result;

        // Create a new lock that waits for the previous acquisigion to complete, then perform the acquisition.
        this.#acquireLock = prevLock.then(async () => {
            try {
                // Ensure min resources are available.
                await this.#ensureMinResources();

                // Try to find a free resource first.
                const free = this.#resources.find((r) => !r.allocated);
                if (free) {
                    free.allocated = true;
                    result = free.resource;
                    return;
                }

                // Create a new resource if we're under max.
                if (this.active < this.#options.max) {
                    const resource = await this.#createResource();
                    const entry = this.#resources.find((r) => r.resource === resource);

                    entry.allocated = true;
                    result = resource;
                    return;
                }

                // No resources available, queue the request.
                result = await new Promise((resolve) => {
                    this.#queue.push(resolve);
                });
            } catch (err) {
                error = err;
            }
        });

        // Wait for the current acquisition to complete.
        await this.#acquireLock;

        // Throw any error, or return the result.
        if (error) {
            throw error;
        }
        return result;
    }

    // MARK: async destroy
    /**
     * Destroys a resource using the destroy function provided in the options.
     * @param {any} res The resource to destroy.
     * @param {boolean} [skipResourceCreation] Whether to skip creating a new resource if the pool is below min after destroying this resource.  This should generally only be true when destroy is being called from the ensureMinResources function.
     * @returns {Promise<void>}
     */
    async destroy(res, skipResourceCreation) {
        // Find the resource and remove it from the pool, or throw an error if it's not found.
        const idx = this.#resources.findIndex((r) => r.resource === res);
        if (idx === -1) {
            throw new Error("Resource not found in pool.");
        }

        // Destroy the resource.
        try {
            await Promise.resolve(this.#options.destroy(res));
        } finally {
            this.#resources.splice(idx, 1);
        }

        if (!skipResourceCreation) {
            // Validate existing resources and at least get to min.
            await this.#ensureMinResources();

            // Calculate the number of resources needed to satisfy both min and queued requests, but never exceed max.
            const toCreate = Math.max(this.#options.min, Math.min(this.#options.max, this.#resources.length + this.#queue.length)) - this.#resources.length;
            if (toCreate > 0) {
                let promise = Promise.resolve();
                for (let i = 0; i < toCreate; i++) {
                    promise = promise.then(() => this.#createResource());
                }
                await promise;
            }

            // Allocate free resources to queued requests.
            while (this.#queue.length > 0 && this.#resources.some((r) => !r.allocated)) {
                const free = this.#resources.find((r) => !r.allocated);
                const resolve = this.#queue.shift();
                free.allocated = true;
                resolve(free.resource);
            }
        }
    }

    // MARK: async release
    /**
     * Releases a resource back to the pool.
     * @param {any} res The resource to release.
     * @returns {Promise<void>}
     */
    async release(res) {
        // Ensure the resource is actually allocated.
        const idx = this.#resources.findIndex((r) => r.resource === res);
        if (idx === -1) {
            throw new Error("Resource not found in pool.");
        }

        const entry = this.#resources[idx];
        if (!entry || !entry.allocated) {
            throw new Error("Resource not currently allocated.");
        }

        const resourceIsValid = await this.#validate(res);

        // If resource is valid and there is a waiting request, re-allocate immediately.
        if (resourceIsValid && this.#queue.length > 0) {
            const resolve = this.#queue.shift();
            resolve(res);
            return;
        }

        // If resource is not valid or pool is above min, destroy the resource.
        if (!resourceIsValid || this.#resources.length > this.#options.min) {
            await this.destroy(res);
            return;
        }

        // Free the resource.
        entry.allocated = false;
    }

    // MARK: async start
    /**
     * Starts the pool by ensuring the minimum number of resources are created.
     * @returns {Promise<void>}
     */
    async start() {
        await this.#ensureMinResources();
    }
}

module.exports = Pool;
