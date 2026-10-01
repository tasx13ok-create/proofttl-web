'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './page.module.css'

type Agent = {
  id:string
  name:string
  role:string
  pairId:string
  status:string
  currentTask:string
  note:string
  mode:string
  revenueInfluencedCents:number
}

type Experiment = {
  id:string
  title:string
  score:number
  price:number
  channel:string
  stage:string
  revenueCents:number
}

type FoundryState = {
  generatedAt:string
  system:string
  mode:string
  revenueCents:number
  spendCents:number
  profitCents:number
  reinvestCeilingCents:number
  agents:Agent[]
  experiments:Experiment[]
}

const emptyState:FoundryState = {
  generatedAt:'',
  system:'FOUNDRY-10',
  mode:'zero-spend',
  revenueCents:0,
  spendCents:0,
  profitCents:0,
  reinvestCeilingCents:0,
  agents:[],
  experiments:[],
}

function money(cents:number){
  return '$' + ((Number(cents) || 0) / 100).toFixed(2)
}

function labelSprite(THREE:any,title:string,line:string){
  const c=document.createElement('canvas')
  c.width=512
  c.height=180
  const x=c.getContext('2d')
  if(!x) return null
  x.fillStyle='rgba(7,10,15,.94)'
  x.fillRect(0,0,512,180)
  x.strokeStyle='rgba(255,255,255,.22)'
  x.lineWidth=3
  x.strokeRect(2,2,508,176)
  x.fillStyle='#fff'
  x.font='600 30px system-ui'
  x.fillText(title.slice(0,28),24,60)
  x.fillStyle='#9aa6b6'
  x.font='22px system-ui'
  x.fillText(line.slice(0,38),24,108)
  const texture=new THREE.CanvasTexture(c)
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true}))
  sprite.scale.set(3.8,1.34,1)
  return sprite
}

export default function FoundryOffice(){
  const mountRef=useRef<HTMLDivElement|null>(null)
  const [state,setState]=useState<FoundryState>(emptyState)
  const [error,setError]=useState('')

  useEffect(()=>{
    let alive=true
    const load=()=>{
      fetch('/foundry-10-state.json?ts='+Date.now(),{cache:'no-store'})
        .then(r=>{if(!r.ok) throw new Error('state unavailable'); return r.json()})
        .then(d=>{if(alive) setState(d)})
        .catch(()=>{if(alive) setError('Cloud state has not completed its first cycle yet.')})
    }
    load()
    const t=window.setInterval(load,15000)
    return()=>{alive=false;window.clearInterval(t)}
  },[])

  useEffect(()=>{
    if(!mountRef.current) return
    let disposed=false
    let raf=0
    let cleanup=()=>{}

    const boot=async()=>{
      const moduleUrl=['https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.min.js'].join('')
      const THREE:any=await import(/* webpackIgnore: true */ moduleUrl)
      if(disposed||!mountRef.current) return

      const host=mountRef.current
      const scene=new THREE.Scene()
      scene.background=new THREE.Color(0x050608)
      scene.fog=new THREE.Fog(0x050608,16,46)

      const camera=new THREE.PerspectiveCamera(68,host.clientWidth/host.clientHeight,.1,100)
      camera.position.set(0,1.75,11)

      const renderer=new THREE.WebGLRenderer({antialias:true})
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
      renderer.setSize(host.clientWidth,host.clientHeight)
      renderer.shadowMap.enabled=true
      host.appendChild(renderer.domElement)

      scene.add(new THREE.HemisphereLight(0xb8d8ff,0x111218,1.5))
      const key=new THREE.DirectionalLight(0xffffff,1.7)
      key.position.set(4,9,4)
      key.castShadow=true
      scene.add(key)

      const floor=new THREE.Mesh(
        new THREE.PlaneGeometry(24,30),
        new THREE.MeshStandardMaterial({color:0x12161d,roughness:.92})
      )
      floor.rotation.x=-Math.PI/2
      floor.receiveShadow=true
      scene.add(floor)

      const wallMat=new THREE.MeshStandardMaterial({color:0x171c25,roughness:.8})
      const back=new THREE.Mesh(new THREE.BoxGeometry(24,5,.25),wallMat)
      back.position.set(0,2.5,-5.5)
      scene.add(back)
      const left=new THREE.Mesh(new THREE.BoxGeometry(.25,5,30),wallMat)
      left.position.set(-12,2.5,7)
      scene.add(left)
      const right=left.clone()
      right.position.x=12
      scene.add(right)

      const board=new THREE.Mesh(
        new THREE.BoxGeometry(8.5,3,.18),
        new THREE.MeshStandardMaterial({color:0x0a0d12,emissive:0x0b1712,emissiveIntensity:.7})
      )
      board.position.set(0,2.7,-5.22)
      scene.add(board)
      const boardText=labelSprite(THREE,'FOUNDRY-10','REALIZED PROFIT '+money(state.profitCents))
      if(boardText){boardText.position.set(0,2.7,-5.08);scene.add(boardText)}

      const deskMat=new THREE.MeshStandardMaterial({color:0x3a2d22,roughness:.72})
      const metalMat=new THREE.MeshStandardMaterial({color:0x2b3038,roughness:.45,metalness:.55})
      const screenMat=new THREE.MeshStandardMaterial({color:0x071017,emissive:0x3ddc97,emissiveIntensity:.62})
      const chairMat=new THREE.MeshStandardMaterial({color:0x20252d,roughness:.85})

      const positions=[[-7.5,4],[-2.5,4],[2.5,4],[7.5,4],[-7.5,-1],[-2.5,-1],[2.5,-1],[7.5,-1],[-4,-4],[4,-4]]

      positions.forEach((p,index)=>{
        const agent:any=state.agents[index]||{name:'Agent '+(index+1),currentTask:'Awaiting cloud cycle',status:'queued'}
        const desk=new THREE.Mesh(new THREE.BoxGeometry(3.4,.18,1.5),deskMat)
        desk.position.set(p[0],.92,p[1])
        desk.castShadow=true
        scene.add(desk)

        const legA=new THREE.Mesh(new THREE.BoxGeometry(.12,.9,.12),metalMat)
        legA.position.set(p[0]-1.45,.45,p[1]-.55)
        scene.add(legA)
        const legB=legA.clone()
        legB.position.x=p[0]+1.45
        scene.add(legB)

        const monitor=new THREE.Mesh(new THREE.BoxGeometry(1.45,.82,.08),screenMat)
        monitor.position.set(p[0],1.55,p[1]-.35)
        scene.add(monitor)
        const stand=new THREE.Mesh(new THREE.BoxGeometry(.08,.45,.08),metalMat)
        stand.position.set(p[0],1.18,p[1]-.35)
        scene.add(stand)

        const chair=new THREE.Mesh(new THREE.BoxGeometry(1,.95,.95),chairMat)
        chair.position.set(p[0],.7,p[1]+1.15)
        scene.add(chair)

        const avatar=new THREE.Mesh(
          new THREE.CapsuleGeometry(.26,.72,4,8),
          new THREE.MeshStandardMaterial({
            color:agent.status==='working'?0x5be7a9:0x7a8492,
            emissive:agent.status==='working'?0x123c2a:0x000000,
            emissiveIntensity:.8
          })
        )
        avatar.position.set(p[0],1.2,p[1]+.72)
        scene.add(avatar)

        const text=labelSprite(THREE,agent.name,agent.currentTask)
        if(text){text.position.set(p[0],2.7,p[1]-.28);scene.add(text)}
      })

      const coffeeCounter=new THREE.Mesh(new THREE.BoxGeometry(3.2,1.05,1.1),deskMat)
      coffeeCounter.position.set(9.4,.52,8.5)
      scene.add(coffeeCounter)
      const coffee=new THREE.Mesh(new THREE.BoxGeometry(.7,.85,.65),metalMat)
      coffee.position.set(9.4,1.38,8.5)
      scene.add(coffee)

      for(const px of [-9.7,9.7]){
        for(const pz of [1.2,7]){
          const pot=new THREE.Mesh(new THREE.CylinderGeometry(.38,.5,.58,16),new THREE.MeshStandardMaterial({color:0x3a2c26}))
          pot.position.set(px,.29,pz)
          scene.add(pot)
          const plant=new THREE.Mesh(new THREE.SphereGeometry(.72,16,12),new THREE.MeshStandardMaterial({color:0x2f7d56,roughness:.9}))
          plant.scale.y=1.5
          plant.position.set(px,1.05,pz)
          scene.add(plant)
        }
      }

      const keys=new Set<string>()
      let yaw=0
      let pitch=0
      let locked=false

      const down=(e:KeyboardEvent)=>keys.add(e.code)
      const up=(e:KeyboardEvent)=>keys.delete(e.code)
      const click=()=>renderer.domElement.requestPointerLock()
      const lock=()=>{locked=document.pointerLockElement===renderer.domElement}
      const move=(e:MouseEvent)=>{
        if(!locked) return
        yaw-=e.movementX*.0024
        pitch-=e.movementY*.002
        pitch=Math.max(-1.15,Math.min(1.15,pitch))
      }

      window.addEventListener('keydown',down)
      window.addEventListener('keyup',up)
      renderer.domElement.addEventListener('click',click)
      document.addEventListener('pointerlockchange',lock)
      document.addEventListener('mousemove',move)

      const clock=new THREE.Clock()
      const forward=new THREE.Vector3()
      const side=new THREE.Vector3()

      const animate=()=>{
        raf=requestAnimationFrame(animate)
        const dt=Math.min(clock.getDelta(),.04)
        camera.rotation.order='YXZ'
        camera.rotation.y=yaw
        camera.rotation.x=pitch
        forward.set(-Math.sin(yaw),0,-Math.cos(yaw))
        side.set(Math.cos(yaw),0,-Math.sin(yaw))
        const speed=keys.has('ShiftLeft')?6:3.2
        if(keys.has('KeyW')) camera.position.addScaledVector(forward,speed*dt)
        if(keys.has('KeyS')) camera.position.addScaledVector(forward,-speed*dt)
        if(keys.has('KeyA')) camera.position.addScaledVector(side,-speed*dt)
        if(keys.has('KeyD')) camera.position.addScaledVector(side,speed*dt)
        camera.position.x=Math.max(-11.2,Math.min(11.2,camera.position.x))
        camera.position.z=Math.max(-4.6,Math.min(20.5,camera.position.z))
        camera.position.y=1.75
        renderer.render(scene,camera)
      }
      animate()

      const resize=()=>{
        camera.aspect=host.clientWidth/host.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(host.clientWidth,host.clientHeight)
      }
      window.addEventListener('resize',resize)

      cleanup=()=>{
        cancelAnimationFrame(raf)
        window.removeEventListener('keydown',down)
        window.removeEventListener('keyup',up)
        window.removeEventListener('resize',resize)
        document.removeEventListener('pointerlockchange',lock)
        document.removeEventListener('mousemove',move)
        renderer.domElement.removeEventListener('click',click)
        renderer.dispose()
        if(renderer.domElement.parentElement===host) host.removeChild(renderer.domElement)
      }
    }

    boot().catch(()=>setError('Three.js office failed to load. The data dashboard below is still usable.'))
    return()=>{disposed=true;cleanup()}
  },[state.generatedAt])

  const working=useMemo(()=>state.agents.filter(a=>a.status==='working').length,[state.agents])

  return(
    <main className={styles.shell}>
      <section className={styles.viewport}>
        <div className={styles.canvas} ref={mountRef}/>
        <div className={styles.hud}>
          <div className={styles.metric}><span>Agents</span><strong>{state.agents.length||10}</strong></div>
          <div className={styles.metric}><span>Working</span><strong>{working}</strong></div>
          <div className={styles.metric}><span>Revenue</span><strong>{money(state.revenueCents)}</strong></div>
          <div className={styles.metric}><span>Profit</span><strong>{money(state.profitCents)}</strong></div>
          <div className={styles.metric}><span>Reinvest cap</span><strong>{money(state.reinvestCeilingCents)}</strong></div>
        </div>
        <div className={styles.controls}>Click the office to capture the mouse. WASD to walk, mouse to look, Shift to move faster. Desk labels come from the latest cloud cycle.</div>
      </section>

      <section className={styles.detail}>
        <div className={styles.header}>
          <div>
            <h1>FOUNDRY-10</h1>
            <p>Ten cloud workers arranged as five independent two-agent checks. Revenue stays zero until actual realized money is recorded.</p>
          </div>
          <div className={styles.badge}>{state.mode}</div>
        </div>

        {error?<p className={styles.muted}>{error}</p>:null}

        <div className={styles.grid}>
          {state.agents.map(agent=>(
            <article className={styles.card} key={agent.id}>
              <div className={styles.cardTop}>
                <div><h3>{agent.name}</h3><small>{agent.role} · {agent.pairId}</small></div>
                <span className={styles.status}>{agent.status}</span>
              </div>
              <p className={styles.task}>{agent.currentTask}</p>
              <p>{agent.note||'No completed note yet.'}</p>
              <small>{agent.mode}</small>
            </article>
          ))}
        </div>

        <h2 className={styles.sectionTitle}>Experiment queue</h2>
        <div style={{overflowX:'auto'}}>
          <table className={styles.table}>
            <thead><tr><th>Experiment</th><th>Score</th><th>Price</th><th>Stage</th><th>Channel</th><th>Revenue</th></tr></thead>
            <tbody>
              {state.experiments.length?state.experiments.map(exp=>(
                <tr key={exp.id}>
                  <td>{exp.title}</td>
                  <td>{exp.score}</td>
                  <td>{'$'+exp.price}</td>
                  <td>{exp.stage}</td>
                  <td>{exp.channel}</td>
                  <td>{money(exp.revenueCents)}</td>
                </tr>
              )):<tr><td colSpan={6} className={styles.muted}>First cloud cycle has not populated experiments yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className={styles.muted}>Last cloud state: {state.generatedAt||'not yet generated'}</p>
      </section>
    </main>
  )
}
