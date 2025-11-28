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

        let cwd = "";
        window.myAPI?.getCurrentDir().then((dir) => {
            cwd = dir;
            term.write(`${cwd}> `);
        });

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

                // React에서도 exit 처리 가능하지만
                // main에서 type === "exit" 처리하게 됨
                const res = await window.myAPI.runCommand(cmd);

                switch (res.type) {
                    case "cwd":
                        cwd = res.msg!;
                        term.writeln("");
                        term.write(`${cwd}> `);
                        break;

                    case "clear":
                        term.clear();
                        term.write(`${cwd}> `);
                        break;

                    case "color":
                        // color는 React에서 직접 테마 변경
                        term.options.theme = {
                            ...term.options.theme,
                            background: "#000000",
                            foreground: "#00ff00",
                        };
                        term.writeln("");
                        term.write(`${cwd}> `);
                        break;

                    case "exit":
                        term.writeln("Bye!");
                        term.dispose();
                        window.close();
                        return;

                    case "error":
                        term.writeln(res.msg || "Error");
                        term.write(`${cwd}> `);
                        break;

                    case "output":
                        term.writeln(res.msg || "");
                        term.write(`${cwd}> `);
                        break;
                }

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
                overflow: "hidden",
            }}
        />
    );
}
