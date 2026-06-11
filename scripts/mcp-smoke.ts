#!/usr/bin/env bun
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  args: ["scripts/mcp-stdio.ts"],
  command: "bun",
  cwd: process.cwd(),
  stderr: "pipe",
});

const client = new Client({
  name: "clinic-copilot-bd-smoke",
  version: "0.1.0",
});

type TextContent = {
  text: string;
  type: "text";
};

try {
  await client.connect(transport);

  const tools = await client.listTools();
  console.log(`tools=${tools.tools.length}`);
  console.log(
    tools.tools
      .map((tool) => tool.name)
      .slice(0, 5)
      .join(", "),
  );

  const safety = await client.callTool({
    arguments: {
      allergiesKnown: false,
      intake: "Patient has chest tightness and sweating.",
    },
    name: "clinic.safety.get_blockers",
  });
  const content = Array.isArray(safety.content) ? safety.content : [];
  const text = content
    .filter((item): item is TextContent => {
      return (
        typeof item === "object" &&
        item !== null &&
        "type" in item &&
        item.type === "text" &&
        "text" in item &&
        typeof item.text === "string"
      );
    })
    .map((item) => item.text)
    .join("\n");
  console.log(text.slice(0, 600));

  const resources = await client.listResources();
  console.log(`resources=${resources.resources.length}`);
} finally {
  await client.close();
}
