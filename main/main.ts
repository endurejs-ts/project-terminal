import { app, BrowserWindow, ipcMain, Menu, dialog } from "electron";
import * as path from "path";

function createWindow() {
    const win = new BrowserWindow({
        width: 900,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    // 개발 중: Vite 개발 서버로 연결
    win.loadURL("http://localhost:8800");

    // 배포 시: dist/index.html 로드
    // win.loadFile(join(__dirname, "../dist/index.html"));
}

ipcMain.handle('get-current-dir', () => {
    return process.cwd();
});

app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
