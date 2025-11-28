"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
window.addEventListener("DOMContentLoaded", () => {
    console.log("Preload running");
});
electron_1.contextBridge.exposeInMainWorld("myAPI", {
    getCurrentDir: () => electron_1.ipcRenderer.invoke("get-current-dir"),
    runCommand: (cmd) => electron_1.ipcRenderer.invoke("run-command", cmd),
});
