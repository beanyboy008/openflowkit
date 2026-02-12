import React, { useState, useEffect, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { Code2, FileCode, AlertCircle, BookOpen, Loader2, Play } from 'lucide-react';
import { ViewHeader } from './ViewHeader';
import { toMermaid } from '../../services/exportService';
import { toFlowMindDSL } from '../../services/flowmindDSLExporter';
import { parseMermaid } from '../../services/mermaidParser';
import { parseFlowMindDSL } from '../../services/flowmindDSLParser';
import { getElkLayout } from '../../services/elkLayout';
import { assignSmartHandles } from '../../services/smartEdgeRouting';

interface CodeViewProps {
    mode: 'mermaid' | 'flowmind';
    nodes: Node[];
    edges: Edge[];
    onApply: (nodes: Node[], edges: Edge[]) => void;
    onClose: () => void;
    handleBack: () => void;
}

export const CodeView = ({
    mode,
    nodes,
    edges,
    onApply,
    onClose,
    handleBack
}: CodeViewProps) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isApplying, setIsApplying] = useState(false);

    // Sync from canvas on mount ONLY.
    useEffect(() => {
        if (mode === 'mermaid') setCode(toMermaid(nodes, edges));
        else setCode(toFlowMindDSL(nodes, edges));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    const handleChange = (val: string) => {
        setCode(val);
        if (error) setError(null);
    };

    const handleApply = async () => {
        const res = mode === 'mermaid' ? parseMermaid(code) : parseFlowMindDSL(code);
        if (res.error) {
            setError(res.error);
            return;
        }

        // For Mermaid: run ELK layout + smart edge routing for proper flow
        if (mode === 'mermaid' && res.nodes.length > 0) {
            setIsApplying(true);
            try {
                const direction = (res as any).direction || 'TB';
                const layoutedNodes = await getElkLayout(res.nodes, res.edges, {
                    direction,
                    algorithm: 'layered',
                    spacing: 'normal',
                });
                const smartEdges = assignSmartHandles(layoutedNodes, res.edges);
                onApply(layoutedNodes, smartEdges);
            } catch (err) {
                console.error('Layout failed, applying raw positions:', err);
                onApply(res.nodes, res.edges);
            } finally {
                setIsApplying(false);
            }
        } else {
            onApply(res.nodes, res.edges);
        }
        onClose();
    };

    // prevent propagation for critical keys
    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Allow navigation and deletion within the textarea without bubbling
        if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
            e.stopPropagation();
        }
        // Allow copy/paste/select-all
        if ((e.metaKey || e.ctrlKey) && ['a', 'c', 'v', 'x', 'z', 'y'].includes(e.key.toLowerCase())) {
            e.stopPropagation();
        }

        // Apply
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            handleApply();
        }
    };

    return (
        <div className="flex flex-col h-full">
            <ViewHeader
                title={mode === 'mermaid' ? 'Mermaid Editor' : 'FlowMind DSL'}
                icon={mode === 'mermaid' ? <Code2 className="w-4 h-4 text-pink-500" /> : <FileCode className="w-4 h-4 text-emerald-500" />}
                onBack={handleBack}
            />
            <div className="p-4 flex-1 relative flex flex-col">
                <textarea
                    value={code}
                    onChange={e => handleChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`w-full flex-1 p-3 rounded-xl border text-sm font-mono leading-relaxed outline-none resize-none transition-all mb-4
                             ${error ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200 bg-slate-50/50 focus:border-indigo-500'}
                        `}
                    spellCheck={false}
                    autoFocus
                />
                {error && (
                    <div className="absolute bottom-20 left-4 right-4 flex items-center gap-2 px-3 py-2 bg-white/95 border border-amber-200 rounded-lg text-amber-700 text-xs shadow-sm">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-medium truncate">{error}</span>
                    </div>
                )}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-400">⌘+Enter to apply</span>
                        {mode === 'flowmind' && (
                            <a
                                href="https://varun-shield.notion.site/FlowMind-DSL-Syntax-Guide-303ce7f68c06800f94f4d2cd21082236?source=copy_link"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                            >
                                <BookOpen className="w-3.5 h-3.5" />
                                Syntax Guide
                            </a>
                        )}
                    </div>
                    <button
                        onClick={handleApply}
                        disabled={isApplying}
                        className={`flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm shadow-sm transition-all ${isApplying ? 'opacity-60 cursor-wait' : ''}`}
                    >
                        {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        {isApplying ? 'Applying...' : 'Apply Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};
