import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { docsNavigation } from './docsData';
import { Book, ChevronLeft } from 'lucide-react';

interface DocsSidebarProps {
    className?: string;
    onClose?: () => void;
}

import { useFlowStore } from '../../store';

export const DocsSidebar: React.FC<DocsSidebarProps> = ({ className = '', onClose }) => {
    const { brandConfig } = useFlowStore();

    return (
        <aside className={`w-64 border-r border-slate-200 bg-[var(--brand-surface)] flex flex-col h-full fixed inset-y-0 left-0 z-20 transition-transform duration-300 lg:translate-x-0 ${className}`}>
            <div className="h-14 flex items-center justify-between px-4 border-b border-slate-100">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <Book className="w-4 h-4 text-[var(--brand-primary)]" />
                    <span>Documentation</span>
                </div>
                <Link to="/" className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors" title="Back to App">
                    <ChevronLeft className="w-4 h-4" />
                </Link>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {docsNavigation.map((section) => (
                    <div key={section.title}>
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
                            {section.title}
                        </h3>
                        <div className="space-y-0.5">
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.slug}
                                    to={`/docs/${item.slug}`}
                                    onClick={onClose}
                                    className={({ isActive }) => `
                                        block px-2 py-1.5 rounded-md text-sm transition-colors
                                        ${isActive
                                            ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-medium'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                                    `}
                                >
                                    {item.title}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    {brandConfig.appName} Docs v1.0
                </div>
            </div>
        </aside>
    );
};
