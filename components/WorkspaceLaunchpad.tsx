const AREAS = [
  { href: '/studio/', icon: '⌘', label: 'Studio', state: 'LIVE CORE', description: 'Code, models, projects, terminal-style execution and isolated runner jobs.' },
  { href: '/foundry/', icon: '◆', label: 'Foundry', state: 'LIVE', description: 'Run persistent business-opportunity tournaments with adversarial scoring, red teams and challenger rounds.' },
  { href: '/work/', icon: '✓', label: 'Work', state: 'NATIVE TASKS', description: 'Tasks now; connected mail, calendar and docs plug into the same surface later.' },
  { href: '/files/', icon: '▤', label: 'Files', state: 'NATIVE', description: 'Account-owned text, code, JSON and project artifacts with connected storage later.' },
  { href: '/automations/', icon: '↻', label: 'Automations', state: 'DEFINITIONS LIVE', description: 'Own recurring rules now. Execution remains locked until real provider adapters exist.' },
  { href: '/connections/', icon: '◇', label: 'Connections', state: 'LIVE STATUS', description: 'See exactly which auth, AI, developer and provider rails are ready or locked.' },
  { href: '/money/', icon: '$', label: 'Money', state: 'RAILS LOCKED', description: 'Financial intelligence surface first; real movement only through regulated providers.' },
  { href: '/trust/', icon: '◈', label: 'Truth', state: 'LIVE', description: 'Fact Leases, source-backed verification, signing, monitoring and trust boundaries.' },
  { href: '/login/', icon: '⌁', label: 'Identity', state: 'ACCOUNT', description: 'GitHub, Google, Discord and passkey readiness with security controls.' },
] as const

const PROMPTS = [
  'Open Studio and help me build a website',
  'Open Foundry and search for a $1M business',
  'Show my tasks and tell me what matters today',
  'Find the file I was working on',
  'Verify this claim before I publish it',
  'Run this JavaScript in the sandbox',
  'Show me an alternator',
  'Deploy this project to Vercel',
] as const

export default function WorkspaceLaunchpad() {
  return (
    <section className="workspace-launchpad" aria-label="Workspace launchpad">
      <div className="workspace-launchpad-head">
        <div>
          <p className="app-kicker">YOUR OPERATING LAYER</p>
          <h1>One place to ask, build, verify, organize, and connect.</h1>
          <p>L.O.V.E. is the front door. The cards below are the systems underneath it. Native capabilities work inside ProofTTL; provider-backed actions stay visibly locked until their real connection exists.</p>
        </div>
        <div className="workspace-readiness-key" aria-label="Capability state key">
          <span><i className="ready" /> Native / live</span>
          <span><i className="locked" /> Connection required</span>
          <span><i className="planned" /> Planned rail</span>
        </div>
      </div>

      <div className="workspace-area-grid">
        {AREAS.map((area) => (
          <a className="workspace-area-card" href={area.href} key={area.label}>
            <div className="workspace-area-top"><span className="workspace-area-icon">{area.icon}</span><small>{area.state}</small></div>
            <strong>{area.label}</strong>
            <p>{area.description}</p>
            <span className="workspace-area-open">OPEN <b>→</b></span>
          </a>
        ))}
      </div>

      <div className="workspace-prompt-strip">
        <div><span>TRY SAYING</span><strong>L.O.V.E. understands ordinary conversation and platform commands.</strong></div>
        <div className="workspace-prompt-list">{PROMPTS.map((prompt) => <code key={prompt}>{prompt}</code>)}</div>
      </div>
    </section>
  )
}
