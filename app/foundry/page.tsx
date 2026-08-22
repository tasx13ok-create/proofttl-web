import FoundryWorkbench from '../../components/FoundryWorkbench'
import './foundry.css'

export const metadata = {
  title: 'Foundry — ProofTTL',
  description: 'Adversarial business opportunity discovery workspace.',
  robots: { index: false, follow: false },
}

export default function FoundryPage() {
  return <FoundryWorkbench />
}
