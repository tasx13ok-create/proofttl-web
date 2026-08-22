import FoundryAccessGate from '../../components/FoundryAccessGate'
import './foundry.css'

export const metadata = {
  title: 'ProofTTL',
  description: 'Private workspace.',
  robots: { index: false, follow: false },
}

export default function FoundryPage() {
  return <FoundryAccessGate />
}
