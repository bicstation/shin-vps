"use client";

import { useState } from "react";

import { ConciergeOrchestrator } from "@/shared/runtime/concierge";

export default function ConciergeTestPage() {
const [message, setMessage] = useState("");
const [response, setResponse] = useState("");

const handleSubmit = async () => {
if (!message.trim()) return;


const orchestrator = new ConciergeOrchestrator();

const result = await orchestrator.execute({
  sessionId: "test-session",
  message,
});

setResponse(result.message);


};

return (
<main style={{ padding: "24px" }}> <h1>SHIN Concierge Runtime V1 Test</h1>


  <input
    type="text"
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    placeholder="メッセージを入力"
    style={{
      width: "100%",
      maxWidth: "600px",
      padding: "12px",
      marginTop: "16px",
    }}
  />

  <div style={{ marginTop: "16px" }}>
    <button onClick={handleSubmit}>
      実行
    </button>
  </div>

  <div style={{ marginTop: "24px" }}>
    <strong>Response:</strong>

    <pre>
      {response}
    </pre>
  </div>
</main>


);
}
