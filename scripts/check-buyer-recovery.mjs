import assert from 'node:assert/strict'
import ts from 'typescript'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
const compile = async path => ts.transpileModule(await readFile(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
const deadlines = { exports: {}, setTimeout, clearTimeout }
vm.runInNewContext(await compile('lib/request-deadline.ts'), deadlines)
await assert.rejects(deadlines.exports.withDeadline(new Promise(() => {}), 5, 'deadline'), /deadline/)
assert.equal(await deadlines.exports.withDeadline(Promise.resolve('session'), 100, 'deadline'), 'session')
await assert.rejects(deadlines.exports.withDeadline(Promise.reject(new Error('network')), 100, 'deadline'), /network/)
let options, destination
const window = { location: { origin: 'https://proofttl.test', pathname: '/login/', search: '', hash: '' }, self: {}, top: {location:{assign(url){destination=url}}}, localStorage: {setItem(){}, getItem(){return null}} }
const context = {exports:{}, process:{env:{}}, URL, URLSearchParams, window, require(name) {
  if (name === 'better-auth/react') return {createAuthClient:()=>({signIn:{social:async value=>{options=value;return {data:{url:'https://accounts.google.com/o/oauth2/auth'},error:null}}}})}
  return {twoFactorClient:()=>({}),passkeyClient:()=>({})}
}}
vm.runInNewContext(await compile('lib/proofttl-auth.ts'), context)
await context.exports.signInWithProvider('google','/audit/#audit-intake')
assert.equal(options.disableRedirect,true)
assert.equal(options.callbackURL,'https://proofttl.test/audit/#audit-intake')
assert.equal(destination,'https://accounts.google.com/o/oauth2/auth')
window.self=window.top; destination=undefined
await context.exports.signInWithProvider('google','https://untrusted.example/')
assert.equal(options.disableRedirect,false)
assert.equal(options.callbackURL,'https://proofttl.test/workspace/')
assert.equal(destination,undefined)
console.log('PASS: bounded session recovery, embedded OAuth browser navigation, normal redirects, and external return rejection.')
