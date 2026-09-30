'use client'

import { useState } from 'react'
import styles from './page.module.css'

const kit = `PROOFTTL RELEASE GATE KIT
Version 1.0

HOW TO USE
Give every agent the same AI output and source bundle. Run roles 1–6 independently. Give only their structured findings to role 7. Do not let the Release Judge see the original model's confidence score.

1) CONSEQUENCE RANKER
Identify up to five claims whose being wrong would cause the largest financial, legal, operational, safety, or reputational consequence.
For each return:
- exact claim
- consequence class
- consequence score: 1–5
- why it matters
Ignore harmless wording mistakes.

2) CONTRADICTION HUNTER
For each ranked claim:
- state what evidence would falsify it
- search the supplied evidence for contradictions
- distinguish contradiction from mere absence
Return: SUPPORTED / CONTRADICTED / NOT ESTABLISHED
Never infer support from confident wording.

3) CITATION PROSECUTOR
For every citation:
- quote or summarize the exact proposition the source supports
- compare that proposition with the AI's exact claim
- flag scope expansion, date mismatch, population mismatch, correlation/causation substitution, and citation laundering
Return PASS / PARTIAL / FAIL.

4) FRESHNESS CHECK
Classify each material claim:
- STABLE: unlikely to change quickly
- TIME-SENSITIVE: can change in months/weeks/days
- LIVE: must be checked at decision time
For TIME-SENSITIVE and LIVE claims, require a source date and a checked-at timestamp.

5) ASSUMPTION EXTRACTOR
List every material premise required for the conclusion that was not directly established by evidence.
For each assumption return:
- assumption
- why it is required
- what would verify it
- consequence if false

6) FAILURE SYNTHESIZER
Combine roles 1–5.
Return only unresolved material failures, ordered by consequence.
Do not average disagreements away.
A single strong contradiction outranks several weak supports.

7) RELEASE JUDGE
Use only the findings from roles 1–6.
Decision rules:
SHIP — no unresolved claim with consequence >= 4 and every material citation passes.
REVISE — evidence gap exists but can be fixed without outside expertise.
ESCALATE — contradiction, live-data dependency, legal/safety/medical/high-financial consequence, or evidence cannot be verified reliably.
Return:
DECISION:
TOP FAILURE:
REQUIRED FIX:
EVIDENCE STILL NEEDED:
CHECKED-AT:

SCORECARD
Consequence: 1 trivial, 2 low, 3 meaningful, 4 severe, 5 catastrophic.
Evidence strength: 0 none, 1 indirect, 2 relevant but incomplete, 3 direct primary/authoritative support.
Freshness: 0 stale/unknown, 1 acceptable, 2 current for the decision.
Contradiction: 0 none found, 1 plausible conflict, 2 direct conflict.

HARD GATES
- Any direct contradiction on a consequence-4/5 claim => ESCALATE.
- Unknown freshness on a LIVE claim => ESCALATE.
- Citation does not support exact proposition => cannot count as evidence.
- Model confidence is never evidence.
- Multiple weak sources do not automatically equal one strong source.
- If verification requires unavailable private data, say so.

ORCHESTRATOR
You are the Release Gate coordinator.
Run the seven roles above as independent passes.
Do not show later roles the hidden reasoning of earlier roles; pass only their structured findings.
Do not let the original answer revise itself before the first contradiction pass.
After the Release Judge, produce a compact release record:
{decision, checked_at, top_failures[], material_claims[], evidence_gaps[], escalation_reason|null}

The purpose is not to make an AI look cautious. The purpose is to expose expensive uncertainty before release.
Evidence > confidence.`

export default function UnlockKit() {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(kit)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  function download() {
    const blob = new Blob([kit], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'proofttl-release-gate-kit-v1.txt'
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <main className={styles.shell}>
      <section className={styles.top}>
        <div className={styles.kicker}>PURCHASE ACCESS · NOINDEX</div>
        <h1>Release Gate Kit</h1>
        <p>Save this page or download the text file. This lightweight MVP uses redirect fulfillment; the material is not DRM-protected.</p>
        <div className={styles.actions}>
          <button onClick={copy}>{copied ? 'Copied' : 'Copy full kit'}</button>
          <button onClick={download}>Download .txt</button>
        </div>
      </section>
      <pre>{kit}</pre>
      <footer><a href="/">ProofTTL</a> · Evidence &gt; confidence.</footer>
    </main>
  )
}
