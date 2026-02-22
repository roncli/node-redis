export interface Options {
    create: () => any | Promise<any>;
    destroy: (resource: any) => void | Promise<void>;
    validate?: (resource: any) => boolean | Promise<boolean>;
    min?: number;
    max?: number;
}
