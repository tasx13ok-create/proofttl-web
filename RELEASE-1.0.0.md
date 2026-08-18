# ProofTTL Web v1.0.0

Release date: 2026-08-18

This frontend release is the public ProofTTL v1.0.0 product shell for the current Base Sepolia testnet release.

## Included

- Dark cyber/glass ProofTTL product UI.
- Unified L.O.V.E. text + microphone + speech experience.
- Reactive non-human black-mist L.O.V.E. entity with listening, thinking, speaking, awake, and idle states.
- Live Fact Lease materialization when an `ftl_…` identifier is referenced.
- Public independent Ed25519 issuance verification.
- Signed monitoring-event chain verification when `proofttl-event-v1` events are present.
- Fact Lease JSON export and public share links.
- Lease lifecycle/renewal preparation and source-failure diagnostics.
- Verification Methodology v1.
- Public service Status and Trust Center.
- Customer Console trust/readiness/assistant telemetry.
- Authentication, 2FA/security, onboarding, docs, audit/sample, solutions, and support surfaces.
- Permanent `TESTNET PREVIEW` and `Mainnet disabled` disclosure.

## Release invariants

`package.json` is `1.0.0` and the static export guard requires the Trust Center, verifier, event-chain verification, Lease Ops, methodology, status, L.O.V.E. voice/Lease context, security headers, docs, audit surfaces, and testnet disclosure before Vercel can report a successful build.

## Financial boundary

The frontend does not represent Base Sepolia test settlement as mainnet or production money. Mainnet settlement remains a separate deliberate launch decision.
