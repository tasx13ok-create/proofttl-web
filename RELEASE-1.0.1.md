# ProofTTL Web v1.0.1

Release date: 2026-08-22

## Focus

v1.0.1 is the final hardening/polish release for the current testnet product surface. It synchronizes frontend versioning with the Worker and tightens private-surface behavior without changing the public Fact Lease protocol.

## What changed

- Synchronized package, metadata generator, and protocol network strip at v1.0.1.
- Hid Foundry from public navigation and gated rendering behind the two authorized owner emails.
- Replaced Foundry page metadata with generic private-workspace metadata and retained `noindex, nofollow`.
- Added static release guards for Foundry privacy behavior and owner allowlist wiring.
- Rendered owner L.O.V.E. quota state as `Unlimited` instead of misleading zero/blank values.
- Polished Work tasks with retry, empty-state, accessible status feedback, safer due-date rendering, trimmed form values, and backend-aligned notes limits.
- Preserved the existing public commercial funnel, Trust Center, authentication providers, Workspace, Studio, Files, Automations, Money, Connections, and hidden creative surfaces.

## Trust boundaries

- Base Sepolia testnet remains the active protocol settlement environment.
- Mainnet remains disabled.
- Foundry data and operations remain server-side authenticated even though the frontend also hides the surface.
- Sensitive provider actions remain confirmation-bound.
