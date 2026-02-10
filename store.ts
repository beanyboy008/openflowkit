import { create } from 'zustand';
import {
    applyNodeChanges,
    applyEdgeChanges,
    OnNodesChange,
    OnEdgesChange,
    NodeChange,
    EdgeChange,
    Connection,
    addEdge,
} from 'reactflow';
import { FlowNode, FlowEdge, FlowTab, FlowHistoryState } from './types';
import { INITIAL_NODES, INITIAL_EDGES, createDefaultEdge } from './constants';

interface ViewSettings {
    showGrid: boolean;
    snapToGrid: boolean;
    showMiniMap: boolean;
    isShortcutsHelpOpen: boolean;
}

interface FlowState {
    // Nodes & Edges (Active Tab)
    nodes: FlowNode[];
    edges: FlowEdge[];

    // Tab State
    tabs: FlowTab[];
    activeTabId: string;

    // View Settings
    viewSettings: ViewSettings;

    // Selection
    selectedNodeId: string | null;
    selectedEdgeId: string | null;

    // Actions
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    setNodes: (nodes: FlowNode[] | ((nodes: FlowNode[]) => FlowNode[])) => void;
    setEdges: (edges: FlowEdge[] | ((edges: FlowEdge[]) => FlowEdge[])) => void;
    onConnect: (connection: Connection) => void;

    // Tab Actions
    setActiveTabId: (id: string) => void;
    setTabs: (tabs: FlowTab[]) => void;
    addTab: () => void;
    closeTab: (id: string) => void;
    updateTab: (id: string, updates: Partial<FlowTab>) => void; // For renaming loops etc

    // View Actions
    toggleGrid: () => void;
    toggleSnap: () => void;
    toggleMiniMap: () => void;
    setShortcutsHelpOpen: (open: boolean) => void;
    setViewSettings: (settings: Partial<ViewSettings>) => void;

    // Selection Actions
    setSelectedNodeId: (id: string | null) => void;
    setSelectedEdgeId: (id: string | null) => void;
}

export const useFlowStore = create<FlowState>((set, get) => ({
    // Initial State
    nodes: INITIAL_NODES,
    edges: INITIAL_EDGES,

    tabs: [
        {
            id: 'tab-1',
            name: 'Untitled Flow',
            nodes: INITIAL_NODES,
            edges: INITIAL_EDGES,
            history: { past: [], future: [] },
        },
    ],
    activeTabId: 'tab-1',

    viewSettings: {
        showGrid: true,
        snapToGrid: true,
        showMiniMap: true,
        isShortcutsHelpOpen: false,
    },

    selectedNodeId: null,
    selectedEdgeId: null,

    // React Flow Actions
    onNodesChange: (changes: NodeChange[]) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },
    setNodes: (nodesInput: FlowNode[] | ((nodes: FlowNode[]) => FlowNode[])) => {
        set((state) => ({
            nodes: typeof nodesInput === 'function' ? nodesInput(state.nodes) : nodesInput
        }));
    },
    setEdges: (edgesInput: FlowEdge[] | ((edges: FlowEdge[]) => FlowEdge[])) => {
        set((state) => ({
            edges: typeof edgesInput === 'function' ? edgesInput(state.edges) : edgesInput
        }));
    },

    onConnect: (connection: Connection) => {
        set({
            edges: addEdge(
                createDefaultEdge(connection.source!, connection.target!),
                get().edges
            ),
        });
    },

    // Tab Actions
    setActiveTabId: (id) => {
        const { tabs, nodes, edges } = get();
        // Save current state to current tab before switching? 
        // Usually logic is handled in component, but store approach is better.
        // However, syncing nodes/edges back to `tabs` array continuously or on switch?
        // Let's implement switch logic:
        // 1. Update current tab in `tabs` array with current `nodes` and `edges`.
        // 2. Find new tab.
        // 3. Set `nodes` and `edges` to new tab's values.
        // 4. Set `activeTabId`.

        // NOTE: This assumes 'nodes' and 'edges' in store are always the "active" ones.
        const currentTabId = get().activeTabId;

        const updatedTabs = tabs.map(t =>
            t.id === currentTabId
                ? { ...t, nodes, edges } // Update current tab
                : t
        );

        const newTab = updatedTabs.find(t => t.id === id);
        if (!newTab) return; // Should not happen

        set({
            tabs: updatedTabs,
            activeTabId: id,
            nodes: newTab.nodes,
            edges: newTab.edges,
            // We might need to handle history here too if we move history to store
        });
    },

    setTabs: (tabs) => set({ tabs }),

    addTab: () => {
        const { tabs, nodes, edges, activeTabId } = get();

        // Save current
        const updatedTabs = tabs.map(t =>
            t.id === activeTabId ? { ...t, nodes, edges } : t
        );

        const newTabId = `tab-${Date.now()}`;
        const newTab: FlowTab = {
            id: newTabId,
            name: 'New Flow',
            nodes: [],
            edges: [],
            history: { past: [], future: [] },
        };

        set({
            tabs: [...updatedTabs, newTab],
            activeTabId: newTabId,
            nodes: newTab.nodes,
            edges: newTab.edges,
        });
    },

    closeTab: (id) => {
        const { tabs, activeTabId } = get();
        if (tabs.length === 1) return;

        let newActiveTabId = activeTabId;

        if (id === activeTabId) {
            const index = tabs.findIndex(t => t.id === id);
            const nextTab = tabs[index + 1] || tabs[index - 1];
            if (nextTab) {
                newActiveTabId = nextTab.id;
                // The setActiveTabId logic will handle loading this tab's data
                // But we are calling set() directly here, so we must manually load.
                set({
                    nodes: nextTab.nodes,
                    edges: nextTab.edges,
                    activeTabId: newActiveTabId
                });
            }
        }

        set((state) => ({
            tabs: state.tabs.filter(t => t.id !== id)
        }));
    },

    updateTab: (id, updates) => {
        set((state) => ({
            tabs: state.tabs.map(t => t.id === id ? { ...t, ...updates } : t)
        }));
    },

    // View Actions
    toggleGrid: () => set((state) => ({
        viewSettings: { ...state.viewSettings, showGrid: !state.viewSettings.showGrid }
    })),
    toggleSnap: () => set((state) => ({
        viewSettings: { ...state.viewSettings, snapToGrid: !state.viewSettings.snapToGrid }
    })),
    toggleMiniMap: () => set((state) => ({
        viewSettings: { ...state.viewSettings, showMiniMap: !state.viewSettings.showMiniMap }
    })),
    setShortcutsHelpOpen: (open) => set((state) => ({
        viewSettings: { ...state.viewSettings, isShortcutsHelpOpen: open }
    })),
    setViewSettings: (settings) => set((state) => ({
        viewSettings: { ...state.viewSettings, ...settings }
    })),

    // Selection Actions
    setSelectedNodeId: (id) => set({ selectedNodeId: id }),
    setSelectedEdgeId: (id) => set({ selectedEdgeId: id }),
}));
