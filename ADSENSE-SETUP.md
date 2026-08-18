# ProofTTL AdSense configuration

ProofTTL uses advertising only as a secondary revenue channel on public informational pages.

## Placement policy

Ads are allowed only on:

- `/`
- `/docs/`
- `/solutions/` and its public solution pages

Ads are intentionally excluded from:

- `/login/`
- `/onboarding/`
- `/mfa/`
- `/console/`
- `/support/`
- `/get-started/`
- any future authenticated/account/security/payment form surface

The frontend loads the AdSense script only when `NEXT_PUBLIC_ADSENSE_CLIENT` contains a valid `ca-pub-...` publisher ID and the current path is eligible.

## Required AdSense UI settings

In AdSense, configure ProofTTL Auto ads as follows:

1. Enable **Side rail ads**.
2. Set **Side rail ad position** to **Left and right**.
3. Disable **Anchor ads**.
4. Disable **Vignette ads**.
5. Disable all **Ad intents** formats/links/chips/anchors.
6. Disable **Banner ads / in-page Auto ads** unless this policy is deliberately revisited.
7. Disable **Multiplex ads** unless this policy is deliberately revisited.

This keeps ads on widescreen page borders and prevents popup/interstitial/sticky-top/sticky-bottom/in-content experiences.

## Environment variable

Set this only in the public frontend deployment environment after AdSense approves the site:

```text
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-REPLACE_WITH_REAL_PUBLISHER_ID
```

Never commit a fabricated publisher ID. A publisher ID is public by design, but it should still come from the actual approved AdSense account.

## UX rules

- No popups or pop-unders.
- No vignette/interstitial ads.
- No anchor ads.
- No ads over application controls or content.
- No ads on private/account/security pages.
- No artificial attention cues such as arrows, fake buttons, or misleading labels.
- Do not ask users to click ads.
- If a future layout causes side rails to interfere with product content, disable the ads rather than compressing or covering the product UI.

## Revenue expectations

AdSense approval and ad revenue are not guaranteed. Revenue depends heavily on eligible traffic, geography, advertiser demand, content quality, and viewability. ProofTTL's primary business model remains its verification/monitoring product; ads are supplemental.
