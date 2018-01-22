// Shell typedef to satisfy TypeScript
declare module 'jest-environment-node' {
    class NodeEnvironment {
        global: NodeJS.Global;
        constructor(config: {});
        setup(): Promise<void>;
    }
    export = NodeEnvironment;
}