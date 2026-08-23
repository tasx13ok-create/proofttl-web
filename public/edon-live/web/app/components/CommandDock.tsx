'use client';

import { usePathname } from 'next/navigation';
import styles from './CommandDock.module.css';

export default function CommandDock(){
  const pathname=usePathname();
  if(pathname==='/login')return null;
  const items=[
    ['ENTITY','/'],
    ['VISION','/vision'],
    ['CAMERAS','/cameras'],
    ['MEMORY','/memory'],
    ['TASKS','/tasks'],
    ['EVOLVE','/evolution'],
    ['SYSTEMS','/systems']
  ];
  return <nav className={styles.dock} aria-label="Unified Entity navigation">{items.map(([label,href])=>{
    const active=href==='/'?pathname==='/':pathname.startsWith(href);
    return <a key={href} href={href} className={active?styles.active:undefined}><span>{label}</span></a>;
  })}</nav>;
}
