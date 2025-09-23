import { useEffect, useState } from "react";

export default function App() {
  const [text, setText] = useState("loading...");

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.text())
      .then(setText)
      .catch((e) => setText("error: " + e.message));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Med Assist</h1>
      <p>{text}</p>
    </div>
  );
}
