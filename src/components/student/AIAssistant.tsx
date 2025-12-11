import React, { useState } from "react";
import { api as API } from "@/lib/api";
import { toast } from "sonner";

export default function AIAssistant() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!prompt) return;
    const userMsg = { role: "user", text: prompt };
    setMessages(m => [...m, userMsg]);
    setLoading(true);
    try {
      const res = await API.post("/student/ai/chat", { prompt });
      setMessages(m => [...m, { role: "assistant", text: res.data.response }]);
      setPrompt("");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "AI request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-3">AI Assistant</h2>

      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`p-3 rounded ${m.role === "user" ? "bg-blue-50 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-800"}`}>
            <div className="text-sm">{m.text}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Ask a question..." className="flex-1 p-3 border rounded" />
        <button onClick={send} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? "Thinking..." : "Send"}</button>
      </div>
    </div>
  );
}
