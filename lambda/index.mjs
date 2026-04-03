import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { BedrockAgentCoreClient, InvokeAgentRuntimeCommand } from "@aws-sdk/client-bedrock-agentcore";

const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });
const dynamo = new DynamoDBClient({ region: "us-east-1" });
const BRAIN_TABLE = "nova-super-agent-brain";
const CONVO_TABLE = "nova-super-app-conversations";
const AGENT_ARN = "arn:aws:bedrock-agentcore:us-east-1:222257058350:runtime/nova_super_runtime-Z6wy6e2ZBc";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Content-Type": "application/json",
};

async function saveToBrain(pk, sk, data) {
  const item = { PK: { S: pk }, SK: { S: sk } };
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === "string") item[k] = { S: v };
    else if (typeof v === "number") item[k] = { N: String(v) };
    else item[k] = { S: JSON.stringify(v) };
  }
  await dynamo.send(new PutItemCommand({ TableName: BRAIN_TABLE, Item: item }));
}

async function saveConversation(sessionId, role, content) {
  const ts = Date.now();
  await dynamo.send(new PutItemCommand({
    TableName: CONVO_TABLE,
    Item: {
      sessionId: { S: sessionId },
      timestamp: { N: String(ts) },
      role: { S: role },
      content: { S: content },
    }
  }));
}

async function getRecentConversation(sessionId) {
  try {
    const result = await dynamo.send(new QueryCommand({
      TableName: CONVO_TABLE,
      KeyConditionExpression: "sessionId = :sid",
      ExpressionAttributeValues: { ":sid": { S: sessionId } },
      ScanIndexForward: false,
      Limit: 10,
    }));
    return (result.Items || []).reverse().map(item => ({
      role: item.role?.S || "user",
      content: item.content?.S || "",
    }));
  } catch { return []; }
}

async function callBedrock(messages, systemPrompt) {
  const command = new InvokeModelCommand({
    modelId: "us.anthropic.claude-sonnet-4-6",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 4096,
      system: systemPrompt,
      messages,
    })
  });
  const response = await bedrock.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));
  return result.content?.[0]?.text || "No response";
}

async function tryAgentCore(prompt) {
  try {
    const agentcore = new BedrockAgentCoreClient({ region: "us-east-1" });
    const response = await agentcore.send(new InvokeAgentRuntimeCommand({
      agentRuntimeArn: AGENT_ARN,
      payload: new TextEncoder().encode(JSON.stringify({ message: prompt })),
      contentType: "application/json",
      accept: "application/json",
    }));
    const data = response.response;
    if (data && typeof data.read === 'function') {
      const buf = await data.read();
      return JSON.parse(new TextDecoder().decode(buf));
    }
    return data;
  } catch (err) {
    return { error: err.message };
  }
}

export const handler = async (event) => {
  if ((event.requestContext?.http?.method || event.httpMethod) === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const rawBody = event.body || "{}";
    const body = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;
    const prompt = body.prompt || body.message || "";
    const sessionId = body.sessionId || "default";
    const mode = body.mode || "chat"; // "chat", "generate", "agent"

    if (!prompt) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "prompt required" }) };
    }

    // Save user message
    await saveConversation(sessionId, "user", prompt);

    let responseText;

    if (mode === "agent") {
      // Route directly to AgentCore agent
      const agentResult = await tryAgentCore(prompt);
      responseText = agentResult?.response || JSON.stringify(agentResult);

    } else if (mode === "generate") {
      // Code generation mode
      const messages = [{ role: "user", content: `Generate a React/Tailwind component for: ${prompt}\n\nOutput ONLY raw JSX as a default export. Dark theme. Every button has onClick. No markdown fences.` }];
      responseText = await callBedrock(messages, "You are a UI code generator. Output only valid JSX code.");
      responseText = responseText.replace(/^```(?:jsx|tsx|js|ts)?\n?/gm, "").replace(/```\s*$/gm, "").trim();

    } else {
      // Chat mode — conversational with memory
      const history = await getRecentConversation(sessionId);
      const messages = [
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: "user", content: prompt }
      ];

      const systemPrompt = `You are Nova Super, an AI assistant built on AWS Bedrock AgentCore. You can:
- Generate React/Tailwind UI components (ask user to click "Generate" mode)
- Browse and scrape websites via Apify
- Deploy to AWS and Cloudflare
- Access 30+ AWS services
- Remember conversation context

Be helpful, concise, and friendly. If the user asks you to generate code, switch to generate mode.
Current deployment: https://nova-super-app.pages.dev
GitHub: https://github.com/OrionDevPartners/nova-super-app`;

      responseText = await callBedrock(messages, systemPrompt);
    }

    // Save assistant response
    await saveConversation(sessionId, "assistant", responseText);

    // Log to brain
    await saveToBrain("COMMS#user_to_agent", `MSG#${Date.now()}`, {
      from: "user",
      prompt,
      response: responseText.substring(0, 500),
      mode,
      sessionId,
      timestamp: Date.now(),
    });

    const result = mode === "generate" ? { code: responseText } : { response: responseText };
    return { statusCode: 200, headers, body: JSON.stringify(result) };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message, response: `Sorry, something went wrong: ${err.message}` })
    };
  }
};
