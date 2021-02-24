import {EventEmitter} from "events"

declare class RedisEventEmitter extends EventEmitter {
    addListener(event: "error", listener: (arg: {message: string, err: Error}) => void): this
    on(event: "error", listener: (arg: {message: string, err: Error}) => void): this
}

export = RedisEventEmitter
