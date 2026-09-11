import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import Script from 'next/script'

// The reviewed single-file design is the canonical commercial homepage source.
export default function CommercialHome() {
  const html = readFileSync(join(process.cwd(), 'public/proof-home.html'), 'utf8')
  const css = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] || ''
  const script = html.match(/<script>\s*([\s\S]*?)<\/script>/)?.[1] || ''
  const body = html.match(/<body>([\s\S]*?)<script>/)?.[1] || ''
  return <>
    <style dangerouslySetInnerHTML={{ __html: css }} />
    <div id="cinematic-home" dangerouslySetInnerHTML={{ __html: body }} />
    <Script id="proofttl-cinematic-motion" strategy="afterInteractive">{script}</Script>
  </>
}
