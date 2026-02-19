# OpenFlowKit Whiteboard — Project Instructions

## What This Is

A personal whiteboard/diagramming tool built on OpenFlowKit (React Flow). Used to turn brain dumps into organized visual flowcharts and strategy maps. Features AI-powered flow generation via Flowpilot (OpenAI GPT-4o).

## Tech Stack

- **Framework:** React 19 + TypeScript 5.8
- **Canvas:** React Flow 11 (node/edge diagramming)
- **State:** Zustand (persisted to localStorage)
- **Styling:** Tailwind CSS 4
- **Build:** Vite 6
- **AI:** OpenAI GPT-4o (default), also supports Gemini, Claude, Groq, NVIDIA, Cerebras
- **Markdown in nodes:** react-markdown + remark-breaks (single `\n` = line break)
- **Icons:** All Lucide React icons available via PascalCase string keys (e.g., `'Video'`, `'Megaphone'`, `'Phone'`)
- **Testing:** Playwright MCP (configured in `.claude/settings.json`)

## Project Structure

```
src/
  constants.ts          ← INITIAL_NODES + INITIAL_EDGES (the whiteboard data)
  store.ts              ← Zustand store (tab name, persistence config, brand config)
  components/
    AIChatPanel.tsx      ← Expandable chat panel (collapsed pill → expanded chat)
    CustomNode.tsx       ← Node renderer (supports inline editing via double-click)
    FlowCanvas.tsx       ← React Flow canvas wrapper
    FlowEditor.tsx       ← Main editor with toolbar + properties panel
    Toolbar.tsx          ← Bottom toolbar (select/pan mode, add nodes, layout, undo/redo)
    command-bar/
      AIView.tsx         ← Full chat interface inside command bar (Cmd+K)
  hooks/
    useKeyboardShortcuts.ts ← Global keyboard handler (N, V, H, Delete, Cmd+K, etc.)
    useAIGeneration.ts      ← AI generation logic (prompt → DSL → nodes/edges)
    useAutoSave.ts          ← Saves active tab state to localStorage
  services/
    aiService.ts         ← AI provider routing (OpenAI, Claude, Gemini, etc.)
    geminiService.ts     ← Gemini SDK integration
  lib/types.ts           ← NodeType enum, NodeData interface
api/
  openai/[...path].ts   ← Vercel serverless proxy for OpenAI (CORS)
  anthropic/[...path].ts ← Vercel serverless proxy for Anthropic (CORS)
```

## How to Modify the Whiteboard

### When the user gives a brain dump or wants changes:

1. **Parse the brain dump** into logical sections (traffic sources, funnel stages, nurture tracks, annotations, KPIs, etc.)
2. **Ask clarifying questions** if anything is ambiguous — one at a time
3. **Edit `src/constants.ts`** — modify `INITIAL_NODES` and `INITIAL_EDGES`
4. **Important:** The store persists to localStorage. Changes to INITIAL_NODES/EDGES only take effect on first load or when localStorage is cleared. For returning users, the app uses persisted state.

### Node format:

```typescript
{
  id: 'unique-id',
  type: NodeType.PROCESS,  // START, PROCESS, DECISION, END, CUSTOM, ANNOTATION
  position: { x: 300, y: 500 },
  data: {
    label: 'Node Title',
    subLabel: 'Detail line 1\nDetail line 2\nDetail line 3',  // \n = line break
    icon: 'LucideIconName',  // PascalCase Lucide icon
    color: 'blue',  // blue, emerald, amber, red, violet, pink, cyan, slate
  },
}
```

### Edge format:

```typescript
createDefaultEdge('source-id', 'target-id', 'Optional Label', 'unique-edge-id')
```

Always provide a fixed edge ID (4th param) to avoid Date.now() randomness.

### Layout guidelines:

- **Left column** (x ~0): Traffic sources, nurture tracks
- **Center column** (x ~300): Main funnel flow, top to bottom
- **Right column** (x ~650-850): Paid ads, pixel fire, annotations
- **Vertical spacing:** 240px between connected nodes
- **Annotations** (NodeType.ANNOTATION): Yellow sticky notes for KPIs, notes, tech details
- **Decision nodes** (NodeType.DECISION): For qualification gates / forks
- **Edge density:** Keep max ~5 connections per node. If a node has 6+ edges, simplify by chaining through intermediate nodes instead of hub-and-spoke.

### Node types and when to use them:

| Type | Use for |
|------|---------|
| `START` | Entry points (emerald capsule) |
| `PROCESS` | Standard steps, most nodes (rounded) |
| `DECISION` | Qualification gates, yes/no forks (diamond, amber) |
| `END` | Terminal points — close, disqualified (capsule, red/emerald) |
| `ANNOTATION` | Side notes, KPIs, tech details (yellow sticky) |
| `CUSTOM` | Special items like "future" blocks (violet rounded) |

### Inline editing:

Users can double-click any label or sub-label text on a node to edit it directly on the canvas. Enter saves, Escape cancels, Shift+Enter for new line.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| N | Add node at center |
| V | Select mode |
| H | Pan mode |
| Cmd+K | Command bar (Flowpilot) |
| Cmd+F | Search |
| ? | Keyboard shortcuts help |
| Delete/Backspace | Delete selected |
| Cmd+Z / Cmd+Shift+Z | Undo / Redo |
| Cmd+D | Duplicate node |
| Cmd+A | Select all |

## AI Integration

### Provider setup:
- **Default:** OpenAI GPT-4o
- **API key:** Set via `VITE_ANTHROPIC_API_KEY` in `.env` (name is legacy, works for any provider)
- **CORS:** Browser can't call OpenAI/Anthropic directly. Vite proxy handles dev, Vercel edge functions handle prod.
- Provider config stored in `brandConfig.aiProvider` / `brandConfig.aiModel` in Zustand

### API key gotcha:
Zustand persist serializes `brandConfig.apiKey: undefined` to localStorage. On reload, this overwrites the env var default. Fix: `useAIGeneration.ts` falls back to `import.meta.env.VITE_ANTHROPIC_API_KEY` at runtime.

### CORS proxy architecture:
- **Dev:** Vite proxy in `vite.config.ts` — `/api/openai/*` → `api.openai.com/v1/*`
- **Prod:** Vercel edge functions in `api/openai/[...path].ts` and `api/anthropic/[...path].ts`
- **Gemini:** Uses Google GenAI SDK directly (supports CORS natively, no proxy needed)

## Development Workflow

```bash
npm install
npm run dev          # Starts Vite dev server (with CORS proxy)
npx tsc --noEmit     # Typecheck
npm run build        # Production build
```

### After changing INITIAL_NODES/EDGES:
Clear localStorage so defaults take effect:
```js
localStorage.removeItem('openflowkit-storage');
localStorage.removeItem('flowmind_app_state');
location.reload();
```
Or use AppleScript: `osascript -e 'tell application "Google Chrome" to tell active tab of front window to execute javascript "localStorage.removeItem(\"openflowkit-storage\"); localStorage.removeItem(\"flowmind_app_state\"); location.reload();"'`

### Testing:
- Playwright MCP configured in `.claude/settings.json` for browser testing
- Start a new Claude Code session after adding the config for tools to load

## Code Style

- Prefer `type` over `interface`
- No `enum` in new code (existing NodeType enum is fine)
- Keep node data concise — use `\n` for line breaks in subLabels
- Icons: use PascalCase Lucide names as strings
- `e.stopPropagation()` on all input `onKeyDown` handlers in floating panels to prevent canvas shortcuts (N, V, H, Delete)

## Common Mistakes to Avoid

- **localStorage caching:** If you change INITIAL_NODES but the browser already has persisted state, the old data shows. Clear both `openflowkit-storage` AND `flowmind_app_state` keys.
- **Edge IDs:** Always pass a fixed 4th argument to `createDefaultEdge()` — without it, `Date.now()` makes IDs non-deterministic.
- **Dual persistence conflict:** Zustand persist (`openflowkit-storage`) and useAutoSave (`flowmind_app_state`) both write to localStorage. useAutoSave must NOT call `setActiveTabId()` on load — let URL routing handle that, otherwise New Flow navigation breaks.
- **CORS on AI calls:** OpenAI and Anthropic APIs don't support CORS. All browser fetch calls must go through the Vite proxy (dev) or Vercel edge functions (prod). Only Gemini works directly from the browser.
- **Node overlap:** Dense subLabels make nodes taller than expected. Leave at least 240px vertical gap.
- **Keyboard events in editing:** CustomNode and AIChatPanel stop propagation during text input so typing doesn't trigger canvas shortcuts.
- **Edge animation default:** `DEFAULT_EDGE_OPTIONS.animated` and `globalEdgeOptions.animated` should both be `false`. Animated edges are distracting for whiteboard use.

## Deployment

Deployed to Vercel. Push to main branch to auto-deploy.

```bash
npx vercel --prod    # Manual deploy
```

**Important:** The `api/` directory contains Vercel edge functions for the AI proxy. These deploy automatically with the app. The `VITE_ANTHROPIC_API_KEY` env var must also be set in Vercel's environment variables for production AI to work.
