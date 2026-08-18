# ProofTTL authentication security model

Status: design gate before authentication is enabled publicly.

ProofTTL's machine API remains usable without a customer account. Accounts are an optional management layer for history, security settings, usage, payments, and support.

## Planned sign-in methods

Customer authentication should support:

- Google OAuth/OIDC
- GitHub OAuth
- Discord OAuth
- verified email sign-in

Do not implement custom OAuth protocols or custom password cryptography. Use an established authentication library/provider and keep ProofTTL-specific authorization in our application.

Email sign-in must not be enabled until a real email delivery/verification channel exists. The UI must never pretend that an email was sent.

## Identity model

A ProofTTL account gets one stable internal user ID.

External provider identities are stored separately as `(provider, provider_subject)` records linked to the internal user ID.

Do not automatically merge accounts solely because two OAuth providers return the same email address. Provider linking must require an already-authenticated ProofTTL session or another explicit ownership proof.

Normalized email addresses are account attributes, not primary authorization identifiers.

## OAuth requirements

All OAuth/OIDC flows must use:

- exact registered redirect URIs
- random per-flow `state`
- PKCE where supported/appropriate by the chosen auth stack
- short-lived authorization attempts
- one-time callback consumption
- server-side provider-secret storage
- strict provider issuer/client validation where OIDC is used

OAuth client secrets must never be present in browser JavaScript or `NEXT_PUBLIC_*` variables.

## Session requirements

Production sessions must use secure server-managed session state or a mature signed/encrypted session mechanism from the selected auth stack.

Browser session cookies must be:

- `Secure`
- `HttpOnly`
- scoped as narrowly as practical
- protected with an appropriate `SameSite` policy

Rotate the session identifier after successful authentication and privilege changes. Invalidate old sessions after password/email recovery, suspicious account recovery, or explicit "log out all devices" actions.

The Console must not trust client-provided user IDs, payer addresses, roles, or organization IDs.

## CSRF and state-changing requests

Account/security/support mutations must have CSRF protection appropriate to the selected framework/session design.

Never treat CORS as CSRF protection.

Sensitive actions require a recent authenticated session; high-impact security changes may require step-up authentication.

## MFA

Preferred customer MFA order:

1. passkeys / WebAuthn
2. TOTP authenticator application
3. recovery codes

SMS is not the primary MFA method. It can only be considered later as a deliberately scoped recovery option after cost, abuse, SIM-swap, and support implications are reviewed.

Admin/operator access must require strong MFA before any private operator console is enabled.

## Recovery codes

Recovery codes must:

- be generated from cryptographically secure randomness
- be shown only at creation/regeneration time
- be stored only as one-way verifiers/hashes where the selected auth stack supports it
- be single-use
- invalidate the previous recovery-code set when regenerated

Do not log raw recovery codes.

## Email verification and account recovery

Email verification tokens must be:

- random
- single-use
- short-lived
- invalidated after successful use
- bound to the intended account/change

Changing the primary email address must require authenticated proof and verification of the new address. Security notifications should be sent to the previous address when delivery infrastructure supports it.

Account recovery must not allow a support employee to simply replace an email address or disable MFA without a documented recovery policy and audit event.

## Login abuse controls

Authentication endpoints need separate rate limits from the paid `/verify` API.

Rate-limit dimensions should include a combination of:

- source/network bucket
- account/email identifier where applicable
- provider callback abuse indicators

Do not reveal whether an arbitrary email is registered when that information is not necessary.

## Customer authorization

Every Console data read must verify server-side ownership/authorization.

A signed-in customer must not be able to read another customer's:

- Fact Lease history
- account-linked payer history
- support tickets
- sessions
- recovery settings
- profile information

Machine-visible public lease reads remain governed by the public ProofTTL API design and are separate from account authorization.

## Payer/account attribution

Do not assume that an x402 payer wallet automatically belongs to the currently signed-in account.

A wallet/payment can only become account-linked through an explicit, verifiable attribution mechanism designed later. Until then, account payment history must remain empty rather than guessing ownership from browser state.

## Date of birth / profile data

The onboarding UI currently previews name and date of birth because that is part of the planned product flow.

Do not enable date-of-birth collection until ProofTTL documents:

- the exact product/legal reason it is required
- minimum necessary precision
- retention period
- deletion behavior
- who can access it

If no legitimate requirement survives review, remove the birthday field rather than collecting unnecessary sensitive profile data.

## Admin/operator boundary

The future employee/admin surface must be authorization-separated from the customer Console.

Requirements before launch:

- explicit employee/admin role assignment
- strong MFA
- least privilege
- no public self-registration into admin roles
- auditable sensitive actions
- separate authorization middleware
- no security-through-obscurity dependency on an unlinked URL

Support staff should not receive direct access to secrets, CDP credentials, signing private keys, or unrestricted customer data.

## Audit events

Security-relevant events should produce structured audit records, including:

- sign-in success/failure category
- provider link/unlink
- email verification/change
- MFA enrollment/removal
- passkey add/remove
- recovery-code regeneration/use
- session revocation
- logout-all-devices
- account deletion request/completion
- admin role changes
- sensitive operator actions

Never log OAuth authorization codes, provider client secrets, raw session tokens, private keys, TOTP seeds, or recovery codes.

## Acceptance criteria before `/login` becomes functional

Authentication stays disabled until all applicable checks pass:

- [ ] Selected mature auth library/provider is documented.
- [ ] Google provider configured with secrets server-side only.
- [ ] GitHub provider configured with secrets server-side only.
- [ ] Discord provider configured with secrets server-side only.
- [ ] Email delivery/verification path is real or email login remains disabled.
- [ ] OAuth `state` handling is verified.
- [ ] PKCE behavior is verified for the selected implementation where applicable.
- [ ] Session cookie flags are verified in production configuration.
- [ ] Session rotation is tested.
- [ ] CSRF protection is tested on mutations.
- [ ] Login and recovery rate limits are tested.
- [ ] Provider-linking account-takeover tests pass.
- [ ] Email-change takeover tests pass.
- [ ] MFA enrollment/removal tests pass before MFA is advertised.
- [ ] Recovery codes are single-use and never stored/logged raw.
- [ ] Logout current device works.
- [ ] Logout all devices invalidates other sessions.
- [ ] Console ownership checks reject cross-account access.
- [ ] Admin role escalation tests reject customer-controlled role changes.
- [ ] No auth/provider secrets appear in browser bundles or public environment variables.
- [ ] No fabricated success states remain in the UI.

## Current implementation status

The public frontend currently provides disabled/future-ready login, onboarding, Console, and security UI states. That is intentional. This threat model is the gate for making those controls functional.
