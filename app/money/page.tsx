import MoneyCenter from '../../components/MoneyCenter'

export const metadata = {
  title: 'Money — ProofTTL',
  description: 'The financial control layer for future connected data, analysis, transfers, bills and confirmation-gated money actions through L.O.V.E.',
}

export default function MoneyPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <div><div className="app-meta">MONEY / CONTROL + PERMISSION</div><small style={{ color: 'var(--muted-foreground)' }}>No fake balances · no unconfirmed movement · regulated rails required</small></div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><a className="text-link" href="/workspace/">WORKSPACE</a><a className="text-link" href="/connections/">CONNECTIONS</a></div>
      </div>
      <section className="app-shell" style={{ padding: '28px 0 110px' }}><MoneyCenter /></section>
    </main>
  )
}
