const UPSTREAM = 'https://evrsofjaaudibnihjafb.supabase.co/functions/v1/foundry10-api'
const TIMEOUT_MS = 10000

function cleanSlug(value) {
  const slug = String(value || '').trim().toLowerCase()
  return /^[a-z0-9-]{3,120}$/.test(slug) ? slug : ''
}

function slugFromRequest(request) {
  const q = request.query?.slug
  const fromQuery = cleanSlug(Array.isArray(q) ? q[0] : q)
  if (fromQuery) return fromQuery

  const matches = request.headers?.['x-now-route-matches']
  if (matches) {
    const params = new URLSearchParams(String(matches))
    const fromRoute = cleanSlug(params.get('offerslug') || params.get('slug'))
    if (fromRoute) return fromRoute
  }

  for (const candidate of [request.headers?.['x-vercel-original-path'], request.url]) {
    if (!candidate) continue
    try {
      const pathname = new URL(String(candidate), 'https://proofttl-web.vercel.app').pathname
      const m = pathname.match(/^\/foundry-offer\/([a-z0-9-]+)\/?$/i)
      if (m) return cleanSlug(m[1])
    } catch {}
  }
  return ''
}

function esc(value) {
  return String(value == null ? '' : value)
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#39;')
}

function money(cents) {
  const amount = Number(cents || 0) / 100
  return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(amount)
}

function list(items) {
  if (!Array.isArray(items) || !items.length) return ''
  return '<ul>' + items.slice(0,8).map((item)=>'<li>'+esc(item)+'</li>').join('') + '</ul>'
}

function page(offer) {
  const listing = offer.listing || {}
  const product = offer.product || {}
  const title = listing.headline || offer.title
  const sub = listing.subheadline || offer.description
  const bullets = Array.isArray(listing.bullets) && listing.bullets.length ? listing.bullets : product.what_you_get
  const how = product.how_to_use
  const gates = product.quality_gates
  const disclosure = listing.source_disclosure || 'This is a narrow experimental offer. It does not guarantee a business, platform, financial, or accuracy outcome.'
  const checkout = String(offer.checkout_url || '')
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>${esc(title)} · FOUNDRY-10</title>
<style>
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#07090d;color:#f4f7fb;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
main{width:min(920px,calc(100% - 32px));margin:0 auto;padding:54px 0 72px}.top{display:flex;justify-content:space-between;gap:20px;align-items:center;border-bottom:1px solid #ffffff18;padding-bottom:18px}.brand{font-size:12px;letter-spacing:.16em}.tag{font-size:10px;color:#8793a2;letter-spacing:.12em}
.hero{padding:66px 0 34px}.kicker{font-size:10px;letter-spacing:.18em;color:#8b98a8}.hero h1{font-size:clamp(40px,8vw,76px);line-height:.94;letter-spacing:-.055em;margin:12px 0 18px;max-width:850px}.hero p{color:#aeb8c3;font-size:17px;line-height:1.65;max-width:720px}
.offer{display:grid;grid-template-columns:1fr 280px;gap:16px}.card{background:#0d1118;border:1px solid #ffffff16;border-radius:16px;padding:22px}.card h2{font-size:14px;margin:0 0 14px}.card p,.card li{color:#b3bec9;line-height:1.55;font-size:13px}.card ul{padding-left:20px}.buy{position:sticky;top:20px}.price{font-size:38px;font-weight:800;letter-spacing:-.05em;margin:6px 0 16px}.cta{display:block;text-align:center;text-decoration:none;background:#f5f8fc;color:#071018;border-radius:10px;padding:13px 16px;font-weight:800}.micro{font-size:10px!important;color:#788594!important;margin-top:12px!important}.disclosure{margin-top:16px;padding-top:16px;border-top:1px solid #ffffff12}
footer{margin-top:30px;border-top:1px solid #ffffff12;padding-top:18px;color:#657180;font-size:10px;letter-spacing:.08em;text-transform:uppercase}
@media(max-width:720px){.offer{grid-template-columns:1fr}.buy{position:static}.hero{padding-top:44px}}
</style></head><body><main>
<div class="top"><div class="brand">FOUNDRY-10</div><div class="tag">SUPERVISED EXPERIMENT</div></div>
<section class="hero"><div class="kicker">NARROW OFFER · HUMAN-GATED LAUNCH</div><h1>${esc(title)}</h1><p>${esc(sub)}</p></section>
<div class="offer"><section>
<div class="card"><h2>What you get</h2>${list(bullets)}${how?.length?'<h2>How to use it</h2>'+list(how):''}${gates?.length?'<h2>Limits / quality gates</h2>'+list(gates):''}<div class="disclosure"><p>${esc(disclosure)}</p></div></div>
</section>
<aside class="card buy"><div class="tag">ONE-TIME</div><div class="price">${esc(money(offer.price_cents))}</div><a class="cta" href="${esc(checkout)}" rel="nofollow">Continue to Stripe</a><p class="micro">Checkout is handled by Stripe. A paid checkout is the only event FOUNDRY-10 counts as realized revenue.</p></aside>
</div><footer>ProofTTL · FOUNDRY-10 · evidence before confidence</footer>
</main></body></html>`
}

export default async function handler(request,response){
  const slug=slugFromRequest(request)
  if(!slug){response.statusCode=404;response.end('Not found');return}
  const controller=new AbortController()
  const timer=setTimeout(()=>controller.abort(),TIMEOUT_MS)
  try{
    const upstream=await fetch(`${UPSTREAM}/public-offer/${encodeURIComponent(slug)}`,{
      headers:{accept:'application/json','user-agent':'proofttl-foundry-offer/1'},
      signal:controller.signal,
      cache:'no-store',
    })
    if(!upstream.ok){
      response.statusCode=upstream.status===404?404:502
      response.setHeader('cache-control','no-store')
      response.end(upstream.status===404?'Not found':'Offer unavailable')
      return
    }
    const body=await upstream.json()
    if(!body?.offer?.checkout_url){response.statusCode=404;response.end('Not found');return}
    response.statusCode=200
    response.setHeader('content-type','text/html; charset=utf-8')
    response.setHeader('cache-control','public, max-age=60, s-maxage=60, stale-while-revalidate=300')
    response.setHeader('x-robots-tag','noindex, nofollow')
    response.setHeader('x-content-type-options','nosniff')
    response.setHeader('referrer-policy','strict-origin-when-cross-origin')
    response.setHeader('content-security-policy',"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action https://buy.stripe.com; frame-ancestors 'none'")
    response.end(page(body.offer))
  }catch(error){
    console.error('FOUNDRY offer proxy failed',error)
    response.statusCode=502
    response.setHeader('cache-control','no-store')
    response.end('Offer unavailable')
  }finally{clearTimeout(timer)}
}
