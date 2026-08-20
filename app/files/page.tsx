import PlatformAreaPage from '../../components/PlatformAreaPage'

export const metadata = { title: 'Files — ProofTTL' }

export default function FilesPage() {
  return <PlatformAreaPage
    area="files"
    headline="One place for the things you create, upload, generate, and connect."
    description="Files will become the account-owned content layer behind L.O.V.E. and Studio: generated reports, code projects, uploads, exports, and connected cloud documents with search and provenance instead of scattered downloads."
    connectionNote="ProofTTL will only expose files the signed-in account owns or has explicitly connected access to. Delete and overwrite actions remain sensitive and must never be inferred from a vague request."
  />
}
