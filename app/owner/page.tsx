import type { Metadata } from 'next'
import OwnerDesk from '../../components/OwnerDesk'
import './owner.css'
export const metadata: Metadata = { title: 'Owner Desk', description: 'Private ProofTTL owner workspace.', robots: { index: false, follow: false, googleBot: { index: false, follow: false } } }
export default function OwnerPage() { return <OwnerDesk /> }
