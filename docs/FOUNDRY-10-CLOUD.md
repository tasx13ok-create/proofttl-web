# FOUNDRY-10 cloud build

FOUNDRY-10 extends MILL without running on the operator PC.

## Current execution model

- GitHub Actions provides cloud compute.
- Ten workers run as five two-agent pairs.
- The first operating mode is zero-spend: deterministic public-signal analysis with no paid inference.
- If the repository already has ANTHROPIC_API_KEY and a valid model variable, paid model calls remain disabled unless FOUNDRY_ENABLE_PAID_MODELS is explicitly set to 1.
- Realized revenue and spend are preserved between cycles and drive the reinvestment ceiling.
- The office UI reads public/foundry-10-state.json and does not invent revenue.

## Pairs

1. Opportunity Scout A + B
2. Demand Validator A + B
3. Product Builder A + B
4. Distribution Scout A + B
5. Finance Analyst + Risk & Kill Agent

Each pair touches the same task independently.

## TinyFish

The connected TinyFish ChatGPT plugin is metered and is not automatically available as a GitHub Actions credential. FOUNDRY-10 therefore does not copy credentials or silently spend the TinyFish wallet. Add a documented server-side TinyFish integration only after there is an explicit reinvestment budget and an API credential intended for this service.

## Cloud-only rule

No local runtime is required for the production loop. If local troubleshooting is ever deliberately chosen later, start from D:\ as required by the operator.
