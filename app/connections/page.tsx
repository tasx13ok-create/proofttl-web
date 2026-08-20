import PlatformAreaPage from '../../components/PlatformAreaPage'

export const metadata = { title: 'Connections — ProofTTL' }

export default function ConnectionsPage() {
  return <PlatformAreaPage
    area="connections"
    headline="Connect providers once. Let L.O.V.E. orchestrate them with scoped permission."
    description="Connections is the integration control plane for identity providers, AI models, developer tooling, work apps, storage, payment infrastructure, and future financial providers."
    connectionNote="Provider credentials stay server-side. The browser should receive capability status and scoped controls, never raw infrastructure secrets. Each connection must expose exactly what it can read or change before L.O.V.E. is allowed to route actions through it."
  />
}
