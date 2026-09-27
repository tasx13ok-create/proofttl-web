# ProofTTL MCP

Public test endpoint:

`https://proofttl-web.vercel.app/api/mcp`

This endpoint exposes a deliberately read-only subset of ProofTTL over Model Context Protocol (MCP). It exists so MCP clients can inspect ProofTTL, read live capability/status information, and retrieve an existing public Fact Lease without creating paid work or mutating customer data.

## Tools

- `proofttl_status` — reads the live ProofTTL core `/health` response.
- `proofttl_capabilities` — reads the live ProofTTL capability registry.
- `proofttl_get_fact_lease` — reads an existing public Fact Lease by ID.
- `proofttl_service_info` — returns canonical ProofTTL service identity, commercial entry points, and product boundaries.

The public MCP does **not** proxy `POST /verify`. Technical verification remains protected by the existing x402 gate. It also does not create audit intakes, access private reports, charge cards, or mutate accounts.

## Protocol compatibility

The endpoint supports:

- legacy MCP initialization through `initialize` for 2025-era clients;
- stateless `2026-07-28` discovery through `server/discover`;
- `tools/list`, `tools/call`, empty resource/prompt listings, and legacy `ping`;
- Streamable HTTP over `POST /api/mcp`.

The implementation is dependency-free so it can ship with the existing locked frontend dependency graph.

## Security posture

The public test surface uses a fixed upstream origin:

`https://proofttl.tasx13ok.workers.dev`

It never accepts an arbitrary upstream URL. Fact Lease identifiers are restricted to a bounded non-path character set. Upstream calls are GET-only, time-bounded, response-bounded, and use manual error handling without exposing stack traces or secrets.

Requests are body-size limited and use a best-effort in-process per-IP rate limit. Browser origins, when present, are allowlisted. Server-to-server MCP clients normally send no Origin header.

This public test endpoint contains no signing keys, admin tokens, payment secrets, customer cookies, or private-report credentials.

The in-process rate limiter is not a substitute for a platform-level Vercel Firewall rule under sustained distributed traffic. Before expanding this MCP to mutation-capable or credentialed tools, add platform-level rate limiting and authentication.

## Legacy smoke test

```bash
curl -sS https://proofttl-web.vercel.app/api/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"curl","version":"1.0"}}}'
```

List tools:

```bash
curl -sS https://proofttl-web.vercel.app/api/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json' \
  --data '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

Call live ProofTTL status:

```bash
curl -sS https://proofttl-web.vercel.app/api/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json' \
  --data '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"proofttl_status","arguments":{}}}'
```

## Modern 2026-07-28 discovery

```bash
curl -sS https://proofttl-web.vercel.app/api/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json' \
  -H 'MCP-Protocol-Version: 2026-07-28' \
  -H 'Mcp-Method: server/discover' \
  --data '{"jsonrpc":"2.0","id":1,"method":"server/discover","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"curl","version":"1.0"},"io.modelcontextprotocol/clientCapabilities":{}}}}'
```

## Expansion path

After this public read-only endpoint is proven against real clients, the next MCP layer should reuse the existing hardened ProofTTL backend instead of duplicating verification logic. Credentialed/private-report tools and any paid verification workflow should stay fail-closed until their authentication, platform rate limiting, and payment semantics are explicitly wired and tested.
