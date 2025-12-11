MicroFounder-MCP (local scaffold)

This is a minimal, local MCP HTTP scaffold used for development and testing.

Endpoints

- GET /health
  - Returns JSON { status: 'ok', pid }

- GET /mcp/metadata
  - Returns server metadata (name, version, transports)

- POST /mcp/context
  - Body: any JSON payload representing a context item
  - Stores the item in-memory and returns the stored item

- GET /mcp/context
  - Lists stored context items (last 50)

- POST /mcp/complete
  - Body (options):
    - `prompt` (string) — legacy prompt text, OR
    - `input` (array|string) — MCP-style input; array of `{ role, content }` messages is supported
    - `model` (string) — optional model name
    - `maxTokens` (number) — optional max tokens
  - Returns a realistic MCP-like response with `id`, `model`, `choices` (array with `message` and `finish_reason`), and `usage` (token counts). The server performs a simple in-memory retrieval from items added via `/mcp/context` and includes matching contexts in the returned `choices` content.

Notes

- This server is intentionally minimal and not production-ready.
- For real MCP support implement authentication, proper request/response shapes, streaming responses, rate limiting, persistence, and security checks.
