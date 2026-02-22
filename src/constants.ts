import { Edge, Node, MarkerType } from 'reactflow';
import { NodeType } from '@/lib/types';

// --- Edge Styles (inline for reliable SVG rendering) ---
export const EDGE_STYLE = { stroke: '#94a3b8', strokeWidth: 2 };
export const EDGE_LABEL_STYLE = { fill: '#334155', fontWeight: 500, fontSize: 12 };
export const EDGE_LABEL_BG_STYLE = { fill: '#ffffff', stroke: '#cbd5e1', strokeWidth: 1 };

/** Shared edge configuration — use `createDefaultEdge()` for most cases. */
export const DEFAULT_EDGE_OPTIONS = {
  type: 'straight' as const,
  markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
  animated: false,
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
    position: { x: 850, y: 0 },
    data: {
      label: 'Target KPIs',
      subLabel: '$50–$300 cost per booked call\n85% show-up rate\n50% close rate\n30-day nurture window',
    },
  },

  // ========== TRAFFIC: PERSONAL BRAND (left column) ==========
  {
    id: 'rn-brand',
    type: NodeType.PROCESS,
    position: { x: 0, y: 80 },
    data: {
      label: 'Personal Brand',
      subLabel: 'All platforms\nWinners → test as hooks for ads\nWinners → feed into Hammer Them',
      icon: 'Video',
      color: 'emerald',
    },
  },

  // ========== VIDEOS (under Personal Brand) ==========
  {
    id: 'rn-videos',
    type: NodeType.PROCESS,
    position: { x: 0, y: 320 },
    data: {
      label: 'Videos',
      subLabel: '30 videos/month\n70% short form / 30% long form\nSpend X to push videos out',
      icon: 'Play',
      color: 'emerald',
    },
  },

  // --- Video Breakdown ---
  {
    id: 'rn-shorts',
    type: NodeType.PROCESS,
    position: { x: -160, y: 560 },
    data: {
      label: '21 Shorts/Month',
      subLabel: 'Short form content\nReels, TikToks, Shorts',
      icon: 'Smartphone',
      color: 'emerald',
    },
  },
  {
    id: 'rn-longform',
    type: NodeType.PROCESS,
    position: { x: 160, y: 560 },
    data: {
      label: '9 Longform/Month',
      subLabel: 'YouTube, podcasts\nDeep-dive content',
      icon: 'MonitorPlay',
      color: 'emerald',
    },
  },

  // --- Social Platforms ---
  {
    id: 'rn-linkedin',
    type: NodeType.PROCESS,
    position: { x: -320, y: 800 },
    data: {
      label: 'LinkedIn',
      subLabel: 'Professional network\nB2B reach',
      icon: 'Linkedin',
      color: 'blue',
    },
  },
  {
    id: 'rn-tiktok',
    type: NodeType.PROCESS,
    position: { x: -160, y: 800 },
    data: {
      label: 'TikTok',
      subLabel: 'Short form discovery\nOrganic reach',
      icon: 'Music',
      color: 'pink',
    },
  },
  {
    id: 'rn-youtube',
    type: NodeType.PROCESS,
    position: { x: 0, y: 800 },
    data: {
      label: 'YouTube',
      subLabel: 'Long form + Shorts\nSearch & subscribe',
      icon: 'Youtube',
      color: 'red',
    },
  },
  {
    id: 'rn-facebook',
    type: NodeType.PROCESS,
    position: { x: 160, y: 800 },
    data: {
      label: 'Facebook',
      subLabel: 'Groups + Reels\nWarm up for ads',
      icon: 'Facebook',
      color: 'blue',
    },
  },
  {
    id: 'rn-instagram',
    type: NodeType.PROCESS,
    position: { x: 320, y: 800 },
    data: {
      label: 'Instagram',
      subLabel: 'Reels + Stories\nDM engagement',
      icon: 'Instagram',
      color: 'violet',
    },
  },

  // ========== TRAFFIC: PAID ADS (right column) ==========
  {
    id: 'rn-paid',
    type: NodeType.PROCESS,
    position: { x: 700, y: 80 },
    data: {
      label: 'Paid Ads',
      subLabel: 'Facebook (primary) + YouTube (secondary)\nUGC, image, brand character ads\nDisqualify in ad copy\nWarm up FB with non-selling videos',
      icon: 'Megaphone',
      color: 'blue',
    },
  },
  {
    id: 'rn-fbads',
    type: NodeType.PROCESS,
    position: { x: 700, y: 320 },
    data: {
      label: 'FB Ads',
      subLabel: 'Primary paid channel\nTest 12 creatives/month\nUGC + image + brand character',
      icon: 'Target',
      color: 'blue',
    },
  },
  {
    id: 'rn-test12',
    type: NodeType.PROCESS,
    position: { x: 700, y: 560 },
    data: {
      label: 'Test 12/Month',
      subLabel: 'Test 12 ad creatives per month\nKill losers, scale winners\nWinning hooks → organic',
      icon: 'FlaskConical',
      color: 'violet',
    },
  },

  // --- Qualify in ads annotation ---
  {
    id: 'rn-adqualify-note',
    type: NodeType.ANNOTATION,
    position: { x: 950, y: 320 },
    data: {
      label: 'Qualify in Ads',
      subLabel: 'Disqualify non-serious in ad copy\nSave $ on unqualified clicks',
    },
  },

  // ========== MANYCHAT (convergence point) ==========
  {
    id: 'rn-manychat',
    type: NodeType.PROCESS,
    position: { x: 0, y: 1040 },
    data: {
      label: 'ManyChat',
      subLabel: 'Captures engagement from content\nDMs, comments, keyword triggers',
      icon: 'MessageCircle',
      color: 'pink',
    },
  },

  // ========== QUALIFY IN DMs (decision) ==========
  {
    id: 'rn-qualify-dms',
    type: NodeType.DECISION,
    position: { x: 0, y: 1280 },
    data: {
      label: 'Qualify in DMs',
      subLabel: 'Ask qualifying questions\nFilter non-serious prospects\nBefore sending to opt-in',
      icon: 'MessageSquare',
      color: 'amber',
    },
  },

  // ========== FUNNEL (center column) ==========
  {
    id: 'rn-optin',
    type: NodeType.PROCESS,
    position: { x: 350, y: 1520 },
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
    position: { x: 350, y: 1760 },
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
    position: { x: 350, y: 2000 },
    data: {
      label: 'Qualification Pop-Up',
      subLabel: 'Fillout form\nHow many rental properties?\nLiquid capital: 25K–150K+\nQualified = 50K+',
      icon: 'ClipboardCheck',
      color: 'amber',
    },
  },

  // --- Pixel Fire (qualified path, offset right) ---
  {
    id: 'rn-pixel',
    type: NodeType.PROCESS,
    position: { x: 700, y: 2000 },
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
    position: { x: 350, y: 2240 },
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
    position: { x: 700, y: 2240 },
    data: {
      label: 'Future: Double Bookings',
      subLabel: 'Later: double-book or use another closer for non-qualified calls',
    },
  },

  // ========== NURTURE (left column) + POST-BOOK (center column) ==========
  {
    id: 'rn-nurture30',
    type: NodeType.PROCESS,
    position: { x: 0, y: 2480 },
    data: {
      label: '30-Day Email & SMS Nurture',
      subLabel: 'Drop-offs / no-shows\nDrives prospects back to book a call',
      icon: 'Mail',
      color: 'pink',
    },
  },
  {
    id: 'rn-postbookpage',
    type: NodeType.PROCESS,
    position: { x: 350, y: 2480 },
    data: {
      label: 'Post-Book Qualification Page',
      subLabel: 'Qualification VSL\nGets them warmed up for the call',
      icon: 'Shield',
      color: 'violet',
    },
  },

  {
    id: 'rn-hammer',
    type: NodeType.PROCESS,
    position: { x: 0, y: 2720 },
    data: {
      label: '"Hammer Them" Retargeting',
      subLabel: 'Jeremy Haynes strategy\nRetargeting ads between book → call\nIndoctrination videos\nIncludes personal brand winners',
      icon: 'Zap',
      color: 'red',
    },
  },
  {
    id: 'rn-call',
    type: NodeType.PROCESS,
    position: { x: 350, y: 2720 },
    data: {
      label: 'Sales Call',
      subLabel: '85% show-up rate target\nDouble book to achieve',
      icon: 'PhoneCall',
      color: 'emerald',
    },
  },

  {
    id: 'rn-postbookems',
    type: NodeType.PROCESS,
    position: { x: 0, y: 2960 },
    data: {
      label: 'Post-Booking Email & SMS',
      subLabel: 'Gets them to show up',
      icon: 'MessageSquare',
      color: 'pink',
    },
  },
  {
    id: 'rn-close',
    type: NodeType.END,
    position: { x: 350, y: 2960 },
    data: {
      label: 'Close',
      subLabel: '50% close rate target\nPayment plans set up\nFrame: pay nothing up front, earn from properties',
      icon: 'CheckCircle',
      color: 'emerald',
    },
  },

  // ========== FUTURE (bottom center) ==========
  {
    id: 'rn-future',
    type: NodeType.CUSTOM,
    position: { x: 350, y: 3200 },
    data: {
      label: 'Backend — FUTURE',
      subLabel: 'Ascension upsells\nCross-sells\nRevenue retention\nAfter front end works',
      icon: 'Rocket',
      color: 'slate',
    },
  },
];

export const INITIAL_EDGES: Edge[] = [
  // Personal Brand → Videos
  createDefaultEdge('rn-brand', 'rn-videos', undefined, 'e-brand-videos'),

  // Videos → Shorts + Longform
  createDefaultEdge('rn-videos', 'rn-shorts', '70%', 'e-videos-shorts'),
  createDefaultEdge('rn-videos', 'rn-longform', '30%', 'e-videos-longform'),

  // Shorts → Social Platforms
  createDefaultEdge('rn-shorts', 'rn-linkedin', undefined, 'e-shorts-linkedin'),
  createDefaultEdge('rn-shorts', 'rn-tiktok', undefined, 'e-shorts-tiktok'),
  createDefaultEdge('rn-shorts', 'rn-instagram', undefined, 'e-shorts-instagram'),

  // Longform → YouTube + Facebook
  createDefaultEdge('rn-longform', 'rn-youtube', undefined, 'e-longform-youtube'),
  createDefaultEdge('rn-longform', 'rn-facebook', undefined, 'e-longform-facebook'),

  // Social Platforms → ManyChat
  createDefaultEdge('rn-linkedin', 'rn-manychat', undefined, 'e-linkedin-manychat'),
  createDefaultEdge('rn-tiktok', 'rn-manychat', undefined, 'e-tiktok-manychat'),
  createDefaultEdge('rn-youtube', 'rn-manychat', undefined, 'e-youtube-manychat'),
  createDefaultEdge('rn-facebook', 'rn-manychat', undefined, 'e-facebook-manychat'),
  createDefaultEdge('rn-instagram', 'rn-manychat', undefined, 'e-instagram-manychat'),

  // ManyChat → Qualify in DMs
  createDefaultEdge('rn-manychat', 'rn-qualify-dms', undefined, 'e-manychat-qualifydms'),

  // Qualify in DMs → Yes (Opt-In) / No (drop)
  createDefaultEdge('rn-qualify-dms', 'rn-optin', 'Yes', 'e-qualifydms-optin'),

  // Paid Ads → FB Ads → Test 12 → Opt-In
  createDefaultEdge('rn-paid', 'rn-fbads', undefined, 'e-paid-fbads'),
  createDefaultEdge('rn-fbads', 'rn-test12', undefined, 'e-fbads-test12'),
  createDefaultEdge('rn-test12', 'rn-optin', undefined, 'e-test12-optin'),

  // Main Funnel
  createDefaultEdge('rn-optin', 'rn-vsl', undefined, 'e-optin-vsl'),
  createDefaultEdge('rn-vsl', 'rn-qualify', undefined, 'e-vsl-qualify'),

  // Qualification Fork
  createDefaultEdge('rn-qualify', 'rn-pixel', 'Qualified 50K+', 'e-qualify-pixel'),
  createDefaultEdge('rn-qualify', 'rn-book', undefined, 'e-qualify-book'),
  createDefaultEdge('rn-pixel', 'rn-book', undefined, 'e-pixel-book'),

  // Post-Book: center column (main path)
  createDefaultEdge('rn-book', 'rn-postbookpage', undefined, 'e-book-postbookpage'),
  createDefaultEdge('rn-postbookpage', 'rn-call', undefined, 'e-postbookpage-call'),
  createDefaultEdge('rn-call', 'rn-close', undefined, 'e-call-close'),

  // Nurture: left column (drop-offs go down, feed into call)
  createDefaultEdge('rn-book', 'rn-nurture30', 'Drop-offs', 'e-book-nurture30'),
  createDefaultEdge('rn-book', 'rn-hammer', 'Booked', 'e-book-hammer'),
  createDefaultEdge('rn-hammer', 'rn-postbookems', undefined, 'e-hammer-postbookems'),
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
      { label: 'Select Mode', keys: ['A'] },
      { label: 'Pan Mode', keys: ['H'] },
      { label: 'Pan Canvas', keys: ['Space', 'Drag'] },
      { label: 'Zoom In/Out', keys: ['Cmd', '+/-'] },
      { label: 'Fit View', keys: ['Shift', '1'] },
      { label: 'Nudge Node', keys: ['Arrows'] },
    ]
  },
];
