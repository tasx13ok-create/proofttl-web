import { permanentRedirect } from 'next/navigation'

export default function PreflightAliasPage() {
  permanentRedirect('/stress-test/')
}
