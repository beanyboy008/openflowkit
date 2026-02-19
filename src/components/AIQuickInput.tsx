import React, { useState, useRef } from 'react';
import { Sparkles, Loader2, ArrowUp, Settings } from 'lucide-react';
import { useFlowStore } from '../store';

type AIQuickInputProps = {
  onSubmit: (prompt: string) => void;
  isGenerating: boolean;
  disabled?: boolean;
};

export const AIQuickInput: React.FC<AIQuickInputProps> = ({ onSubmit, isGenerating, disabled }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { brandConfig } = useFlowStore();

  const hasApiKey = !!brandConfig.apiKey;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isGenerating || !hasApiKey) return;
    onSubmit(value.trim());
    setValue('');
  };

  if (disabled) return null;

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-white/95 backdrop-blur-xl shadow-2xl rounded-full border border-slate-200/80 ring-1 ring-black/5 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-[var(--brand-primary)]/30 focus-within:border-[var(--brand-primary)]/40">
          <div className="pl-4 pr-2 flex items-center">
            {isGenerating ? (
              <Loader2 className="w-4 h-4 text-[var(--brand-primary)] animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-slate-400" />
            )}
          </div>

          {hasApiKey ? (
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Describe what you want to add or change..."
              disabled={isGenerating}
              className="flex-1 py-3 pr-2 text-sm bg-transparent outline-none placeholder:text-slate-400 text-slate-900 disabled:opacity-50"
            />
          ) : (
            <a
              href="#/settings"
              className="flex-1 py-3 pr-2 text-sm text-slate-400 hover:text-[var(--brand-primary)] transition-colors flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              Add API key in Settings to use AI
            </a>
          )}

          {hasApiKey && (
            <button
              type="submit"
              disabled={!value.trim() || isGenerating}
              className="mr-2 w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[var(--brand-primary)] text-white hover:brightness-110 active:scale-95"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
