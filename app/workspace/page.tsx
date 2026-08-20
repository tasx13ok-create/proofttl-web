import WorkspaceDesktopShell from '../../components/WorkspaceDesktopShell'

export const metadata = {
  title: 'Workspace — ProofTTL',
  description: 'A familiar desktop-style control surface for L.O.V.E., coding, 3D worlds, cinematics, files, work, automations and connected tools.',
}

export default function WorkspacePage() {
  return (
    <main className="app-page workspace-desktop-page">
      <WorkspaceDesktopShell />
    </main>
  )
}
