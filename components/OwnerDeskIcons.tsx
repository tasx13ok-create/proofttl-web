import type { DeskSection } from '../lib/owner-desk'
export type IconName = DeskSection | 'arrow' | 'close' | 'refresh' | 'lock' | 'check' | 'plus' | 'search' | 'copy' | 'out' | 'back' | 'upload' | 'mail'
const paths: Record<IconName, string> = {
  Overview: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  Requests: 'M4 4h16v16H4zM8 8h8M8 12h8M8 16h4',
  Payments: 'M3 6h18v12H3zM3 10h18M15 14h3',
  Delivery: 'm3 7 9-4 9 4v10l-9 4-9-4ZM3 7l9 4 9-4M12 11v10M7 5l10 5',
  Tasks: 'm3 6 2 2 3-3M11 7h10M3 13l2 2 3-3M11 14h10M3 20l2 2 3-3M11 21h10',
  Settings: 'M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  arrow: 'M4 12h16m-6-6 6 6-6 6', close: 'm6 6 12 12M6 18 18 6', refresh: 'M20 7v5h-5M4 17v-5h5M5 7a8 8 0 0 1 14-1l1 3M4 15l1 3a8 8 0 0 0 14-1',
  lock: 'M6 10h12v11H6zM8 10V6a4 4 0 0 1 8 0v4M12 14v3', check: 'm5 12 4 4L19 6', plus: 'M12 5v14M5 12h14', search: 'M16 16l5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0', copy: 'M8 8h12v13H8zM4 16H2V2h12v2', out: 'M14 3h7v7M10 14 21 3M21 14v7H3V3h7', back: 'M20 12H4m6-6-6 6 6 6', upload: 'M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6', mail: 'M3 5h18v14H3zM3 5l9 8 9-8',
}
export default function DeskIcon({ name, className = '' }: { name: IconName; className?: string }) { return <svg className={`od-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg> }
export function DeskSculpture() { return <div className="od-sculpture" aria-hidden="true"><div className="od-orbit"><i /><i /><i /><i /><i /><img src="/proofttl-mark.svg" alt="" width="64" height="64" /></div></div> }
