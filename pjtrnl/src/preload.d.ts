// src/preload.d.ts
export { };

declare global {
    interface Window {
        myAPI: {
            getCurrentDir: () => Promise<string>;
        };
    }
}
