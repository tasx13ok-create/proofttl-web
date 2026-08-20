const EXAMPLES = [
  { intent: '“Why did I spend more this month?”', level: 'READ', state: 'PROVIDER REQUIRED', detail: 'Requires real transaction/account data from an authorized financial-data provider.' },
  { intent: '“Can I afford this next month?”', level: 'READ + ANALYSIS', state: 'PROVIDER REQUIRED', detail: 'Cash-flow reasoning can run only after actual balances, obligations and transaction context exist.' },
  { intent: '“Move $75 to savings.”', level: 'MONEY', state: 'EXPLICIT CONFIRMATION', detail: 'Would require a regulated money-movement rail, exact account resolution, amount preview and per-action confirmation.' },
  { intent: '“Pay this bill.”', level: 'MONEY / SEND', state: 'EXPLICIT CONFIRMATION', detail: 'The target, amount, funding account and provider authorization must all be unambiguous before execution.' },
] as const

const RAILS = [
  ['FINANCIAL DATA', 'Balances, transactions, merchant data and account metadata.', 'NOT CONNECTED'],
  ['ANALYSIS', 'Spending explanations, cash-flow projections, goals and alerts over connected data.', 'WAITS FOR DATA'],
  ['MONEY MOVEMENT', 'Transfers, savings actions and bill payment through regulated/provider rails.', 'NOT CONNECTED'],
  ['ACTION RECEIPTS', 'Planned/confirmed/executed state attached to the same Workspace action ledger.', 'ARCHITECTURE READY'],
] as const

export default function MoneyCenter() {
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <section className="onboarding-card">
        <p className="app-kicker">MONEY / FINANCIAL CONTROL LAYER</p>
        <h1 className="app-title">Understand first. Confirm before money moves.</h1>
        <p className="app-copy" style={{ maxWidth: 900 }}>Money is designed so L.O.V.E. can eventually reason across financial accounts without becoming a fake bank. There are no invented balances, no pretend transfers, and no “successful” money action until a real regulated/provider rail confirms it.</p>
        <div className="hero-actions"><a className="button button-primary" href="/workspace/">ASK L.O.V.E. →</a><a className="button button-secondary" href="/connections/">VIEW CONNECTIONS</a><a className="text-link" href="/how-proofttl-works/">How permissions work ↗</a></div>
      </section>

      <section className="console-panel wide">
        <p className="app-kicker">FINANCIAL RAILS</p><h2>Nothing is silently assumed.</h2>
        <div className="app-table">
          {RAILS.map(([name, description, state]) => <div className="app-table-row" key={name}><span>{name}</span><span>{description}</span><span>{state}</span></div>)}
        </div>
      </section>

      <section className="console-panel wide">
        <p className="app-kicker">WHAT A COMMAND WOULD MEAN</p><h2>Financial intent is parsed before authority is granted.</h2>
        <div className="pricing-cards">
          {EXAMPLES.map((example) => <article key={example.intent}>
            <span className="plan-label">{example.level}</span>
            <h3>{example.intent}</h3>
            <p>{example.detail}</p>
            <span className="app-status">{example.state}</span>
          </article>)}
        </div>
      </section>

      <section className="console-panel wide">
        <p className="app-kicker">TRANSFER SAFETY CONTRACT</p><h2>A future transfer should feel like signing a receipt, not chatting into the void.</h2>
        <div className="app-table">
          <div className="app-table-row"><span>1 · RESOLVE</span><span>Exact source account, destination, currency and amount are resolved from authorized data.</span><span>NO GUESSING</span></div>
          <div className="app-table-row"><span>2 · PREVIEW</span><span>L.O.V.E. shows precisely what the provider will be asked to do.</span><span>VISIBLE</span></div>
          <div className="app-table-row"><span>3 · CONFIRM</span><span>The user explicitly approves this exact money action.</span><span>REQUIRED</span></div>
          <div className="app-table-row"><span>4 · EXECUTE</span><span>The regulated/provider adapter performs the action; conversation alone cannot.</span><span>PROVIDER</span></div>
          <div className="app-table-row"><span>5 · RECEIPT</span><span>The Workspace ledger records outcome/provider state without exposing secrets.</span><span>AUDITABLE</span></div>
        </div>
      </section>

      <section className="console-panel wide">
        <p className="app-kicker">CURRENT BOUNDARY</p><h2>ProofTTL is not currently a bank.</h2>
        <p className="app-copy">It does not hold deposits or currently expose live customer banking balances/transfers. The Money surface is the control and permission architecture for future connected financial capabilities. That distinction stays visible until the regulated/data/payment providers are actually integrated.</p>
      </section>
    </div>
  )
}
