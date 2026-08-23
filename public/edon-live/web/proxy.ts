import { NextRequest, NextResponse } from 'next/server';
import { webAuthorized } from './lib/auth';

const publicShellAssets=new Set(['/manifest.webmanifest','/sw.js','/offline.html','/edon-icon.svg']);

export function proxy(request:NextRequest){
  const path=request.nextUrl.pathname;
  if(path==='/login'||path==='/api/auth/login'||path.startsWith('/_next/')||path==='/favicon.ico'||publicShellAssets.has(path))return NextResponse.next();
  const auth=webAuthorized(request);
  if(auth.ok)return NextResponse.next();
  if(path.startsWith('/api/'))return NextResponse.json({error:auth.error},{status:auth.status});
  return NextResponse.redirect(new URL('/login',request.url));
}

export const config={matcher:['/((?!_next/static|_next/image).*)']};
