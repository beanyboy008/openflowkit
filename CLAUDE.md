# OpenFlowKit Whiteboard — Project Instructions

## What This Is

A personal whiteboard/diagramming tool built on OpenFlowKit (React Flow). Used to turn brain dumps into organized visual flowcharts and strategy maps.

## Tech Stack

- **Framework:** React 19 + TypeScript 5.8
- **Canvas:** React Flow 11 (node/edge diagramming)
- **State:** Zustand (persisted to localStorage)
- **Styling:** Tailwind CSS 4
- **Build:** Vite 6
- **Markdown in nodes:** react-markdown + remark-breaks (single `\n` = line break)
- **Icons:** All Lucide React icons available via PascalCase string keys (e.g., `'Video'`, `'Megaphone'`, `'Phone'`)

## Project Structure

```
src/
  constants.ts        ← INITIAL_NODES + INITIAL_EDGES (the whiteboard data)
  store.ts            ← Zustand store (tab name, persistence config)
  components/
    CustomNode.tsx     ← Node renderer (supports inline editing via double-click)
    FlowCanvas.tsx     ← React Flow canvas wrapper
    FlowEditor.tsx     ← Main editor with toolbar + properties panel
  lib/types.ts         ← NodeType enum, NodeData interface
  services/templates.ts ← Built-in templates (not used for our whiteboard)
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

- **Center column** (x ~300): Main funnel flow, top to bottom
- **Left column** (x ~-350): Nurture/follow-up tracks
- **Right column** (x ~650-900): Annotations, side paths, ad breakdowns
- **Vertical spacing:** ~230-250px between connected nodes minimum
- **Annotations** (NodeType.ANNOTATION): Yellow sticky notes for KPIs, notes, tech details
- **Decision nodes** (NodeType.DECISION): For qualification gates / forks

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

## Development Workflow

```bash
npm install
npm run dev          # Starts Vite dev server
npx tsc --noEmit     # Typecheck
```

## Code Style

- Prefer `type` over `interface`
- No `enum` in new code (existing NodeType enum is fine)
- Keep node data concise — use `\n` for line breaks in subLabels
- Icons: use PascalCase Lucide names as strings

## Common Mistakes to Avoid

- **localStorage caching:** If you change INITIAL_NODES but the browser already has persisted state, the old data shows. User needs to clear localStorage or use a fresh browser.
- **Edge IDs:** Always pass a fixed 4th argument to `createDefaultEdge()` — without it, `Date.now()` makes IDs non-deterministic.
- **Circular edges:** The Re-engage loop (nurture30 → book) creates a cycle. React Flow handles this fine, but be careful not to create infinite loops in the visual.
- **Node overlap:** Dense subLabels make nodes taller than expected. Leave at least 230px vertical gap.
- **Keyboard events in editing:** CustomNode stops propagation during inline edit so typing doesn't trigger React Flow shortcuts (like Delete key deleting the node).

## Deployment

Deployed to Vercel. Push to main branch to auto-deploy.

```bash
npx vercel --prod    # Manual deploy
```
