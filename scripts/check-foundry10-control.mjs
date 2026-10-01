import fs from 'node:fs'

const read=(p)=>fs.readFileSync(p,'utf8')
const client=read('app/foundry10/Foundry10Client.tsx')
const proxy=read('api/foundry10-proxy.js')
const vercel=read('vercel.json')
const page=read('app/foundry10/page.tsx')
const offerProxy=read('api/foundry-offer.js')
const edge=read('supabase/functions/foundry10-api/index.ts')
const schema=read('supabase/foundry10/schema.sql')

const must=(ok,msg)=>{ if(!ok){ console.error('FOUNDRY-10 check failed:',msg); process.exitCode=1 } }

must(client.includes("const API = '/api/foundry10'"),'client must use same-origin FOUNDRY proxy')
must(client.includes("credentials:'include'"),'client must send owner session credentials')
must(!client.includes('x-foundry-key'),'browser must never send operator key')
must(!client.includes('KEY_STORAGE'),'browser must never store operator key')
must(client.includes("signInHref('/foundry10/')"),'unauthorized access must return through ProofTTL owner sign-in')
must(proxy.includes("FOUNDRY_UPSTREAM"),'server proxy must target FOUNDRY edge runtime')
must(proxy.includes('sameOriginMutation'),'mutating browser requests must be same-origin')
must(!proxy.includes('/scheduled-tick'),'public browser proxy must not expose autonomous scheduler path')
must(vercel.includes('/api/foundry10/'),'Vercel must route FOUNDRY control requests')
must(vercel.includes('/foundry-offer/'),'Vercel must route dynamic FOUNDRY offer pages')
must(proxy.includes('/checkout'),'owner proxy must support approved checkout attachment')
must(offerProxy.includes('x-robots-tag') && offerProxy.includes('noindex'),'public experiment pages must remain noindex')
must(offerProxy.includes('buy.stripe.com'),'offer renderer must constrain checkout to Stripe links')
must(edge.includes('/public-offer/'),'edge runtime must expose safe launched-offer reads')
must(edge.includes('/checkout'),'edge runtime must support approved checkout attachment')
must(schema.includes('f10_artifacts'),'schema source must include artifact persistence')
must(page.includes('index: false') && page.includes('follow: false'),'control room must be noindex/nofollow')

if(!process.exitCode) console.log('FOUNDRY-10 control invariants OK')
