import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useFlowStore } from '@/store';
import { useAuth } from './useAuth';
import { FlowTab } from '@/lib/types';
import { INITIAL_NODES, INITIAL_EDGES } from '@/constants';
import { assignSmartHandles } from '@/services/smartEdgeRouting';

const FLOW_SAVE_DEBOUNCE = 2000;
const SETTINGS_SAVE_DEBOUNCE = 2000;

export const useAutoSave = () => {
    const { user } = useAuth();
    const userId = user?.id;
    const isLoaded = useRef(false);
    const prevTabIdsRef = useRef<string[]>([]);

    const loadFromSupabase = useCallback(async () => {
        if (!userId || isLoaded.current) return;
        isLoaded.current = true;

        const store = useFlowStore.getState();

        try {
            // Load flows and settings in parallel
            const [flowsResult, settingsResult] = await Promise.all([
                supabase.from('flows').select('*').eq('user_id', userId).order('created_at'),
                supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle(),
            ]);

            // --- Handle flows ---
            if (flowsResult.data && flowsResult.data.length > 0) {
                const tabs: FlowTab[] = flowsResult.data.map((flow) => ({
                    id: flow.id,
                    name: flow.name,
                    nodes: flow.nodes || [],
                    edges: flow.edges || [],
                    history: { past: [], future: [] },
                }));

                const firstTabId = tabs[0].id;
                store.setTabs(tabs);
                store.setActiveTabId(firstTabId);
                store.setNodes(tabs[0].nodes);
                // Apply smart routing on load to optimize handle sides
                const smartEdges = assignSmartHandles(tabs[0].nodes, tabs[0].edges);
                store.setEdges(smartEdges);
                prevTabIdsRef.current = tabs.map((t) => t.id);
            } else {
                // No flows in Supabase — check localStorage for migration
                const migrated = await migrateFromLocalStorage(userId);
                if (!migrated) {
                    // Brand new user — create default flow in Supabase
                    const defaultId = crypto.randomUUID();
                    const { error } = await supabase.from('flows').insert({
                        id: defaultId,
                        user_id: userId,
                        name: 'My First Flow',
                        nodes: INITIAL_NODES,
                        edges: INITIAL_EDGES,
                    });
                    if (!error) {
                        const defaultTab: FlowTab = {
                            id: defaultId,
                            name: 'My First Flow',
                            nodes: INITIAL_NODES,
                            edges: INITIAL_EDGES,
                            history: { past: [], future: [] },
                        };
                        store.setTabs([defaultTab]);
                        store.setActiveTabId(defaultId);
                        store.setNodes(INITIAL_NODES);
                        store.setEdges(INITIAL_EDGES);
                        prevTabIdsRef.current = [defaultId];
                    }
                }
            }

            // --- Handle settings ---
            if (settingsResult.data) {
                const s = settingsResult.data;
                if (s.design_systems && Array.isArray(s.design_systems) && s.design_systems.length > 0) {
                    // Batch all settings into one set call to avoid multiple re-renders
                    useFlowStore.setState({
                        designSystems: s.design_systems,
                        activeDesignSystemId: s.active_design_system_id || 'default',
                        viewSettings: { ...store.viewSettings, ...s.view_settings },
                        globalEdgeOptions: { ...store.globalEdgeOptions, ...s.global_edge_options },
                        brandConfig: { ...store.brandConfig, ...s.brand_config },
                        brandKits: s.brand_kits && s.brand_kits.length > 0 ? s.brand_kits : store.brandKits,
                        activeBrandKitId: s.active_brand_kit_id || store.activeBrandKitId,
                    });
                }
            }
        } catch (e) {
            console.error('Failed to load from Supabase', e);
        }

        store.setDataLoaded(true);
    }, [userId]);

    // Load on mount
    useEffect(() => {
        if (userId) {
            loadFromSupabase();
        }
    }, [userId, loadFromSupabase]);

    // --- Debounced flow save ---
    const nodes = useFlowStore((s) => s.nodes);
    const edges = useFlowStore((s) => s.edges);
    const tabs = useFlowStore((s) => s.tabs);
    const activeTabId = useFlowStore((s) => s.activeTabId);
    const dataLoaded = useFlowStore((s) => s.dataLoaded);

    useEffect(() => {
        if (!userId || !dataLoaded) return;

        const timeout = setTimeout(async () => {
            const state = useFlowStore.getState();
            const currentTabIds = state.tabs.map((t) => t.id);
            const prevIds = prevTabIdsRef.current;

            // Detect removed tabs → delete from Supabase
            const removedIds = prevIds.filter((id) => !currentTabIds.includes(id));
            if (removedIds.length > 0) {
                await supabase.from('flows').delete().in('id', removedIds);
            }

            // Detect added tabs → insert to Supabase
            const addedIds = currentTabIds.filter((id) => !prevIds.includes(id));
            for (const id of addedIds) {
                const tab = state.tabs.find((t) => t.id === id);
                if (tab) {
                    await supabase.from('flows').insert({
                        id: tab.id,
                        user_id: userId,
                        name: tab.name,
                        nodes: tab.nodes,
                        edges: tab.edges,
                    });
                }
            }

            // Upsert active tab (with current nodes/edges from canvas)
            const activeTab = state.tabs.find((t) => t.id === state.activeTabId);
            if (activeTab && !addedIds.includes(state.activeTabId)) {
                await supabase
                    .from('flows')
                    .update({
                        name: activeTab.name,
                        nodes: state.nodes,
                        edges: state.edges,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', state.activeTabId);
            }

            prevTabIdsRef.current = currentTabIds;
        }, FLOW_SAVE_DEBOUNCE);

        return () => clearTimeout(timeout);
    }, [userId, dataLoaded, nodes, edges, tabs, activeTabId]);

    // --- Debounced settings save ---
    const designSystems = useFlowStore((s) => s.designSystems);
    const activeDesignSystemId = useFlowStore((s) => s.activeDesignSystemId);
    const viewSettings = useFlowStore((s) => s.viewSettings);
    const globalEdgeOptions = useFlowStore((s) => s.globalEdgeOptions);
    const brandConfig = useFlowStore((s) => s.brandConfig);
    const brandKits = useFlowStore((s) => s.brandKits);
    const activeBrandKitId = useFlowStore((s) => s.activeBrandKitId);

    useEffect(() => {
        if (!userId || !dataLoaded) return;

        const timeout = setTimeout(async () => {
            await supabase.from('user_settings').upsert({
                user_id: userId,
                design_systems: designSystems,
                active_design_system_id: activeDesignSystemId,
                view_settings: viewSettings,
                global_edge_options: globalEdgeOptions,
                brand_config: brandConfig,
                brand_kits: brandKits,
                active_brand_kit_id: activeBrandKitId,
                updated_at: new Date().toISOString(),
            });
        }, SETTINGS_SAVE_DEBOUNCE);

        return () => clearTimeout(timeout);
    }, [userId, dataLoaded, designSystems, activeDesignSystemId, viewSettings, globalEdgeOptions, brandConfig, brandKits, activeBrandKitId]);
};

// --- localStorage migration (one-time) ---
async function migrateFromLocalStorage(userId: string): Promise<boolean> {
    const zustandData = localStorage.getItem('openflowkit-storage');
    const autoSaveData = localStorage.getItem('flowmind_app_state');

    if (!zustandData && !autoSaveData) return false;

    try {
        // Prefer autoSaveData (has latest nodes/edges), fall back to zustandData
        let tabs: FlowTab[] = [];
        let settings: Record<string, unknown> | null = null;

        if (autoSaveData) {
            const parsed = JSON.parse(autoSaveData);
            if (parsed.tabs) tabs = parsed.tabs;
        }

        if (zustandData) {
            const parsed = JSON.parse(zustandData);
            const zustandState = parsed.state || parsed;

            // If no tabs from autoSave, try zustand
            if (tabs.length === 0 && zustandState.tabs) {
                tabs = zustandState.tabs;
            }

            // Extract settings from zustand persist
            settings = {
                design_systems: zustandState.designSystems,
                active_design_system_id: zustandState.activeDesignSystemId,
                view_settings: zustandState.viewSettings,
                global_edge_options: zustandState.globalEdgeOptions,
                brand_config: zustandState.brandConfig,
                brand_kits: zustandState.brandKits,
                active_brand_kit_id: zustandState.activeBrandKitId,
            };
        }

        if (tabs.length === 0) return false;

        // Upload flows to Supabase (generate UUIDs for old tab IDs)
        const newTabs: FlowTab[] = [];
        for (const tab of tabs) {
            const newId = crypto.randomUUID();
            const { error } = await supabase.from('flows').insert({
                id: newId,
                user_id: userId,
                name: tab.name || 'Untitled Flow',
                nodes: tab.nodes || [],
                edges: tab.edges || [],
            });
            if (!error) {
                newTabs.push({
                    ...tab,
                    id: newId,
                    history: { past: [], future: [] },
                });
            }
        }

        if (newTabs.length === 0) return false;

        // Upload settings
        if (settings) {
            await supabase.from('user_settings').upsert({
                user_id: userId,
                ...settings,
                updated_at: new Date().toISOString(),
            });
        }

        // Populate store with migrated data
        const store = useFlowStore.getState();
        store.setTabs(newTabs);
        store.setActiveTabId(newTabs[0].id);
        store.setNodes(newTabs[0].nodes);
        store.setEdges(newTabs[0].edges);

        if (settings) {
            useFlowStore.setState({
                designSystems: (settings.design_systems as any) || store.designSystems,
                activeDesignSystemId: (settings.active_design_system_id as string) || store.activeDesignSystemId,
                viewSettings: { ...store.viewSettings, ...(settings.view_settings as any) },
                globalEdgeOptions: { ...store.globalEdgeOptions, ...(settings.global_edge_options as any) },
                brandConfig: { ...store.brandConfig, ...(settings.brand_config as any) },
                brandKits: (settings.brand_kits as any) || store.brandKits,
                activeBrandKitId: (settings.active_brand_kit_id as string) || store.activeBrandKitId,
            });
        }

        // Clear localStorage after successful migration
        localStorage.removeItem('openflowkit-storage');
        localStorage.removeItem('flowmind_app_state');

        console.log(`Migrated ${newTabs.length} flows from localStorage to Supabase`);
        return true;
    } catch (e) {
        console.error('localStorage migration failed', e);
        return false;
    }
}
