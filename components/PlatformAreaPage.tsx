import { AREA_META, PROOFTTL_CAPABILITIES, RISK_POLICY, type ProofTTLCapability } from '../lib/proofttl-capabilities'

type Area = ProofTTLCapability['area']

type Props = {
  area: Area
  headline: string
  description: string
  connectionNote: string
}

function stateLabel(state: ProofTTLCapability['state']) {
  if (state === 'live') return 'LIVE'
  if (state === 'built_locked') return 'BUILT · CONNECTION REQUIRED'
  return 'PLANNED'
}

export default function PlatformAreaPage({ area, headline, description, connectionNote }: Props) {
  const items = PROOFTTL_CAPABILITIES.filter((item) => item.area === area)
  const meta = AREA_META[area]

  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <a className="brand" href="/"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a>
        <div className="app-meta">{meta.label} · {meta.description}</div>
      </div>

      <section className="app-shell" style={{ paddingBottom: 100, display: 'grid', gap: 18 }}>
        <div className="onboarding-card">
          <p className="app-kicker">{meta.label}</p>
          <h1 className="app-title">{headline}</h1>
          <p className="app-copy">{description}</p>
          <div className="hero-actions" style={{ marginTop: 18 }}>
            <a className="button button-primary" href="/workspace/">ASK L.O.V.E. →</a>
            <a className="button button-secondary" href="/connections/">CONNECTIONS</a>
          </div>
        </div>

        <div className="pricing-cards">
          {items.map((item) => <article key={item.id}>
            <span className="plan-label">{stateLabel(item.state)}</span>
            <h2>{item.label}</h2>
            <p>{item.description}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              <span className="app-status">{RISK_POLICY[item.risk].label}</span>
              {item.route && <a className="text-link" href={item.route}>OPEN →</a>}
            </div>
            <small style={{ display: 'block', marginTop: 10 }}>Examples: {item.examples.join(' · ')}</small>
          </article>)}
        </div>

        <div className="console-panel wide">
          <p className="app-kicker">CONNECTION BOUNDARY</p>
          <h2>No fake integrations.</h2>
          <p className="app-copy">{connectionNote}</p>
          <p className="app-note">When an external provider is not connected, ProofTTL keeps the capability locked instead of inventing data or pretending an action completed.</p>
        </div>
      </section>
    </main>
  )
}
