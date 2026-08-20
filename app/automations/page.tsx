import PlatformAreaPage from '../../components/PlatformAreaPage'

export const metadata = { title: 'Automations — ProofTTL' }

export default function AutomationsPage() {
  return <PlatformAreaPage
    area="automations"
    headline="Turn repeat work into rules L.O.V.E. can run for you."
    description="Automations will coordinate recurring and condition-based work across connected capabilities: summaries, checks, reminders, reports, file actions, work flows, and eventually approved financial rules."
    connectionNote="An automation never gains more authority than the underlying connected capability. Sensitive actions remain confirmation-gated unless a future rule explicitly defines a narrowly scoped pre-authorization model that is safe and compliant."
  />
}
