import { redirect } from 'next/navigation'

export const metadata = {
  title: 'ProofTTL',
  robots: { index: false, follow: false },
}

export default function StudioPage() {
  redirect('/audit/')
}
