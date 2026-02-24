import React, { useState, useEffect, useRef, useCallback } from 'react';
import { OpenFlowLogo } from './icons/OpenFlowLogo';
import {
    Settings, Layout, Command, Search,
    Home, Clock, Loader2, Plus, Import, Image, FileCode, FileJson, GitBranch, Book, ExternalLink, Trash2,
    Sparkles, ArrowUp, Workflow, MoreHorizontal, Copy, Archive, ArchiveRestore, ChevronDown
} from 'lucide-react';
import { useFlowStore } from '../store';
import { useSnapshots } from '../hooks/useSnapshots';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from './ui/Button';
import { BrandSettings } from './SettingsModal/BrandSettings';
import { GeneralSettings } from './SettingsModal/GeneralSettings';
import { ShortcutsSettings } from './SettingsModal/ShortcutsSettings';
import { PrivacySettings } from './SettingsModal/PrivacySettings';
import { FlowSnapshot, FlowNode, FlowEdge } from '@/lib/types';
import { SidebarItem } from './ui/SidebarItem';
import { WelcomeModal } from './WelcomeModal';
import { trackEvent } from '../lib/analytics';


interface HomePageProps {
    onLaunch: () => void;
    onImportJSON: () => void;
    onRestoreSnapshot: (snapshot: FlowSnapshot) => void;
    onOpenFlow: (tabId: string) => void;
    onNewFlow: () => void;
    activeTab?: 'home' | 'settings';
    onSwitchTab?: (tab: 'home' | 'settings') => void;
}

type SupabaseFlow = {
    id: string;
    name: string;
    nodes: FlowNode[];
    edges: FlowEdge[];
    archived_at: string | null;
};

export const HomePage: React.FC<HomePageProps> = ({
    onLaunch,
    onImportJSON,
    onRestoreSnapshot,
    onOpenFlow,
    onNewFlow,
    activeTab: propActiveTab,
    onSwitchTab
}) => {
    const { brandConfig, tabs } = useFlowStore();
    const { user } = useAuth();
    const { snapshots, deleteSnapshot } = useSnapshots();
    const [internalActiveTab, setInternalActiveTab] = useState<'home' | 'settings'>('home');
    const [activeSettingsTab, setActiveSettingsTab] = useState<'brand' | 'general' | 'shortcuts' | 'privacy'>('brand');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [activeFlows, setActiveFlows] = useState<SupabaseFlow[]>([]);
    const [archivedFlows, setArchivedFlows] = useState<SupabaseFlow[]>([]);
    const [showArchived, setShowArchived] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const activeTab = propActiveTab || internalActiveTab;

    const fetchFlows = useCallback(async () => {
        if (!user) return;
        const [activeResult, archivedResult] = await Promise.all([
            supabase.from('flows').select('id, name, nodes, edges, archived_at').eq('user_id', user.id).is('archived_at', null).order('created_at'),
            supabase.from('flows').select('id, name, nodes, edges, archived_at').eq('user_id', user.id).not('archived_at', 'is', null).order('created_at'),
        ]);
        if (activeResult.data) setActiveFlows(activeResult.data);
        if (archivedResult.data) setArchivedFlows(archivedResult.data);
    }, [user]);

    useEffect(() => {
        fetchFlows();
    }, [fetchFlows, tabs]);

    // Close menu on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleTabChange = (tab: 'home' | 'settings') => {
        if (onSwitchTab) {
            onSwitchTab(tab);
        } else {
            setInternalActiveTab(tab);
        }
    };

    const handleRestore = (snapshot: FlowSnapshot) => {
        trackEvent('restore_snapshot_flow');
        onRestoreSnapshot(snapshot);
        onLaunch(); // Enter editor
    };

    const handleDuplicateFlow = async (flow: SupabaseFlow) => {
        if (!user) return;
        const newId = crypto.randomUUID();

        // Deep-copy nodes with new IDs, remap edges
        const idMap = new Map<string, string>();
        const newNodes = (flow.nodes || []).map(node => {
            const newNodeId = crypto.randomUUID();
            idMap.set(node.id, newNodeId);
            return { ...node, id: newNodeId };
        });
        const newEdges = (flow.edges || []).map(edge => ({
            ...edge,
            id: crypto.randomUUID(),
            source: idMap.get(edge.source) || edge.source,
            target: idMap.get(edge.target) || edge.target,
        }));

        const { error } = await supabase.from('flows').insert({
            id: newId,
            user_id: user.id,
            name: `${flow.name} (Copy)`,
            nodes: newNodes,
            edges: newEdges,
        });

        if (!error) {
            const tab = {
                id: newId,
                name: `${flow.name} (Copy)`,
                nodes: newNodes,
                edges: newEdges,
                history: { past: [], future: [] },
            };
            useFlowStore.getState().addTabFromData(tab);
            setOpenMenuId(null);
            onOpenFlow(newId);
        }
    };

    const handleArchiveFlow = async (flowId: string) => {
        await supabase.from('flows').update({ archived_at: new Date().toISOString() }).eq('id', flowId);
        // Remove from tabs if currently open
        const { tabs } = useFlowStore.getState();
        if (tabs.some(t => t.id === flowId) && tabs.length > 1) {
            useFlowStore.getState().closeTab(flowId);
        }
        setOpenMenuId(null);
        fetchFlows();
    };

    const handleRestoreFlow = async (flowId: string) => {
        await supabase.from('flows').update({ archived_at: null }).eq('id', flowId);
        setOpenMenuId(null);
        fetchFlows();
    };

    return (
        <div className="min-h-screen bg-[var(--brand-background)] flex text-[var(--brand-text)]">
            {/* Sidebar */}
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-200 flex flex-col fixed inset-y-0 left-0 z-20 bg-[var(--brand-surface)]">
                <div className="h-14 flex items-center gap-3 px-4 border-b border-slate-100">
                    {(brandConfig.logoStyle === 'icon' || brandConfig.logoStyle === 'both' || !brandConfig.logoStyle) && (
                        <div className="w-8 h-8 flex items-center justify-center bg-[var(--brand-primary)]/10 rounded-lg text-[var(--brand-primary)] overflow-hidden shrink-0">
                            {brandConfig.logoUrl ? (
                                <img src={brandConfig.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                            ) : (
                                <OpenFlowLogo className="w-5 h-5" />
                            )}
                        </div>
                    )}

                    {brandConfig.logoStyle === 'wide' && (
                        <div className="h-8 flex-1 flex items-center justify-start overflow-hidden">
                            {brandConfig.logoUrl ? (
                                <img src={brandConfig.logoUrl} alt="Logo" className="h-[70%] w-auto object-contain max-w-[180px]" />
                            ) : (
                                <span className="text-sm font-semibold text-[var(--brand-primary)] truncate">Wide Logo</span>
                            )}
                        </div>
                    )}

                    {(brandConfig.logoStyle === 'text' || brandConfig.logoStyle === 'both' || !brandConfig.logoStyle) && (
                        <span className="font-semibold text-base tracking-tight text-slate-900 truncate">{brandConfig.appName}</span>
                    )}

                    {/* BETA Chip */}
                    {(brandConfig.ui.showBeta ?? true) && (
                        <div className="flex items-center justify-center px-1.5 py-0.5 rounded-full bg-[var(--brand-primary-50)] border border-[var(--brand-primary-200)]">
                            <span className="text-[10px] font-extrabold text-[var(--brand-primary)] tracking-widest leading-none">BETA</span>
                        </div>
                    )}
                </div>

                <div className="p-3 space-y-1">
                    <SidebarItem
                        icon={<Home className="w-4 h-4" />}
                        isActive={activeTab === 'home'}
                        onClick={() => handleTabChange('home')}
                    >
                        Home
                    </SidebarItem>
                    <SidebarItem
                        icon={<Settings className="w-4 h-4" />}
                        isActive={activeTab === 'settings'}
                        onClick={() => handleTabChange('settings')}
                    >
                        Settings
                    </SidebarItem>

                    <SidebarItem
                        icon={<Book className="w-4 h-4" />}
                        to="#/docs"
                    >
                        Documentation
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                    </SidebarItem>
                </div>

                <div className="mt-auto p-4 border-t border-slate-100">
                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        v1.0 BETA • {brandConfig.appName}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1 flex flex-col min-w-0 bg-[var(--brand-surface)]">

                {activeTab === 'home' && (
                    <div className="flex-1 overflow-y-auto px-10 py-12 animate-in fade-in duration-300">
                        {/* Header & Actions */}
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">Your Flows</h1>
                                <p className="text-[var(--brand-secondary)] text-sm">Open an existing flow or create a new one.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={() => { trackEvent('import_json_flow'); onImportJSON(); }}
                                    variant="secondary"
                                    size="md"
                                >
                                    Import
                                </Button>
                                <Button
                                    onClick={() => { trackEvent('create_new_flow'); onNewFlow(); }}
                                    variant="primary"
                                    size="md"
                                    icon={<Plus className="w-4 h-4" />}
                                >
                                    New Flow
                                </Button>
                            </div>
                        </div>

                        {/* Active Flows */}
                        <section className="mb-12">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Flows</h2>
                                <span className="text-xs text-slate-400">{activeFlows.length} {activeFlows.length === 1 ? 'flow' : 'flows'}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                {/* New Flow Card */}
                                <div
                                    onClick={() => { trackEvent('create_new_flow'); onNewFlow(); }}
                                    className="group bg-[var(--brand-surface)] rounded-lg border-2 border-dashed border-slate-200 overflow-hidden cursor-pointer hover:border-[var(--brand-primary)]/40 hover:shadow-sm transition-all relative flex flex-col items-center justify-center min-h-[200px]"
                                >
                                    <div className="w-12 h-12 rounded-full bg-[var(--brand-primary)]/5 flex items-center justify-center mb-3 group-hover:bg-[var(--brand-primary)]/10 transition-colors">
                                        <Plus className="w-6 h-6 text-[var(--brand-primary)]" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-[var(--brand-primary)] transition-colors">New Flow</span>
                                </div>

                                {/* Existing Flow Cards */}
                                {activeFlows.map(flow => (
                                    <div
                                        key={flow.id}
                                        onClick={() => onOpenFlow(flow.id)}
                                        className="group bg-[var(--brand-surface)] rounded-lg border border-slate-200 overflow-hidden cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all relative"
                                    >
                                        <div className="h-32 bg-slate-50 flex items-center justify-center border-b border-slate-100 relative overflow-hidden">
                                            <div className="w-10 h-10 rounded-lg bg-[var(--brand-surface)] shadow-sm border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-[var(--brand-primary)] group-hover:border-[var(--brand-primary-200)] transition-colors z-10">
                                                <Workflow className="w-5 h-5" />
                                            </div>

                                            {/* Action menu button */}
                                            <div className="absolute top-2 right-2 z-20" ref={openMenuId === flow.id ? menuRef : undefined}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === flow.id ? null : flow.id); }}
                                                    className="p-1.5 bg-[var(--brand-surface)] text-slate-400 hover:text-slate-600 border border-slate-200 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <MoreHorizontal className="w-3.5 h-3.5" />
                                                </button>

                                                {openMenuId === flow.id && (
                                                    <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg border border-slate-200 shadow-lg py-1 z-30">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDuplicateFlow(flow); }}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                            Duplicate
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleArchiveFlow(flow.id); }}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                                        >
                                                            <Archive className="w-3.5 h-3.5" />
                                                            Archive
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-medium text-slate-900 text-sm truncate mb-1 group-hover:text-[var(--brand-primary)] transition-colors">{flow.name}</h3>
                                            <div className="flex items-center justify-between text-[11px] text-[var(--brand-secondary)]">
                                                <span>{(flow.nodes || []).length} {(flow.nodes || []).length === 1 ? 'node' : 'nodes'}</span>
                                                <span>{(flow.edges || []).length} {(flow.edges || []).length === 1 ? 'edge' : 'edges'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Archived Flows */}
                        {archivedFlows.length > 0 && (
                            <section className="mb-12">
                                <button
                                    onClick={() => setShowArchived(!showArchived)}
                                    className="flex items-center gap-2 mb-6 group"
                                >
                                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showArchived ? '' : '-rotate-90'}`} />
                                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-slate-500 transition-colors">Archived</h2>
                                    <span className="text-xs text-slate-400">{archivedFlows.length}</span>
                                </button>

                                {showArchived && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {archivedFlows.map(flow => (
                                            <div
                                                key={flow.id}
                                                className="group bg-[var(--brand-surface)] rounded-lg border border-slate-200 overflow-hidden relative opacity-60 hover:opacity-100 transition-all"
                                            >
                                                <div className="h-32 bg-slate-50 flex items-center justify-center border-b border-slate-100 relative overflow-hidden">
                                                    <div className="w-10 h-10 rounded-lg bg-[var(--brand-surface)] shadow-sm border border-slate-100 flex items-center justify-center text-slate-300 z-10">
                                                        <Archive className="w-5 h-5" />
                                                    </div>

                                                    <div className="absolute top-2 right-2 z-20" ref={openMenuId === flow.id ? menuRef : undefined}>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === flow.id ? null : flow.id); }}
                                                            className="p-1.5 bg-[var(--brand-surface)] text-slate-400 hover:text-slate-600 border border-slate-200 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            <MoreHorizontal className="w-3.5 h-3.5" />
                                                        </button>

                                                        {openMenuId === flow.id && (
                                                            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg border border-slate-200 shadow-lg py-1 z-30">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleRestoreFlow(flow.id); }}
                                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                                                >
                                                                    <ArchiveRestore className="w-3.5 h-3.5" />
                                                                    Restore
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="p-3">
                                                    <h3 className="font-medium text-slate-500 text-sm truncate mb-1">{flow.name}</h3>
                                                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                                                        <span>{(flow.nodes || []).length} nodes</span>
                                                        <span>{(flow.edges || []).length} edges</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Snapshots */}
                        {snapshots.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saved Snapshots</h2>
                                    <span className="text-xs text-slate-400">{snapshots.length} snapshots</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {snapshots.map(snapshot => (
                                        <div
                                            key={snapshot.id}
                                            onClick={() => handleRestore(snapshot)}
                                            className="group bg-[var(--brand-surface)] rounded-lg border border-slate-200 overflow-hidden cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all relative"
                                        >
                                            <div className="h-32 bg-slate-50 flex items-center justify-center border-b border-slate-100 relative overflow-hidden">
                                                <div className="w-8 h-8 rounded bg-[var(--brand-surface)] shadow-sm border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-[var(--brand-primary)] group-hover:border-[var(--brand-primary-200)] transition-colors z-10">
                                                    <Clock className="w-4 h-4" />
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => { e?.stopPropagation(); deleteSnapshot(snapshot.id); }}
                                                    className="absolute top-2 right-2 p-1.5 bg-[var(--brand-surface)] text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 opacity-0 group-hover:opacity-100 transition-all z-20"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                            <div className="p-3">
                                                <h3 className="font-medium text-slate-900 text-sm truncate mb-1 group-hover:text-[var(--brand-primary)] transition-colors">{snapshot.name}</h3>
                                                <div className="flex items-center justify-between text-[11px] text-[var(--brand-secondary)]">
                                                    <span>{new Date(snapshot.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                    <span>{snapshot.nodes.length} nodes</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="flex-1 flex flex-col h-screen overflow-hidden animate-in fade-in duration-300">
                        <header className="px-8 py-6 border-b border-slate-100 bg-[var(--brand-surface)]">
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Settings</h1>
                        </header>

                        <div className="flex-1 flex min-h-0 bg-[var(--brand-surface)]">
                            {/* Settings Sidebar */}
                            <div className="w-48 border-r border-slate-100 p-2 space-y-1 overflow-y-auto">
                                <SidebarItem
                                    isActive={activeSettingsTab === 'brand'}
                                    onClick={() => setActiveSettingsTab('brand')}
                                >
                                    Brand Kit
                                </SidebarItem>
                                <SidebarItem
                                    isActive={activeSettingsTab === 'general'}
                                    onClick={() => setActiveSettingsTab('general')}
                                >
                                    General
                                </SidebarItem>
                                <SidebarItem
                                    isActive={activeSettingsTab === 'shortcuts'}
                                    onClick={() => setActiveSettingsTab('shortcuts')}
                                >
                                    Shortcuts
                                </SidebarItem>
                                <SidebarItem
                                    isActive={activeSettingsTab === 'privacy'}
                                    onClick={() => setActiveSettingsTab('privacy')}
                                >
                                    Privacy
                                </SidebarItem>
                            </div>

                            {/* Settings Content */}
                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="max-w-2xl">
                                    {activeSettingsTab === 'brand' && <BrandSettings />}
                                    {activeSettingsTab === 'general' && <GeneralSettings />}
                                    {activeSettingsTab === 'shortcuts' && <ShortcutsSettings />}
                                    {activeSettingsTab === 'privacy' && <PrivacySettings />}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <WelcomeModal />
        </div>
    );
};
