import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { ViewHeader } from './ViewHeader';

interface AIViewProps {
    searchQuery: string;
    onAIGenerate: (prompt: string) => Promise<void>;
    onClose: () => void;
    handleBack: () => void;
    isGenerating: boolean;
}

export const AIView = ({
    searchQuery,
    onAIGenerate,
    onClose,
    handleBack,
    isGenerating
}: AIViewProps) => {
    const [prompt, setPrompt] = useState(searchQuery || '');

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        await onAIGenerate(prompt);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Essential: Stop propagation to allow typing without firing global hotkeys
        e.stopPropagation();

        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleGenerate();
        }
    };

    return (
        <div className="flex flex-col h-full">
            <ViewHeader title="Ask AI" icon={<Sparkles className="w-4 h-4 text-indigo-500" />} onBack={handleBack} />
            <div className="p-4 flex-1">
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe the flow you want to build..."
                    className="w-full flex-1 p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                    autoFocus
                />
                <div className="flex justify-end mt-4">
                    <Button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
                        variant="primary"
                        className={`flex items-center gap-2 px-4 py-2 h-auto text-sm transition-all
                            ${!prompt.trim() || isGenerating ? 'opacity-50 cursor-not-allowed' : 'shadow-lg shadow-indigo-500/20'}
                        `}
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Generate Flow
                    </Button>
                </div>
            </div>
        </div>
    );
};
