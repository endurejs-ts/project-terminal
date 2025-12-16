"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const iconv_lite_1 = __importDefault(require("iconv-lite"));
let cwd = process.cwd();
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 900,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
    });
    // 개발 중: Vite 개발 서버로 연결
    win.loadURL("http://localhost:8800");
    // 배포 시: dist/index.html 로드
    // win.loadFile(join(__dirname, "../dist/index.html"));
}
electron_1.ipcMain.handle("get-current-dir", () => cwd);
const allowedCommands = [
    "tree",
    "echo",
    "cd",
    "color",
    "exit",
    "cls",
    "mkdir",
];
electron_1.ipcMain.handle("run-command", async (_, cmd) => {
    cmd = cmd.trim();
    const base = cmd.split(" ")[0].toLowerCase();
    if (!allowedCommands.includes(base)) {
        return { type: "error", msg: `❌ 허용되지 않은 명령어: ${cmd}` };
    }
    if (cmd.includes("&&") || cmd.includes("|") || cmd.includes(";")) {
        return {
            type: "error",
            msg: "no composite command allowed"
        };
    }
    if (base === "cd") {
        const target = cmd.slice(3).trim();
        try {
            process.chdir(target);
            cwd = process.cwd();
            return { type: "cwd", msg: cwd };
        }
        catch (err) {
            return { type: "error", msg: String(err) };
        }
    }
    if (base === "exit")
        return { type: "exit" };
    if (base === "cls")
        return { type: "clear" };
    if (base === "color") {
        const colorcode = cmd.slice(6).trim();
        return { type: "color", msg: colorcode };
    }
    return new Promise((resolve) => {
        (0, child_process_1.exec)(cmd, { cwd: process.cwd(), encoding: "buffer" }, (error, stdout, stderr) => {
            if (error) {
                // stderr를 CP949 → UTF-8 변환
                resolve({ type: "error", msg: iconv_lite_1.default.decode(stderr, "cp949") });
            }
            else {
                // stdout을 CP949 → UTF-8 변환
                resolve({ type: "output", msg: iconv_lite_1.default.decode(stdout, "cp949") });
            }
        });
    });
});
electron_1.app.whenReady().then(() => {
    electron_1.Menu.setApplicationMenu(null);
    createWindow();
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
