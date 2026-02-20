import React from 'react';
import { Activity } from 'lucide-react';

interface BulkEdgePropertiesProps {
    selectedCount: number;
    onUpdate: (updates: { strokeWidth?: number; dashPattern?: string }) => void;
}

const dashArrayMap: Record<string, string> = {
    solid: '',
    dashed: '8 4',
    dotted: '2 4',
    dashdot: '8 4 2 4',
};

export const BulkEdgeProperties: React.FC<BulkEdgePropertiesProps> = ({
    selectedCount,
    onUpdate,
}) => {
    return (
        <div className="space-y-6">
            <div className="text-xs text-slate-500 font-medium">
                {selectedCount} edges selected
            </div>

            <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Line Style
                </label>

                {/* Stroke Width */}
                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Stroke Width</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="6"
                        step="1"
                        defaultValue={2}
                        onChange={(e) => onUpdate({ strokeWidth: parseInt(e.target.value) })}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[var(--brand-primary)]"
                    />
                </div>

                {/* Dash Pattern */}
                <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Line Pattern</span>
                    <div className="grid grid-cols-4 gap-1.5">
                        {(['solid', 'dashed', 'dotted', 'dashdot'] as const).map((pattern) => (
                            <button
                                key={pattern}
                                onClick={() => onUpdate({ dashPattern: pattern })}
                                className="py-1.5 flex items-center justify-center rounded-lg border bg-[var(--brand-surface)] border-slate-200 hover:border-slate-300 transition-all"
                            >
                                <svg width="32" height="4" viewBox="0 0 32 4">
                                    <line x1="0" y1="2" x2="32" y2="2" stroke="#94a3b8" strokeWidth="2" strokeDasharray={dashArrayMap[pattern]} />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
