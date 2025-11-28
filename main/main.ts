import { app, BrowserWindow, ipcMain, Menu } from "electron";
import * as path from "path";
import { exec } from "child_process";
import iconv from "iconv-lite";

let cwd = process.cwd();

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

ipcMain.handle("get-current-dir", () => cwd);

const allowedCommands = [
    "tree",
    "echo",
    "cd",
    "color",
    "exit",
    "cls",
];

ipcMain.handle("run-command", async (_, cmd: string) => {
    cmd = cmd.trim();
    const base = cmd.split(" ")[0].toLowerCase();
    if (!allowedCommands.includes(base)) {
        return { type: "error", msg: `❌ 허용되지 않은 명령어: ${cmd}` };
    }
    
    if (base === "cd") {
        const target = cmd.slice(3).trim();
        try {
            process.chdir(target);
            cwd = process.cwd();
            return { type: "cwd", cwd };
        }
        catch (err) {
            return { type: "error", msg: String(err) };
        }
    }

    if (base === "exit") return { type: "exit" }
    if (base === "cls") return { type: "clear" }

    if (base === "color") {
        const colorcode = cmd.slice(6).trim();
    }

    return new Promise<string>((resolve) => {
        exec(
            cmd,
            { cwd: process.cwd(), encoding: "buffer" },
            (error, stdout, stderr) => {
                if (error) {
                    // stderr를 CP949 → UTF-8 변환
                    resolve(iconv.decode(stderr, "cp949"));
                } else {
                    // stdout을 CP949 → UTF-8 변환
                    resolve(iconv.decode(stdout, "cp949"));
                }
            }
        );
    });
});

app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
