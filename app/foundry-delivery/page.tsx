import type { Metadata } from 'next'
import FoundryDeliveryClient from './FoundryDeliveryClient'

export const metadata: Metadata = {
  title: 'FOUNDRY-10 Delivery · ProofTTL',
  robots: { index: false, follow: false },
}

export default function FoundryDeliveryPage(){
  return <FoundryDeliveryClient />
}
