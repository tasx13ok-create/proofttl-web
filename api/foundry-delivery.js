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
    const fromRoute = cleanSlug(params.get('deliveryslug') || params.get('slug'))
    if (fromRoute) return fromRoute
  }

  for (const candidate of [request.headers?.['x-vercel-original-path'], request.url]) {
    if (!candidate) continue
    try {
      const pathname = new URL(String(candidate), 'https://proofttl-web.vercel.app').pathname
      const m = pathname.match(/^\/api\/foundry-delivery\/([a-z0-9-]+)\/?$/i)
      if (m) return cleanSlug(m[1])
    } catch {}
  }
  return ''
}

export default async function handler(request,response){
  if(String(request.method||'GET').toUpperCase()!=='GET'){
    response.statusCode=405
    response.setHeader('allow','GET')
    response.end('Method not allowed')
    return
  }

  const slug=slugFromRequest(request)
  const access=String(request.query?.access||'').trim()
  if(!slug || access.length<32 || access.length>256){
    response.statusCode=404
    response.setHeader('cache-control','no-store')
    response.end('Not found')
    return
  }

  const controller=new AbortController()
  const timer=setTimeout(()=>controller.abort(),TIMEOUT_MS)
  try{
    const target=new URL(`${UPSTREAM}/delivery/${encodeURIComponent(slug)}`)
    target.searchParams.set('access',access)
    const upstream=await fetch(target,{
      headers:{accept:'application/json','user-agent':'proofttl-foundry-delivery/1'},
      signal:controller.signal,
      cache:'no-store',
    })
    const bytes=Buffer.from(await upstream.arrayBuffer())
    response.statusCode=upstream.status
    response.setHeader('content-type',upstream.headers.get('content-type')||'application/json; charset=utf-8')
    response.setHeader('cache-control','private, no-store')
    response.setHeader('x-robots-tag','noindex, nofollow')
    response.setHeader('x-content-type-options','nosniff')
    response.setHeader('referrer-policy','no-referrer')
    response.end(bytes)
  }catch(error){
    console.error('FOUNDRY delivery proxy failed',error)
    response.statusCode=502
    response.setHeader('content-type','application/json; charset=utf-8')
    response.setHeader('cache-control','no-store')
    response.end(JSON.stringify({error:'delivery_unavailable'}))
  }finally{clearTimeout(timer)}
}
