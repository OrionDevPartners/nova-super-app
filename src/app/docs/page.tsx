"use client";

export default function Docs() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold">Documentation</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-accent">Getting Started</h2>
        <p className="text-muted-foreground">
          Nova Super is an AI-powered development platform. Chat to get help, or switch
          to Generate mode to create React/Tailwind components from text descriptions.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-accent">Chat Mode</h2>
        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          <p className="text-sm text-muted-foreground">Ask questions, get help with code, or discuss architecture. The AI remembers your conversation context.</p>
          <div className="text-xs font-mono bg-background rounded p-2">
            Example: &quot;How do I set up authentication with AWS Cognito?&quot;
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-accent">Generate Mode</h2>
        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          <p className="text-sm text-muted-foreground">Describe a UI component and get production-ready React code with Tailwind CSS.</p>
          <div className="text-xs font-mono bg-background rounded p-2">
            Example: &quot;A pricing page with 3 tiers: Free, Pro, Enterprise&quot;
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-accent">Architecture</h2>
        <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground space-y-2">
          <p><strong className="text-foreground">Frontend:</strong> Next.js 14 + Tailwind CSS + shadcn/ui, deployed on Cloudflare Pages</p>
          <p><strong className="text-foreground">Backend:</strong> AWS Lambda + API Gateway, calling Claude Sonnet 4.6 on Bedrock</p>
          <p><strong className="text-foreground">Database:</strong> DynamoDB (conversations + shared brain)</p>
          <p><strong className="text-foreground">Agent:</strong> AWS Bedrock AgentCore with 8 tool integrations (Apify, GitHub, Cloudflare, V0, Figma, Brave, Sentry, Linear)</p>
          <p><strong className="text-foreground">AI Models:</strong> Claude Opus 4.6 (reasoning) + Claude Sonnet 4.6 (chat/generate) + Nova Act (browser automation)</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-accent">API</h2>
        <div className="rounded-lg border border-border bg-card p-4 text-sm font-mono space-y-3">
          <div>
            <span className="text-green-400">POST</span> /generate
            <p className="text-muted-foreground font-sans text-xs mt-1">Send a prompt with mode &quot;chat&quot; or &quot;generate&quot;</p>
          </div>
          <pre className="bg-background rounded p-2 text-xs overflow-x-auto">{`{
  "prompt": "your message here",
  "mode": "chat",        // or "generate"
  "sessionId": "optional"
}`}</pre>
        </div>
      </section>
    </div>
  );
}
