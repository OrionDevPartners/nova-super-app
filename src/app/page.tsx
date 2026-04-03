"use client";

import { useState, useRef, useEffect } from "react";

const API_URL = "https://4btj5ykcyi.execute-api.us-east-1.amazonaws.com";

interface Message {
  role: "user" | "assistant";
  content: string;
  mode?: "chat" | "generate";
}

const EXAMPLE_PROMPTS = [
  "What can you do?",
  "Generate a login page with OAuth",
  "Build a dashboard with charts",
  "Deploy my app to AWS",
];

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"chat" | "generate">("chat");
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg, mode }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg, sessionId, mode }),
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();

      const reply = mode === "generate"
        ? (data.code || "").replace(/^```(?:jsx|tsx|js|ts)?\n?/gm, "").replace(/```\s*$/gm, "").trim()
        : data.response || data.code || "No response";

      setMessages((prev) => [...prev, { role: "assistant", content: reply, mode }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${err instanceof Error ? err.message : "Something went wrong"}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-20 space-y-6">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                Nova <span className="text-accent">Super</span>
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Chat with me or generate UI components. Powered by AWS Bedrock AgentCore.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {EXAMPLE_PROMPTS.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => { setInput(ex); }}
                    className="rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-accent/50 transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card border border-border"
                }`}
              >
                {msg.mode === "generate" && msg.role === "assistant" ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Generated Code</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(msg.content)}
                        className="text-xs border border-input rounded px-2 py-0.5 hover:bg-secondary transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="rounded bg-background p-3 overflow-x-auto text-xs font-mono whitespace-pre-wrap">
                      <code>{msg.content}</code>
                    </pre>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-lg px-4 py-3 text-sm text-muted-foreground">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-border bg-background/95 backdrop-blur px-4 py-3">
        <div className="max-w-3xl mx-auto flex gap-2">
          {/* Mode toggle */}
          <div className="flex rounded-md border border-border overflow-hidden text-xs">
            <button
              onClick={() => setMode("chat")}
              className={`px-3 py-2 transition-colors ${mode === "chat" ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}
            >
              Chat
            </button>
            <button
              onClick={() => setMode("generate")}
              className={`px-3 py-2 transition-colors ${mode === "generate" ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}
            >
              Generate
            </button>
          </div>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={mode === "chat" ? "Say something..." : "Describe a UI component..."}
            className="flex-1 rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            disabled={loading}
          />

          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="rounded-md bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:bg-accent/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
