import type { Metadata } from 'next'
import PrivateReport from '../../../components/PrivateReport'
export const metadata: Metadata = { title: 'Private Audit Report', description: 'Private ProofTTL Fact Audit report.', robots: { index: false, follow: false, googleBot: { index: false, follow: false } } }
export default function PrivateReportPage() { return <PrivateReport /> }
