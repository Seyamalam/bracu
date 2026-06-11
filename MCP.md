# Clinic Copilot BD MCP Demo

This repo exposes two MCP-friendly entry points:

- `scripts/mcp-stdio.ts`: real stdio MCP server for LM Studio, Claude Desktop, Codex, Cursor, and other local MCP clients.
- `http://localhost:3000/api/mcp`: in-app JSON-RPC demo endpoint for browser/curl demos.

## Fastest Local Demo

```bash
bun run mcp:smoke
```

This starts the stdio MCP server, lists tools, calls `clinic.safety.get_blockers`, and lists resources.

## LM Studio

1. Open LM Studio MCP config.
2. Paste the contents of `mcp.json`.
3. In LM Studio Server Settings, enable **Allow calling servers from mcp.json**.
4. Restart/reload LM Studio's API server if needed.
5. Call the native LM Studio chat API with the mcp.json plugin id:

```bash
curl -s http://127.0.0.1:1234/api/v1/chat \
  -H 'content-type: application/json' \
  -d '{
    "model": "google/gemma-4-12b",
    "input": "Use the clinic-copilot-bd MCP server to call clinic.tools.list and return the first five tool names.",
    "integrations": ["mcp/clinic-copilot-bd"],
    "temperature": 0,
    "context_length": 8000,
    "max_output_tokens": 1024
  }'
```

If LM Studio returns `Permission denied to use plugin`, the MCP server is not allowed in LM Studio Server Settings yet.

## Claude, Codex, Cursor, And Similar Local MCP Clients

Use this server entry:

```json
{
  "mcpServers": {
    "clinic-copilot-bd": {
      "command": "/Users/seyam/.bun/bin/bun",
      "args": ["/Users/seyam/Work/bracu/scripts/mcp-stdio.ts"],
      "env": {
        "AI_PROVIDER": "lmstudio",
        "LMSTUDIO_MODEL": "google/gemma-4-12b"
      }
    }
  }
}
```

## Curl The In-App Demo Endpoint

Start the app:

```bash
AI_PROVIDER=lmstudio LMSTUDIO_MODEL='google/gemma-4-12b' bun run dev
```

List tools:

```bash
curl -s http://localhost:3000/api/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Call a safety tool:

```bash
curl -s http://localhost:3000/api/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"clinic.safety.get_blockers","arguments":{"intake":"Patient has chest tightness and sweating","allergiesKnown":false}}}'
```

Use `localhost`, not `127.0.0.1`, on this machine because another listener can intercept `127.0.0.1:3000`.
