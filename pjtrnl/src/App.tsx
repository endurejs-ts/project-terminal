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

                if (cmd === "") {
                    term.write(`${cwd}> `);
                    inputBuffer.current = "";
                    return;
                }

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
                    case "color": {
                        const [_, ...rest] = inputBuffer.current.trim().split(" ");
                        const args = rest.join(""); // color 뒤의 값

                        let code = args.toUpperCase().trim();

                        if (code.length === 1) {
                            code = "0" + code;
                        }

                        if (code.length !== 2) {
                            term.writeln("Invalid color code.");
                            term.write(`${cwd}> `);
                            break;
                        }

                        const bgCode = code[0];
                        const fgCode = code[1];

                        const cmdColorMap: Record<string, string> = {
                            "0": "#000000",
                            "1": "#0000AA",
                            "2": "#00AA00",
                            "3": "#00AAAA",
                            "4": "#AA0000",
                            "5": "#AA00AA",
                            "6": "#AA5500",
                            "7": "#AAAAAA",
                            "8": "#555555",
                            "9": "#5555FF",
                            A: "#55FF55",
                            B: "#55FFFF",
                            C: "#FF5555",
                            D: "#FF55FF",
                            E: "#FFFF55",
                            F: "#FFFFFF",
                        };

                        if (!cmdColorMap[bgCode] || !cmdColorMap[fgCode]) {
                            term.writeln("Invalid color code.");
                            term.write(`${cwd}> `);
                            break;
                        }

                        // theme 적용
                        term.options.theme = {
                            ...term.options.theme,
                            background: cmdColorMap[bgCode],
                            foreground: cmdColorMap[fgCode],
                        };

                        term.write(`${cwd}> `);
                        break;
                    }

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
