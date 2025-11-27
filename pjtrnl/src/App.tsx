import { useEffect, useState } from "react";

export default function App() {
    const [cwd, setCwd] = useState("");

    useEffect(() => {
        if (window.myAPI) {
            // <-- 이 체크 필수
            window.myAPI.getCurrentDir().then((dir) => setCwd(dir));
        } else {
            console.error("myAPI가 존재하지 않습니다.");
        }
    }, []);

    return (
        <div>
            <h3>{cwd}&gt;</h3>
        </div>
    );
}
