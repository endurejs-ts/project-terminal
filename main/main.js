"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 900,
        height: 600,
        webPreferences: {
            preload: (0, path_1.join)(__dirname, "preload.js"),
        },
    });
    // 개발 중: Vite 개발 서버로 연결
    win.loadURL("http://localhost:8800");
    // 배포 시: dist/index.html 로드
    // win.loadFile(join(__dirname, "../dist/index.html"));
}
electron_1.app.whenReady().then(() => {
    electron_1.Menu.setApplicationMenu(null);
    createWindow();
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
