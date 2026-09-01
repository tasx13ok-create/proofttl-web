import type { ReactNode } from 'react'

type Props = {
  active: 'sample' | 'method' | 'trust'
  eyebrow: string
  title: ReactNode
  description: ReactNode
  children: ReactNode
  actions?: ReactNode
}

export default function ProductDetailShell({ active, eyebrow, title, description, children, actions }: Props) {
  return <main className="ptl-detail-page">
    <section className="ptl-detail-shell">
      <aside className="ptl-detail-sidebar" aria-label="ProofTTL navigation">
        <a className="ptl-detail-mark" href="/" aria-label="ProofTTL home"><img src="/proofttl-mark.svg" alt="" /></a>
        <nav>
          <a href="/"><b>⌁</b><span>Verify</span></a>
          <a className={active === 'sample' ? 'active' : ''} href="/audit/sample/"><b>◈</b><span>Sample</span></a>
          <a className={active === 'method' ? 'active' : ''} href="/how-proofttl-works/"><b>◎</b><span>Method</span></a>
          <a className={active === 'trust' ? 'active' : ''} href="/trust/"><b>◇</b><span>Trust</span></a>
        </nav>
        <a className="ptl-detail-help" href="/support/"><b>?</b><span>Support</span></a>
      </aside>

      <div className="ptl-detail-main">
        <header className="ptl-detail-topbar">
          <a href="/"><img src="/proofttl-lockup.svg" alt="ProofTTL" /></a>
          <div><a href="/audit/">Fact Audit</a><a className="primary" href="/audit/#audit-intake">Start audit <span>↗</span></a></div>
        </header>

        <section className="ptl-detail-hero">
          <span className="ptl-detail-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <div className="ptl-detail-description">{description}</div>
          {actions ? <div className="ptl-detail-actions">{actions}</div> : null}
        </section>

        <div className="ptl-detail-content">{children}</div>
        <footer className="ptl-detail-footer"><span>ProofTTL · Evidence before confidence.</span><nav><a href="/about/">About</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></nav></footer>
      </div>
    </section>
  </main>
}
