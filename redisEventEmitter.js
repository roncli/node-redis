/**
 * @typedef {["error", function({message: string, err: Error, req}): void]} Events
 */

const EventEmitter = require("events").EventEmitter;

//  ####              #    #           #####                        #     #####           #     #      #
//  #   #             #                #                            #     #                     #      #
//  #   #   ###    ## #   ##     ###   #      #   #   ###   # ##   ####   #      ## #    ##    ####   ####    ###   # ##
//  ####   #   #  #  ##    #    #      ####   #   #  #   #  ##  #   #     ####   # # #    #     #      #     #   #  ##  #
//  # #    #####  #   #    #     ###   #       # #   #####  #   #   #     #      # # #    #     #      #     #####  #
//  #  #   #      #  ##    #        #  #       # #   #      #   #   #  #  #      # # #    #     #  #   #  #  #      #
//  #   #   ###    ## #   ###   ####   #####    #     ###   #   #    ##   #####  #   #   ###     ##     ##    ###   #
/**
 * An event emitter that emits events specifid to this library.
 */
class RedisEventEmitter extends EventEmitter {
    //          #     #  #      #            #
    //          #     #  #                   #
    //  ###   ###   ###  #     ##     ###   ###    ##   ###    ##   ###
    // #  #  #  #  #  #  #      #    ##      #    # ##  #  #  # ##  #  #
    // # ##  #  #  #  #  #      #      ##    #    ##    #  #  ##    #
    //  # #   ###   ###  ####  ###   ###      ##   ##   #  #   ##   #
    /**
     * Adds a listener.
     * @param {Events} args The arguments.
     * @returns {this} The return.
     */
    addListener(...args) {
        return super.addListener(...args);
    }

    //  ##   ###
    // #  #  #  #
    // #  #  #  #
    //  ##   #  #
    /**
     * Adds a listener.
     * @param {Events} args The arguments.
     * @returns {this} The return.
     */
    on(...args) {
        return super.on(...args);
    }
}

module.exports = RedisEventEmitter;
