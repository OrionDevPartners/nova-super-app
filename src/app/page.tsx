"use client";

import { useState } from "react";

const API_URL = "https://4btj5ykcyi.execute-api.us-east-1.amazonaws.com";

const EXAMPLE_PROMPTS = [
  "Build a dashboard with charts and metrics",
  "Create a login page with OAuth buttons",
  "Design a pricing page with 3 tiers",
  "Make a settings page with dark mode toggle",
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      setResult(data.code || data.result || JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-24">
      <div className="max-w-3xl w-full text-center space-y-8">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
          Build with <span className="text-accent">Nova Super</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Generate production-ready UI with simple text prompts.
          Powered by AI, deployed to AWS.
        </p>

        {/* Prompt Input */}
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
            placeholder="Describe the UI you want to build..."
            className="w-full min-h-[120px] rounded-lg border border-input bg-card p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            disabled={generating}
          />
          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className="absolute bottom-3 right-3 inline-flex items-center justify-center rounded-md text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 disabled:pointer-events-none h-9 px-4 transition-colors"
          >
            {generating ? "Generating..." : "Generate →"}
          </button>
        </div>

        {/* Example Prompts */}
        <div className="flex flex-wrap gap-2 justify-center">
          {EXAMPLE_PROMPTS.map((ex) => (
            <button
              key={ex}
              onClick={() => setPrompt(ex)}
              className="rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-accent/50 transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="w-full text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Generated Code</span>
              <button
                onClick={() => { navigator.clipboard.writeText(result); }}
                className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs hover:bg-secondary transition-colors"
              >
                Copy Code
              </button>
            </div>
            <pre className="rounded-lg border border-border bg-card p-4 overflow-x-auto text-sm font-mono text-foreground">
              <code>{result}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full px-4">
        {[
          { title: "AI-Powered", desc: "Claude Opus 4.6 generates pixel-perfect React components from natural language." },
          { title: "Full-Stack", desc: "Frontend + backend + database provisioned automatically on AWS." },
          { title: "Production Ready", desc: "Deploy to Cloudflare Pages + AWS in one click. CI/CD included." },
        ].map((feature) => (
          <div key={feature.title} className="rounded-lg border border-border bg-card p-6 space-y-2">
            <h3 className="font-semibold text-foreground">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
