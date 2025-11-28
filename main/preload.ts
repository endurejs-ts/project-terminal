import { contextBridge, ipcRenderer } from "electron";

window.addEventListener("DOMContentLoaded", () => {
  console.log("Preload running");
});

contextBridge.exposeInMainWorld("myAPI", {
  getCurrentDir: () => ipcRenderer.invoke("get-current-dir"),
  runCommand: (cmd: string) => ipcRenderer.invoke("run-command", cmd),
});
