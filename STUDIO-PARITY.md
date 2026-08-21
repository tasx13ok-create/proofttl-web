# ProofTTL Studio capability ledger

This is the implementation ledger for ProofTTL Studio. It uses VS Code-class desktop IDE behavior as a benchmark, but a capability is only marked implemented when the product actually exposes working behavior.

Legend: **LIVE** = implemented in the Studio UI/code path. **PARTIAL** = useful subset exists but is not parity. **BACKEND-READY** = server route/foundation exists but UI/runtime availability must still be verified. **TODO** = not implemented.

## Core editor

| Capability | State | ProofTTL Studio status |
| --- | --- | --- |
| Multi-file workspace | LIVE | Local workspace with create, rename, delete, local autosave, active file state. |
| Multiple open editor tabs | LIVE | Up to eight recently opened files are represented as closable tabs. |
| Workspace search | LIVE | Search across file contents with jump-to-result. |
| Find / replace | LIVE | Active-file find, next, replace current, replace all. |
| Breadcrumbs | LIVE | Project → file → language. |
| Line / column status | LIVE | Tracks cursor line and column. |
| Line numbers | LIVE | Synchronized line-number rail. |
| Minimap | PARTIAL | Lightweight visual code overview, not semantic/editor-engine minimap parity. |
| Language mode | LIVE | TypeScript, JavaScript, Python, PowerShell, Bash, JSON, HTML, CSS, Markdown, text. |
| Multi-cursor / box selection | TODO | Requires a richer editor engine. |
| IntelliSense / semantic completion | TODO | Do not claim until language-service integration exists. |
| Go to definition / references / rename symbol | TODO | File rename exists; symbol-aware refactoring does not. |
| Code folding / sticky scroll | TODO | Not implemented. |
| Semantic highlighting / bracket colorization | TODO | Current textarea editor does not provide this. |
| Diff editor | TODO | Not implemented. |
| Snippets / Emmet | TODO | Not implemented. |

## Workbench

| Capability | State | ProofTTL Studio status |
| --- | --- | --- |
| Explorer | LIVE | File explorer with local/cloud project controls. |
| Search view | LIVE | Dedicated workspace search activity. |
| Command Palette | LIVE | Ctrl/Cmd+Shift+P command palette. |
| Quick Open | LIVE | Ctrl/Cmd+P file lookup through the palette. |
| Bottom panel | LIVE | Terminal, Problems, Output tabs. |
| Problems view | PARTIAL | JSON parse errors, TODO/FIXME markers, extreme line-length checks. Not a language-server diagnostic engine. |
| Output view | LIVE | Project, active file, routed model, storage, runner boundary. |
| Keyboard shortcuts | PARTIAL | Ctrl/Cmd+Shift+P, Ctrl/Cmd+P, Ctrl/Cmd+Shift+F, Ctrl/Cmd+F, Ctrl/Cmd+S, terminal history. |
| Custom layouts / themes / profiles | TODO | Not implemented. |
| Zen mode | TODO | Not implemented. |

## AI and agents

| Capability | State | ProofTTL Studio status |
| --- | --- | --- |
| Coding chat | LIVE | Active file + compact project manifest are sent to the routed coding model. |
| Review / tests / refactor / explain actions | LIVE | Prompt shortcuts in Model Playground. |
| Apply generated code | LIVE | First fenced code block can replace active file content. |
| Multiple server-approved model routes | BACKEND-READY | `/assistant/models` exposes the model catalog; actual routes depend on server configuration. |
| Agent mode with iterative tool use | TODO | Chat is not an autonomous multi-step coding agent yet. |
| Subagents | TODO | Not implemented. |
| Browser tools for agents | TODO | Not implemented. |
| Research agent | TODO | Not implemented in Studio. |
| Per-run cost visibility | TODO | Not implemented. |

## Terminal and execution

| Capability | State | ProofTTL Studio status |
| --- | --- | --- |
| Integrated terminal UI | LIVE | Browser-safe command surface with history and project commands. |
| Real code execution | BACKEND-READY | `/studio/run` and `/studio/runner` exist for isolated execution. Never use the production host shell. |
| JavaScript / Python / Bash sandbox | BACKEND-READY | Runner advertises these only when the isolated Vercel Sandbox adapter is configured. |
| PowerShell execution | TODO | Drafting is supported; execution remains disabled. |
| Split terminals | TODO | Not implemented. |
| Shell integration | TODO | Browser terminal is not a host shell. |

## Source control

| Capability | State | ProofTTL Studio status |
| --- | --- | --- |
| GitHub provider capability | BACKEND-READY | Connection/capability layer can report GitHub readiness. |
| Git status / diff / stage / commit | TODO | Not implemented in Studio. |
| Blame | TODO | Not implemented. |
| Branching / pull requests | TODO | Not implemented in Studio UI. |

## Debugging and testing

| Capability | State | ProofTTL Studio status |
| --- | --- | --- |
| AI-generated tests | LIVE | Studio AI can draft tests. |
| Problems panel | PARTIAL | Lightweight static checks only. |
| Test explorer | TODO | Not implemented. |
| Breakpoints / watches / call stack | TODO | Not implemented. |
| Debug console | TODO | Not implemented. |
| Runtime test execution | TODO | Depends on isolated runner wiring plus test adapters. |

## Browser and web development

| Capability | State | ProofTTL Studio status |
| --- | --- | --- |
| Built-in browser | TODO | Not implemented. |
| Screenshot / click / type automation | TODO | Not implemented. |
| Device emulation | TODO | Not implemented. |
| Per-site permissions | TODO | Not implemented. |

## Languages, notebooks, diagrams

| Capability | State | ProofTTL Studio status |
| --- | --- | --- |
| Plain-text language modes | LIVE | Multiple language modes are available. |
| Markdown editing | LIVE | Markdown is editable as text. |
| Markdown rendered preview | TODO | Not implemented. |
| Mermaid preview | TODO | Not implemented. |
| Jupyter notebooks | TODO | Not implemented. |

## Tasks and automation

| Capability | State | ProofTTL Studio status |
| --- | --- | --- |
| ProofTTL native tasks | LIVE | Account-owned task CRUD exists outside the Studio editor. |
| Automation definitions | LIVE | Account-owned automation definitions exist. |
| Automation executor / scheduler | TODO | Definitions are intentionally not presented as executed while the engine is disconnected. |
| Build tasks / problem matchers | TODO | Not implemented in Studio. |
| Launch configurations | TODO | Not implemented. |

## Extensions and MCP

| Capability | State | ProofTTL Studio status |
| --- | --- | --- |
| Extension marketplace | TODO | Not implemented. |
| Extension API | TODO | Not implemented. |
| MCP server management | TODO | Not implemented in Studio. |
| Provider connection registry | PARTIAL | ProofTTL Connections reports identity/model/developer/commerce/data rails and fails closed. |

## Remote and cloud development

| Capability | State | ProofTTL Studio status |
| --- | --- | --- |
| Local browser workspace | LIVE | Persists in browser storage. |
| ProofTTL cloud project storage | LIVE | Signed-in project create/save/load paths exist. |
| Remote SSH | TODO | Not implemented. |
| Dev Containers | TODO | Not implemented. |
| Codespaces | TODO | Not implemented. |
| Remote tunnels | TODO | Not implemented. |

## Priority order

1. Stabilize current Studio: compile/export, responsive layout, file/tab/search/find behaviors, cloud state, safe terminal.
2. Verify and connect the isolated code runner. Add run/test tasks only after sandbox isolation is proven live.
3. Replace the textarea with a real editor engine to unlock multi-cursor, syntax/semantic highlighting, folding, bracket behavior, completions, symbol navigation, and diff views.
4. Add Git source-control primitives with explicit scopes and confirmation for writes.
5. Add test explorer + debugger abstractions on top of isolated runtimes.
6. Add a built-in browser and agent browser tools with per-origin permissions and isolation.
7. Add agent mode/subagents only after tool permissions, receipts, cancellation, cost controls, and rollback behavior are explicit.
8. Add notebooks, extension/MCP management, and remote development only when the security model is clear.

ProofTTL Studio should never claim VS Code parity merely because the interface resembles an IDE. Capability claims must follow working behavior and verified runtime state.
