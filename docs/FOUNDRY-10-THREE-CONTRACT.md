# FOUNDRY-10 Three.js integration contract

This file defines the boundary between the persistent FOUNDRY-10 runtime and any Three.js environment.

## Source of truth

The Three.js client MUST NOT own, derive, fabricate, or mutate business state.

Owner-authenticated state is read from:

`GET /api/foundry10/world-state`

The response is a versioned semantic contract:

- `contract: "foundry10-world-state"`
- `version: 1`
- `generated_at`
- `system`
- `finance`
- `agents`
- `tasks`
- `experiments`
- `approvals`
- `activity`

The existing `GET /api/foundry10/state` endpoint remains the full operator-control payload. The Three.js world should prefer `world-state`.

## Visual mapping rules

Three.js may map state to visuals, animation, audio, spatial layout, UI labels, and navigation.

Examples:
- agent `busy` -> animated working state
- agent `blocked` -> visible blocker state
- pending approval -> risk/approval area indicator
- experiment `killed` -> archived/killed visual
- experiment `scaling` -> scale/expansion visual
- realized revenue/cost/profit -> finance displays

Three.js MUST NOT convert visual events into business mutations unless the action explicitly calls an existing owner-authenticated mutation endpoint.

## Allowed mutations

Any interactive world controls must call only the existing same-origin operator endpoints:

- `POST /api/foundry10/tick`
- `POST /api/foundry10/discover`
- `POST /api/foundry10/controls`
- `POST /api/foundry10/approval/:id`
- `POST /api/foundry10/experiment/:id/kill`
- `POST /api/foundry10/experiment/:id/checkout`
- `POST /api/foundry10/revenue`

Do not call Supabase directly from browser Three.js code.

## Security

- Keep `credentials: "include"` on owner API requests.
- A 401 means redirect through the existing ProofTTL owner sign-in flow.
- No operator key, Supabase service key, Stripe secret, or provider credential belongs in Three.js code.
- Do not expose `/scheduled-tick` to the browser.
- No cross-origin mutations.
- The office/control surfaces remain noindex/nofollow.

## Performance contract

The world should poll `world-state` rather than rebuilding business logic in the render loop.

Recommended baseline:
- initial fetch on mount
- refresh every 5–15 seconds
- reconcile entities by stable `id`
- animate from old visual state to new visual state
- do not destroy/rebuild the entire scene on every refresh
- cap pixel ratio and use instancing/LOD where appropriate for the 100-agent expansion

## Zero-fake-state rule

If the backend reports $0 revenue, render $0.
If an agent is idle, render idle.
If data is absent, show unknown/unavailable rather than inventing activity.

The 3D environment is an operational visualization layer over the FOUNDRY-10 runtime, not a simulation that pretends work happened.
