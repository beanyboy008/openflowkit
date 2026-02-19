import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Loader2, ArrowUp, X, Trash2, ChevronDown, Settings } from 'lucide-react';
import { useFlowStore } from '../store';
import { ChatMessage } from '../services/aiService';

type AIChatPanelProps = {
  onSubmit: (prompt: string) => void;
  isGenerating: boolean;
  chatMessages: ChatMessage[];
  onClearChat: () => void;
};

export const AIChatPanel: React.FC<AIChatPanelProps> = ({
  onSubmit,
  isGenerating,
  chatMessages,
  onClearChat,
}) => {
  const [value, setValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { brandConfig } = useFlowStore();

  const hasApiKey = !!(brandConfig.apiKey || import.meta.env.VITE_ANTHROPIC_API_KEY);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Auto-expand when messages arrive
  useEffect(() => {
    if (chatMessages.length > 0) {
      setIsExpanded(true);
    }
  }, [chatMessages.length]);

  // Click-outside to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as globalThis.Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!value.trim() || isGenerating || !hasApiKey) return;
    onSubmit(value.trim());
    setValue('');
    setIsExpanded(true);
  }, [value, isGenerating, hasApiKey, onSubmit]);

  // Stop propagation on key events to prevent canvas shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Escape') {
      setIsExpanded(false);
      (document.activeElement as HTMLElement)?.blur();
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  // Focus textarea when expanding
  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isExpanded]);

  const hasHistory = chatMessages.length > 0;

  // --- Collapsed: pill-shaped input bar ---
  if (!isExpanded) {
    return (
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4" ref={panelRef}>
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
                onFocus={() => setIsExpanded(true)}
                onKeyDown={handleKeyDown}
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

            {hasHistory && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
                className="mr-2 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                title="Show chat history"
              >
                <ChevronDown className="w-4 h-4 rotate-180" />
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  // --- Expanded: chat panel ---
  return (
    <div
      ref={panelRef}
      className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4"
    >
      <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-slate-200/80 ring-1 ring-black/5 overflow-hidden flex flex-col" style={{ maxHeight: '420px' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--brand-primary)]" />
            <span className="text-sm font-semibold text-slate-700">Flowpilot</span>
            {isGenerating && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Thinking...
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {hasHistory && (
              <button
                onClick={onClearChat}
                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-md"
                title="Clear chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded-md"
              title="Collapse"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
          {!hasHistory ? (
            <div className="flex flex-col items-center justify-center py-8 text-center opacity-50">
              <Sparkles className="w-8 h-8 text-[var(--brand-primary)] mb-2" />
              <p className="text-sm font-medium text-slate-600">How can I help you build?</p>
              <p className="text-xs text-slate-400 mt-1">Describe a flow, process, or system.</p>
            </div>
          ) : (
            chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`
                    max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap
                    ${msg.role === 'user'
                      ? 'bg-[var(--brand-primary)] text-white rounded-br-none shadow-sm'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                    }
                  `}
                >
                  {msg.parts.map((p, i) => (
                    <div key={i}>{p.text}</div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-slate-100 p-3 flex-shrink-0">
          {!hasApiKey ? (
            <a
              href="#/settings"
              className="flex items-center justify-center gap-1.5 py-2 text-sm text-slate-400 hover:text-[var(--brand-primary)] transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              Set API key in Settings to use AI
            </a>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe what you want..."
                disabled={isGenerating}
                rows={1}
                className="flex-1 resize-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)]/40 placeholder:text-slate-400 text-slate-900 disabled:opacity-50 max-h-24"
              />
              <button
                type="submit"
                disabled={!value.trim() || isGenerating}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[var(--brand-primary)] text-white hover:brightness-110 active:scale-95 shadow-md"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4" />
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
