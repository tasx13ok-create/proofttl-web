import fs from 'node:fs'
import path from 'node:path'
const root=process.cwd()
const requiredFiles=['app/page.tsx','app/audit/page.tsx','app/login/page.tsx','components/AuthLoginPanel.tsx','app/console/page.tsx','components/AccountWorkspacePanel.tsx','components/AccountPreferenceBridge.tsx','app/how-proofttl-works/page.tsx','app/workspace/page.tsx','components/ProofTTLOSWorkspace.tsx','components/ActionHistoryPanel.tsx','app/trust/page.tsx','app/trust.html/page.tsx','components/TrustCenter.tsx','lib/proofttl-capabilities.ts','lib/proofttl-command.ts','app/money/page.tsx','app/work/page.tsx','components/WorkTaskCenter.tsx','app/files/page.tsx','components/FilesCenter.tsx','app/automations/page.tsx','components/AutomationCenter.tsx','app/connections/page.tsx','components/ConnectionsCenter.tsx','app/studio/page.tsx','components/ProofTTLChatBar.tsx','components/StudioWorkbench.tsx','components/StudioRunnerPanel.tsx','lib/proofttl-assistant.ts']
for(const relative of requiredFiles)if(!fs.existsSync(path.join(root,relative)))throw new Error(`1000% guard: missing required product surface ${relative}`)
const read=(relative)=>fs.readFileSync(path.join(root,relative),'utf8')
const layout=read('app/layout.tsx'),home=read('app/page.tsx'),loginPanel=read('components/AuthLoginPanel.tsx'),accountWorkspace=read('components/AccountWorkspacePanel.tsx'),preferenceBridge=read('components/AccountPreferenceBridge.tsx'),guide=read('app/how-proofttl-works/page.tsx'),workspace=read('components/ProofTTLOSWorkspace.tsx'),actionHistory=read('components/ActionHistoryPanel.tsx'),trust=read('components/TrustCenter.tsx'),legacyTrust=read('app/trust.html/page.tsx'),capabilities=read('lib/proofttl-capabilities.ts'),commandClient=read('lib/proofttl-command.ts'),tasks=read('components/WorkTaskCenter.tsx'),files=read('components/FilesCenter.tsx'),automations=read('components/AutomationCenter.tsx'),connections=read('components/ConnectionsCenter.tsx'),studio=read('components/StudioWorkbench.tsx'),runner=read('components/StudioRunnerPanel.tsx'),assistant=read('lib/proofttl-assistant.ts'),audit=read('app/audit/page.tsx')
const checks=[
[layout.includes('TESTNET PREVIEW')&&layout.includes('Mainnet disabled'),'network truth banner'],
[layout.includes('/trust/')&&layout.includes('/how-proofttl-works/')&&layout.includes('/studio/')&&layout.includes('/workspace/')&&layout.includes('OPEN WORKSPACE'),'global trust/guide/studio/workspace links'],
[trust.includes('/readiness')&&trust.includes('/.well-known/proofttl-auth.json')&&/TRUST BOUNDARY/i.test(trust),'App Router Trust Center'],
[legacyTrust.includes("redirect('/trust/')"),'legacy Trust URL redirect'],
[/claim stress test/i.test(home)&&home.includes('$129')&&home.includes('$500'),'two-tier commercial offer'],
[/claim stress test/i.test(audit)&&/verification audit/i.test(audit),'audit offer ladder'],
[/Google/i.test(loginPanel)&&/Discord/i.test(loginPanel)&&/Passkey/i.test(loginPanel),'Google + Discord + passkey login surface'],
[/Fact Lease/i.test(guide)&&/L\.O\.V\.E\./i.test(guide)&&/monitor/i.test(guide),'full product explainer'],
[/Don.t choose an app/i.test(workspace)&&workspace.includes('/commands/plan')&&workspace.includes('/actions/plan')&&/CONFIRM ACTION/i.test(workspace),'universal command planning and confirmation workspace'],
[actionHistory.includes('/account/actions')&&/receipt trail/i.test(actionHistory),'account action ledger surface'],
[capabilities.includes("'money'")&&capabilities.includes("'work'")&&capabilities.includes("'files'")&&capabilities.includes("'automations'")&&capabilities.includes("'connections'"),'cross-platform capability map'],
[capabilities.includes('Cloud AI models')&&capabilities.includes('Vercel')&&capabilities.includes('GitHub')&&/Worlds \/ 3D/i.test(capabilities),'provider + creative capability map'],
[capabilities.includes('MONEY / SEND / DELETE / SECURITY')&&capabilities.includes('Explicit user confirmation'),'sensitive-action permission policy'],
[commandClient.includes('/commands/plan')&&commandClient.includes('/actions/plan')&&commandClient.includes("credentials: 'include'"),'credential-aware command/action planner client'],
[assistant.includes('resolvePlatformCommand')&&assistant.includes('command_planner')&&assistant.includes("'/workspace/'"),'global L.O.V.E. platform command routing'],
[tasks.includes('/account/tasks')&&/PROOFTTL NATIVE/i.test(tasks)&&/DONE/i.test(tasks),'native account Work tasks'],
[files.includes('/account/files')&&/200 KB MAX/i.test(files)&&/DELETE/i.test(files),'native account file library'],
[automations.includes('/account/automations')&&/EXECUTION ENGINE/i.test(automations)&&/SENSITIVE PRE-AUTH/i.test(automations),'account automation definition center'],
[connections.includes('/capabilities')&&connections.includes('/readiness')&&connections.includes('/studio/runner')&&/SERVER SIDE ONLY/i.test(connections),'live connections control plane'],
[/MODEL PLAYGROUND/i.test(studio)&&/TERMINAL/i.test(studio)&&/NO HOST SHELL/i.test(studio)&&/EXECUTION JOBS/i.test(studio),'Studio workspace/model/terminal/sandbox boundary'],
[studio.includes('/studio/projects')&&/CREATE CLOUD PROJECT/i.test(studio)&&/LOCAL FALLBACK/i.test(studio),'Studio authenticated cloud sync with local fallback'],
[runner.includes('/studio/run')&&runner.includes('/studio/runner')&&/production secrets/i.test(runner)&&/PowerShell execution stays disabled/i.test(runner),'Studio isolated runner truth surface'],
[accountWorkspace.includes('/account/preferences')&&accountWorkspace.includes('/account/audits')&&/signed-in account email exactly matches/i.test(accountWorkspace),'account-owned preferences and audit claiming'],
[accountWorkspace.includes('/assistant/models')&&/server-approved models/i.test(accountWorkspace),'safe server-approved model selector'],
[preferenceBridge.includes('pttl-pref-love-voice-off')&&preferenceBridge.includes('pttl-pref-love-compact')&&accountWorkspace.includes('proofttl-preferences-changed'),'live account preference bridge'],
[assistant.includes("'studio'")&&assistant.includes("'/studio/'")&&assistant.includes("'money'")&&assistant.includes("'connections'"),'L.O.V.E. cross-platform navigation'],
[/will not execute arbitrary code/i.test(assistant),'assistant arbitrary-code production-process refusal']]
const failed=checks.filter(([ok])=>!ok).map(([,label])=>label)
if(failed.length)throw new Error(`1000% product guard failed: ${failed.join(', ')}`)
console.log(`1000% product guard passed (${checks.length} invariants).`)
