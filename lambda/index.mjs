import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: "us-east-1" });

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const prompt = body.prompt;

    if (!prompt) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "prompt required" }) };
    }

    const command = new InvokeModelCommand({
      modelId: "us.anthropic.claude-sonnet-4-6",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 4096,
        messages: [{
          role: "user",
          content: `Generate a modern React component using Tailwind CSS for: ${prompt}\n\nOutput ONLY the JSX code wrapped in a default export. Use dark theme colors (bg-zinc-950, text-zinc-50). Include all onClick handlers. No explanations.`
        }]
      })
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    const code = result.content?.[0]?.text || "// Generation failed";

    return { statusCode: 200, headers, body: JSON.stringify({ code }) };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message, code: `// Error: ${err.message}\nexport default function Component() {\n  return <div className="p-8 text-red-400">Error generating component</div>;\n}` })
    };
  }
};
