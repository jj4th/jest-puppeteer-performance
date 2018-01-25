// Shell typedef to satisfy TypeScript
declare module 'jest-environment-node' {
    import * as vm from 'vm';
    class NodeEnvironment {
        global: NodeJS.Global;
        constructor(config: {});
        setup(): Promise<void>;
        teardown(): Promise<void>;
    }
    export = NodeEnvironment;
}