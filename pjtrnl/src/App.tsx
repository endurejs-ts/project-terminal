import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

export default function App() {
    const xtermRef = useRef<HTMLDivElement | null>(null);
    const inputBuffer = useRef("");

    useEffect(() => {
        const term = new Terminal({
            fontFamily: 'D2Coding, Consolas, "Courier New", monospace',

            cursorBlink: true,
            fontSize: 14,
            theme: {
                background: "#1e1e1e",
                foreground: "#ffffff",
            },
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        term.open(xtermRef.current!);
        fitAddon.fit();

        // 현재 작업 경로 가져오기
        let cwd = "";
        window.myAPI?.getCurrentDir().then((dir) => {
            cwd = dir;
            term.write(`${cwd}> `);
        });

        // 입력 수집
        term.onData(async (data) => {
            const char = data;

            // Backspace
            if (char === "\u007F") {
                if (inputBuffer.current.length > 0) {
                    inputBuffer.current = inputBuffer.current.slice(0, -1);
                    term.write("\b \b");
                }
                return;
            }

            // Enter
            if (char === "\r") {
                const cmd = inputBuffer.current.trim();
                term.write("\r\n");

                if (cmd.toLowerCase() === "exit") {
                    term.writeln("Bye!");
                    term.dispose(); // xterm.js 터미널 종료
                    // 창까지 닫고 싶으면
                    window.close(); // React 창 자체를 닫음
                    return;
                }

                const output = await window.myAPI.runCommand(cmd);

                term.writeln(output);
                cwd = await window.myAPI.getCurrentDir();
                term.write(`${cwd}> `);

                inputBuffer.current = "";
                return;
            }

            // 일반 문자 입력
            inputBuffer.current += char;
            term.write(char);
        });

        return () => {
            term.dispose();
        };
    }, []);

    return (
        <div
            ref={xtermRef}
            style={{
                width: "100%",
                height: "100vh",
                background: "#1e1e1e",
            }}
        />
    );
}
