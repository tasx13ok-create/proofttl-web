# ProofTTL Web

Public marketing and developer frontend for ProofTTL.

ProofTTL issues expiring, source-backed Fact Leases for machines and AI agents.

## Development

```bash
pnpm install
pnpm dev
```

Set the public API URL in `.env.local`:

```bash
NEXT_PUBLIC_PROOFTTL_API_URL=https://proofttl.tasx13ok.workers.dev
```

The public `/verify` flow intentionally preserves x402 HTTP 402 responses. No private wallet, signing, or CDP credentials belong in this frontend.

## Current environment

- Protocol: `ProofTTL/0.3.1`
- Network: Base Sepolia
- Environment: TESTNET
- Verification price: `$0.001` per Fact Lease issuance
