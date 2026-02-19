import { Edge, Node, MarkerType } from 'reactflow';
import { NodeType } from '@/lib/types';

// --- Edge Styles (inline for reliable SVG rendering) ---
export const EDGE_STYLE = { stroke: '#94a3b8', strokeWidth: 2 };
export const EDGE_LABEL_STYLE = { fill: '#334155', fontWeight: 500, fontSize: 12 };
export const EDGE_LABEL_BG_STYLE = { fill: '#ffffff', stroke: '#cbd5e1', strokeWidth: 1 };

/** Shared edge configuration — use `createDefaultEdge()` for most cases. */
export const DEFAULT_EDGE_OPTIONS = {
  type: 'smoothstep' as const,
  markerEnd: { type: MarkerType.ArrowClosed },
  animated: true,
  style: EDGE_STYLE,
  labelStyle: EDGE_LABEL_STYLE,
  labelBgStyle: EDGE_LABEL_BG_STYLE,
  labelBgPadding: [8, 4] as [number, number],
  labelBgBorderRadius: 4,
};

/** Creates a fully-configured edge with standard OpenFlow styling. */
export const createDefaultEdge = (
  source: string,
  target: string,
  label?: string,
  id?: string
): Edge => ({
  id: id || `e-${source}-${target}-${Date.now()}`,
  source,
  target,
  label,
  ...DEFAULT_EDGE_OPTIONS,
});

export const EDGE_CONDITION_STYLES = {
  default: { stroke: '#94a3b8', strokeWidth: 2 },
  yes: { stroke: '#10b981', strokeWidth: 2 },
  no: { stroke: '#ef4444', strokeWidth: 2 },
  success: { stroke: '#10b981', strokeWidth: 2 },
  error: { stroke: '#ef4444', strokeWidth: 2 },
  timeout: { stroke: '#f59e0b', strokeWidth: 2 },
};

export const EDGE_CONDITION_LABELS = {
  yes: 'Yes',
  no: 'No',
  success: 'Success',
  error: 'Error',
  timeout: 'Timeout',
};

// --- Layout ---
export const NODE_WIDTH = 250;
export const NODE_HEIGHT = 150;

// --- Node Colors for MiniMap ---
export const MINIMAP_NODE_COLORS: Record<string, string> = {
  start: '#10b981', // emerald-500
  process: '#3b82f6', // blue-500
  decision: '#f59e0b', // amber-500
  end: '#ef4444', // red-500
  custom: '#6366f1', // indigo-500
  annotation: '#e2e8f0', // slate-200
  section: 'rgba(241, 245, 249, 0.5)', // slate-100/50
  text: 'transparent'
};

// --- Initial Data: Richard Norris Scaling Plan ---
export const INITIAL_NODES: Node[] = [
  // ========== TARGET KPIs (top-right annotation) ==========
  {
    id: 'rn-kpi',
    type: NodeType.ANNOTATION,
    position: { x: 850, y: -80 },
    data: {
      label: 'Target KPIs',
      subLabel: '$50–$300 cost per booked call\n85% show-up rate\n50% close rate\n30-day nurture window',
    },
  },

  // ========== TRAFFIC: PERSONAL BRAND (top-left) ==========
  {
    id: 'rn-brand',
    type: NodeType.PROCESS,
    position: { x: -50, y: 80 },
    data: {
      label: 'Personal Brand',
      subLabel: '30 videos/month\n70% short form / 30% long form\nAll platforms\nWinners → test as hooks for ads\nSpend X to push videos out\nWinners → feed into Hammer Them',
      icon: 'Video',
      color: 'emerald',
    },
  },

  // ========== TRAFFIC: PAID ADS (top-right header) ==========
  {
    id: 'rn-paid',
    type: NodeType.PROCESS,
    position: { x: 650, y: 30 },
    data: {
      label: 'Paid Ads',
      subLabel: 'Facebook (primary) + YouTube (secondary)\nNot reliant on Richard',
      icon: 'Megaphone',
      color: 'blue',
    },
  },

  // --- Ad Types (under Paid Ads) ---
  {
    id: 'rn-ugc',
    type: NodeType.PROCESS,
    position: { x: 480, y: 280 },
    data: {
      label: 'UGC Ads',
      subLabel: 'Test 12/month\nDisqualify in ad copy',
      icon: 'Users',
      color: 'blue',
    },
  },
  {
    id: 'rn-image',
    type: NodeType.PROCESS,
    position: { x: 700, y: 280 },
    data: {
      label: 'Image Ads',
      subLabel: 'Test 12/month',
      icon: 'Image',
      color: 'blue',
    },
  },
  {
    id: 'rn-character',
    type: NodeType.PROCESS,
    position: { x: 920, y: 280 },
    data: {
      label: 'Brand Character Ads',
      subLabel: 'Shoot 12 hooks/month\nDisqualify in ad copy',
      icon: 'UserCircle',
      color: 'blue',
    },
  },

  // --- Warm Up FB (annotation near Paid Ads) ---
  {
    id: 'rn-warmup',
    type: NodeType.ANNOTATION,
    position: { x: 1050, y: 50 },
    data: {
      label: 'Warm Up Facebook',
      subLabel: 'Non-selling videos to warm up ad account',
    },
  },

  // ========== FUNNEL (center column) ==========
  {
    id: 'rn-optin',
    type: NodeType.PROCESS,
    position: { x: 300, y: 500 },
    data: {
      label: 'Opt-In Page',
      subLabel: 'PropertyConsulting.io\nPop-up: name, email, phone',
      icon: 'Globe',
      color: 'cyan',
    },
  },
  {
    id: 'rn-vsl',
    type: NodeType.PROCESS,
    position: { x: 300, y: 720 },
    data: {
      label: 'VSL',
      subLabel: 'Reshoot video + add metrics',
      icon: 'Play',
      color: 'violet',
    },
  },
  {
    id: 'rn-qualify',
    type: NodeType.DECISION,
    position: { x: 300, y: 950 },
    data: {
      label: 'Qualification Pop-Up',
      subLabel: 'Fillout form\nHow many rental properties?\nLiquid capital: 25K / 25-50K / 50-100K / 100-150K / 150K+\nQualified = 50K+',
      icon: 'ClipboardCheck',
      color: 'amber',
    },
  },

  // --- Pixel Fire (qualified path, offset right) ---
  {
    id: 'rn-pixel',
    type: NodeType.PROCESS,
    position: { x: 650, y: 1150 },
    data: {
      label: 'FB Pixel Fires',
      subLabel: 'Fillout → Zapier → FB CAPI\nConversion event sent',
      icon: 'Zap',
      color: 'emerald',
    },
  },

  // --- Book a Call ---
  {
    id: 'rn-book',
    type: NodeType.PROCESS,
    position: { x: 300, y: 1350 },
    data: {
      label: 'Book a Call',
      subLabel: 'Fillout calendar\nBoth qualified & non-qualified book',
      icon: 'Calendar',
      color: 'amber',
    },
  },

  // --- Note: Double bookings later ---
  {
    id: 'rn-booknote',
    type: NodeType.ANNOTATION,
    position: { x: 680, y: 1380 },
    data: {
      label: 'Future: Double Bookings',
      subLabel: 'Later: double-book or use another closer for non-qualified calls',
    },
  },

  // --- Post-Book Qualification Page ---
  {
    id: 'rn-postbookpage',
    type: NodeType.PROCESS,
    position: { x: 300, y: 1600 },
    data: {
      label: 'Post-Book Qualification Page',
      subLabel: 'Qualification VSL\nGets them warmed up for the call',
      icon: 'Shield',
      color: 'violet',
    },
  },

  // --- Sales Call ---
  {
    id: 'rn-call',
    type: NodeType.PROCESS,
    position: { x: 300, y: 1850 },
    data: {
      label: 'Sales Call',
      subLabel: '85% show-up rate target\nDouble book to achieve',
      icon: 'PhoneCall',
      color: 'emerald',
    },
  },

  // --- Close ---
  {
    id: 'rn-close',
    type: NodeType.END,
    position: { x: 300, y: 2100 },
    data: {
      label: 'Close',
      subLabel: '50% close rate target\nPayment plans set up\nFrame: pay nothing up front, earn from properties',
      icon: 'CheckCircle',
      color: 'emerald',
    },
  },

  // ========== NURTURE SYSTEM (left column) ==========
  {
    id: 'rn-nurture30',
    type: NodeType.PROCESS,
    position: { x: -350, y: 1350 },
    data: {
      label: '30-Day Email & SMS Nurture',
      subLabel: 'Drop-offs / no-shows\nDrives prospects back to book a call',
      icon: 'Mail',
      color: 'pink',
    },
  },
  {
    id: 'rn-hammer',
    type: NodeType.PROCESS,
    position: { x: -350, y: 1600 },
    data: {
      label: '"Hammer Them" Retargeting',
      subLabel: 'Jeremy Haynes strategy\nRetargeting ads between book → call\nIndoctrination videos\nIncludes personal brand winners',
      icon: 'Zap',
      color: 'red',
    },
  },
  {
    id: 'rn-postbookems',
    type: NodeType.PROCESS,
    position: { x: -350, y: 1850 },
    data: {
      label: 'Post-Booking Email & SMS',
      subLabel: 'Gets them to show up',
      icon: 'MessageSquare',
      color: 'pink',
    },
  },

  // ========== FUTURE (bottom) ==========
  {
    id: 'rn-future',
    type: NodeType.CUSTOM,
    position: { x: 300, y: 2350 },
    data: {
      label: 'Backend — FUTURE',
      subLabel: 'Ascension upsells\nCross-sells\nRevenue retention\nAfter front end works',
      icon: 'Rocket',
      color: 'slate',
    },
  },
];

export const INITIAL_EDGES: Edge[] = [
  // Paid Ads → Ad Types
  createDefaultEdge('rn-paid', 'rn-ugc', undefined, 'e-paid-ugc'),
  createDefaultEdge('rn-paid', 'rn-image', undefined, 'e-paid-image'),
  createDefaultEdge('rn-paid', 'rn-character', undefined, 'e-paid-character'),

  // Traffic Sources → Opt-In
  createDefaultEdge('rn-brand', 'rn-optin', undefined, 'e-brand-optin'),
  createDefaultEdge('rn-paid', 'rn-optin', undefined, 'e-paid-optin'),

  // Main Funnel
  createDefaultEdge('rn-optin', 'rn-vsl', undefined, 'e-optin-vsl'),
  createDefaultEdge('rn-vsl', 'rn-qualify', undefined, 'e-vsl-qualify'),

  // Qualification Fork
  createDefaultEdge('rn-qualify', 'rn-pixel', 'Qualified 50K+', 'e-qualify-pixel'),
  createDefaultEdge('rn-qualify', 'rn-book', '< 50K', 'e-qualify-book'),
  createDefaultEdge('rn-pixel', 'rn-book', undefined, 'e-pixel-book'),

  // Funnel continues
  createDefaultEdge('rn-book', 'rn-postbookpage', undefined, 'e-book-postbookpage'),
  createDefaultEdge('rn-postbookpage', 'rn-call', undefined, 'e-postbookpage-call'),
  createDefaultEdge('rn-call', 'rn-close', undefined, 'e-call-close'),

  // Nurture: 30-Day safety net
  createDefaultEdge('rn-book', 'rn-nurture30', 'Drop-offs / No-shows', 'e-book-nurture30'),
  createDefaultEdge('rn-nurture30', 'rn-book', 'Re-engage', 'e-nurture30-book'),

  // Nurture: Post-booking tracks
  createDefaultEdge('rn-book', 'rn-hammer', 'Booked', 'e-book-hammer'),
  createDefaultEdge('rn-book', 'rn-postbookems', 'Booked', 'e-book-postbookems'),
  createDefaultEdge('rn-hammer', 'rn-call', undefined, 'e-hammer-call'),
  createDefaultEdge('rn-postbookems', 'rn-call', 'Show up', 'e-postbookems-call'),

  // Future
  createDefaultEdge('rn-close', 'rn-future', undefined, 'e-close-future'),
];

// Dash pattern definitions for edge styling
export const EDGE_DASH_PATTERNS: Record<string, { label: string; strokeDasharray: string }> = {
  solid: { label: 'Solid', strokeDasharray: '' },
  dashed: { label: 'Dashed', strokeDasharray: '8 4' },
  dotted: { label: 'Dotted', strokeDasharray: '2 4' },
  dashdot: { label: 'Dash-Dot', strokeDasharray: '8 4 2 4' },
};

// --- Keyboard Shortcuts ---
export const KEYBOARD_SHORTCUTS = [
  {
    title: 'Essentials',
    items: [
      { label: 'Undo', keys: ['Cmd', 'Z'] },
      { label: 'Redo', keys: ['Cmd', 'Shift', 'Z'] },
      { label: 'Select All', keys: ['Cmd', 'A'] },
      { label: 'Delete', keys: ['Backspace'] },
    ]
  },
  {
    title: 'Manipulation',
    items: [
      { label: 'Duplicate', keys: ['Cmd', 'D'] },
      { label: 'Duplicate (Drag)', keys: ['Alt', 'Drag'] },
      { label: 'Copy', keys: ['Cmd', 'C'] },
      { label: 'Paste', keys: ['Cmd', 'V'] },
      { label: 'Group Selection', keys: ['Cmd', 'G'] },
    ]
  },
  {
    title: 'Navigation',
    items: [
      { label: 'Pan Canvas', keys: ['Space', 'Drag'] },
      { label: 'Zoom In/Out', keys: ['Cmd', '+/-'] },
      { label: 'Fit View', keys: ['Shift', '1'] },
      { label: 'Nudge Node', keys: ['Arrows'] },
    ]
  },
];
