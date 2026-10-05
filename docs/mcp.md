# ProofTTL MCP

Public MCP endpoint (server `0.5.0`, toolset `6`):

`https://proofttl-web.vercel.app/api/mcp/`

This endpoint exposes protected claim verification, public status/capability and Fact Lease reads, and a bounded Example Domain fixture over Model Context Protocol (MCP).

## Tools

- `proofttl_verify_claim` — invokes `truth.verify` against a caller-supplied public source through the existing x402-protected `POST /verify` route.
- `proofttl_status` — reads the live ProofTTL core `/health` response.
- `proofttl_capabilities` — reads the live ProofTTL capability registry.
- `proofttl_get_fact_lease` — reads an existing public Fact Lease by ID.
- `proofttl_service_info` — returns canonical ProofTTL service identity, commercial entry points, and product boundaries.
- `proofttl_create_test_fact_lease` — creates or reuses a real five-minute Fact Lease for the fixed `Example Domain` / `https://example.com` fixture.
- `proofttl_fact_lease_roundtrip_test` — creates/reuses the bounded test lease, immediately retrieves that exact lease, verifies the lease IDs match, and returns both complete payloads plus diagnostic checks.

Arbitrary verification remains protected by the existing x402 gate. Unpaid requests return an MCP tool error with code `PAYMENT_REQUIRED`, the core challenge body and `payment-required` header, and the canonical core resource URL. This is not a verdict. The only unpaid issuance is the bounded fixed test fixture, which reuses an active lease during its five-minute TTL. MCP does not create audit intakes, access private reports, charge cards, or mutate accounts. `truth.audit` remains a separate commercial service; the capabilities response explicitly describes both mappings.

## Claim verification

Supply `claim` (1–1000 characters), `source_url` (public HTTP(S), at most 2048 characters), and optionally `ttl_seconds` (integer 60–604800, default 3600). The tool checks the supplied source; it does not discover sources or promise universal truth. Issued leases are public, so do not submit confidential information.

```json
{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"proofttl_verify_claim","arguments":{"claim":"A specific factual claim","source_url":"https://example.org/evidence","ttl_seconds":300}}}
```

After explicit user authorization, an x402-capable client can sign the returned challenge externally and supply the base64 v2 header value as `payment_signature`. It is forwarded only as `PAYMENT-SIGNATURE` to the fixed core `/verify` resource. The adapter has no wallet, signing key, payment bypass, auto-payment, or automatic retry. Never put a wallet private key in tool arguments. ChatGPT clients without a signing integration can obtain the challenge but cannot finish paid verification unaided.

Core authenticates payment and applies payer limits and source URL/DNS checks before settlement. Settlement must succeed before source fetching, inference, or lease persistence. Redirect protections remain in core. Successful MCP responses preserve the verdict/evidence and include `payment_response` settlement metadata when present. `UNKNOWN` may legitimately lack a lease when the source is unavailable. Failures after payment submission can leave settlement/issuance outcome unknown: do not automatically resubmit or assume no charge occurred.

## Protocol compatibility

The endpoint supports:

- legacy MCP initialization through `initialize` for 2025-era clients;
- stateless `2026-07-28` discovery through `server/discover`;
- `tools/list`, `tools/call`, empty resource/prompt listings, and legacy `ping`;
- Streamable HTTP over `POST /api/mcp/`.

The implementation is dependency-free so it can ship with the existing locked frontend dependency graph.

## Toolset release contract

The MCP server has a separate `SERVER_VERSION` and `TOOLSET_VERSION`. Any added, removed, renamed, or materially changed action must bump the MCP server/toolset version, keep existing actions backward-compatible where possible, and pass both the build-time contract check and the production live smoke test.

Modern discovery and `tools/list` advertise a zero-second tool-list TTL plus explicit toolset metadata. Responses also expose `X-ProofTTL-MCP-Version` and `X-ProofTTL-Toolset-Version` diagnostic headers.

Client-side action snapshots are outside the server's control. If a client freezes approved tool definitions, operators must refresh/re-scan the app's actions after a toolset change. The production smoke test verifies the server itself independently so a stale client snapshot cannot be mistaken for a failed deployment.

## Security posture

The public test surface uses a fixed upstream origin:

`https://proofttl.tasx13ok.workers.dev`

It never accepts an arbitrary upstream target. The source URL is JSON data sent to core, never fetched by this adapter. Verification rejects unknown fields and malformed values before upstream requests, and only POSTs to `/verify`. The fixed test tools only POST to `/mcp/test-lease` and reject arguments. Fact Lease identifiers remain bounded non-path strings. No account cookies, arbitrary headers, or server credentials are forwarded. Verification responses are stream-bounded to 256000 bytes and requests time out at 55 seconds without following redirects or retrying.

Requests are body-size limited and use a best-effort in-process per-IP rate limit. Browser origins, when present, are allowlisted. Server-to-server MCP clients normally send no Origin header.

The adapter stores no signing keys, admin tokens, payment secrets, customer cookies, or private-report credentials. A caller-provided payment authorization is used only for that request, is not logged by the adapter, and is not copied into the verification JSON body or successful output.

The in-process rate limiter is best-effort. Core also retains platform challenge/payment-attempt limits and cryptographically verified payer rate limits. Payment authorization is enforced in core, not inferred from MCP access. Private account/report tools remain unexposed.

## Legacy smoke test

```bash
curl -sS https://proofttl-web.vercel.app/api/mcp/ \
  -H 'content-type: application/json' \
  -H 'accept: application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"curl","version":"1.0"}}}'
```

List tools:

```bash
curl -sS https://proofttl-web.vercel.app/api/mcp/ \
  -H 'content-type: application/json' \
  -H 'accept: application/json' \
  --data '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

Call live ProofTTL status:

```bash
curl -sS https://proofttl-web.vercel.app/api/mcp/ \
  -H 'content-type: application/json' \
  -H 'accept: application/json' \
  --data '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"proofttl_status","arguments":{}}}'
```

## Modern 2026-07-28 discovery

```bash
curl -sS https://proofttl-web.vercel.app/api/mcp/ \
  -H 'content-type: application/json' \
  -H 'accept: application/json' \
  -H 'MCP-Protocol-Version: 2026-07-28' \
  -H 'Mcp-Method: server/discover' \
  --data '{"jsonrpc":"2.0","id":1,"method":"server/discover","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientInfo":{"name":"curl","version":"1.0"},"io.modelcontextprotocol/clientCapabilities":{}}}}'
```

## Checks and live verification

Run `npm run check:mcp` for contract and mocked handler tests, and `npm run check` for typecheck/build and postbuild checks. Run `node scripts/mcp-live-smoke.mjs` against production after deployment, or set `MCP_URL` to a preview endpoint. The live test checks discovery, an unpaid challenge, fixed-fixture isolation and roundtrip; it never signs or spends funds. Mocked paid responses are not evidence of a live paid verification. That requires a separately authorized signed payment.
