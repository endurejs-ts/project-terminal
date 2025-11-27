import { contextBridge, ipcRenderer } from "electron";

window.addEventListener("DOMContentLoaded", () => {
  console.log("Preload running");
});

contextBridge.exposeInMainWorld("myAPI", {
  getCurrentDir: () => ipcRenderer.invoke("get-current-dir"),
});

declare global {
  interface Window {
    myAPI: {
      getCurrentDir: () => Promise<string>;
    };
  }
}
