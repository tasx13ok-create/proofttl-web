'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'

type DeliveredProduct = {
  slug:string
  title:string
  content:{
    product_name?:string
    format?:string
    version?:string
    buyer?:string
    source_title?:string|null
    what_you_get?:string[]
    how_to_use?:string[]
    quality_gates?:string[]
    fulfillment_note?:string
  }
  delivered_at:string
}

function List({items}:{items?:string[]}){
  if(!items?.length) return null
  return <ul>{items.map((item,i)=><li key={i}>{item}</li>)}</ul>
}

export default function FoundryDeliveryClient(){
  const [product,setProduct]=useState<DeliveredProduct|null>(null)
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(true)

  useEffect(()=>{
    let cancelled=false

    async function load(){
      try{
        const hash=new URLSearchParams(window.location.hash.replace(/^#/,''))
        const slug=hash.get('slug')||''
        const access=hash.get('access')||''
        if(!slug||!access) throw new Error('This delivery link is incomplete.')

        history.replaceState(null,'',window.location.pathname)

        const response=await fetch('/api/foundry-delivery/'+encodeURIComponent(slug)+'?access='+encodeURIComponent(access),{
          method:'GET',
          credentials:'same-origin',
          cache:'no-store',
        })
        const body=await response.json().catch(()=>({}))
        if(!response.ok||!body?.product) throw new Error('This delivery link is invalid or unavailable.')
        if(!cancelled) setProduct(body.product)
      }catch(e:any){
        if(!cancelled) setError(e?.message||'Delivery unavailable.')
      }finally{
        if(!cancelled) setLoading(false)
      }
    }

    void load()
    return()=>{cancelled=true}
  },[])

  if(loading) return <main className={styles.shell}><section className={styles.card}><span>FOUNDRY-10 DELIVERY</span><h1>Verifying access…</h1></section></main>
  if(error||!product) return <main className={styles.shell}><section className={styles.card}><span>FOUNDRY-10 DELIVERY</span><h1>Access unavailable.</h1><p>{error}</p><a href="/support/">Contact ProofTTL support</a></section></main>

  const c=product.content||{}
  return <main className={styles.shell}>
    <header className={styles.header}><strong>FOUNDRY-10</strong><span>PAID PRODUCT DELIVERY</span></header>
    <section className={styles.hero}>
      <span className={styles.eyebrow}>{c.format||'SELF-SERVE PRODUCT'} · {c.version||'v1'}</span>
      <h1>{c.product_name||product.title}</h1>
      {c.buyer&&<p>Built for {c.buyer}.</p>}
    </section>
    <section className={styles.grid}>
      <article className={styles.card}><h2>What you get</h2><List items={c.what_you_get}/></article>
      <article className={styles.card}><h2>How to use it</h2><List items={c.how_to_use}/></article>
      <article className={styles.card}><h2>Quality / stop gates</h2><List items={c.quality_gates}/></article>
      <article className={styles.card}><h2>Delivery record</h2><p>Delivered {new Date(product.delivered_at).toLocaleString()}.</p><p>This access URL can be shared. Treat it like a private purchase link.</p>{c.fulfillment_note&&<p>{c.fulfillment_note}</p>}</article>
    </section>
    <footer className={styles.footer}>ProofTTL · Evidence before confidence.</footer>
  </main>
}
