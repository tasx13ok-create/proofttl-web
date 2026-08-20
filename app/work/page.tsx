import PlatformAreaPage from '../../components/PlatformAreaPage'

export const metadata = { title: 'Work — ProofTTL' }

export default function WorkPage() {
  return <PlatformAreaPage
    area="work"
    headline="Mail, calendar, tasks, and work context behind one command layer."
    description="Work is where L.O.V.E. will search messages, summarize what matters, understand your schedule, draft replies, prepare meetings, and coordinate connected productivity tools without making you bounce between apps."
    connectionNote="Email, calendar, task, and document providers are not silently scraped. Each provider will require an explicit connection and scoped permissions; sending messages or changing external data will pass through ProofTTL's action-policy layer."
  />
}
