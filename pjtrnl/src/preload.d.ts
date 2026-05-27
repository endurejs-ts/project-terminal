// src/preload.d.ts
export { };

declare global {
    interface Window {
        myAPI: {
            getCurrentDir: () => Promise<string>;
            runCommand: (cmd: string) => Promise<{ type: string, msg: string }>;
            readDir: (dir: string) => Promise<any[]>;
        };
    }
}
