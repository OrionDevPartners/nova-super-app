"use client";

import { useState } from "react";

interface Generation {
  id: string;
  prompt: string;
  code: string;
  createdAt: string;
}

export default function Dashboard() {
  const [generations] = useState<Generation[]>([
    {
      id: "1",
      prompt: "Login form with OAuth",
      code: '<div className="flex flex-col gap-4">\n  <button>Sign in with GitHub</button>\n  <button>Sign in with Google</button>\n</div>',
      createdAt: new Date().toISOString(),
    },
  ]);

  const [activeTab, setActiveTab] = useState<"generations" | "settings">("generations");

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        {(["generations", "settings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-accent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "generations" && (
        <div className="space-y-4">
          {generations.map((gen) => (
            <div key={gen.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{gen.prompt}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(gen.createdAt).toLocaleDateString()}
                </span>
              </div>
              <pre className="rounded-md bg-background p-3 text-xs font-mono overflow-x-auto">
                <code>{gen.code}</code>
              </pre>
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(gen.code)}
                  className="text-xs border border-input rounded-md px-3 py-1.5 hover:bg-secondary transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={() => window.open(`/preview/${gen.id}`, "_blank")}
                  className="text-xs bg-accent text-accent-foreground rounded-md px-3 py-1.5 hover:bg-accent/90 transition-colors"
                >
                  Preview
                </button>
                <button
                  onClick={async () => {
                    await fetch("/api/deploy", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ generationId: gen.id }),
                    });
                  }}
                  className="text-xs bg-green-600 text-white rounded-md px-3 py-1.5 hover:bg-green-700 transition-colors"
                >
                  Deploy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "settings" && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Settings</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">API Key</label>
              <input
                type="password"
                placeholder="sk-..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Default Model</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>Claude Opus 4.6</option>
                <option>Claude Sonnet 4.6</option>
                <option>Nova Pro</option>
              </select>
            </div>
            <button className="bg-accent text-accent-foreground rounded-md px-4 py-2 text-sm hover:bg-accent/90 transition-colors">
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
