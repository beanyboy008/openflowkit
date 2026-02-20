import React, { useState } from 'react';
import { NodeData } from '@/lib/types';
import { Box, Palette, Star, CheckSquare } from 'lucide-react';
import { ShapeSelector } from './ShapeSelector';
import { ColorPicker } from './ColorPicker';
import { IconPicker } from './IconPicker';
import { CollapsibleSection } from '../ui/CollapsibleSection';

interface BulkNodePropertiesProps {
    selectedCount: number;
    onUpdate: (data: Partial<NodeData>) => void;
}

export const BulkNodeProperties: React.FC<BulkNodePropertiesProps> = ({
    selectedCount,
    onUpdate,
}) => {
    const [activeSection, setActiveSection] = useState<string>('appearance');

    const toggleSection = (section: string) => {
        setActiveSection((current) => (current === section ? '' : section));
    };

    return (
        <>
            <div className="text-xs text-slate-500 font-medium">
                {selectedCount} nodes selected
            </div>

            <hr className="border-slate-100" />

            <CollapsibleSection
                title="Appearance"
                icon={<Box className="w-3.5 h-3.5" />}
                isOpen={activeSection === 'appearance'}
                onToggle={() => toggleSection('appearance')}
            >
                <ShapeSelector
                    onChange={(shape) => onUpdate({ shape })}
                />
            </CollapsibleSection>

            <CollapsibleSection
                title="Color Theme"
                icon={<Palette className="w-3.5 h-3.5" />}
                isOpen={activeSection === 'color'}
                onToggle={() => toggleSection('color')}
            >
                <ColorPicker
                    onChange={(color) => onUpdate({ color })}
                />
            </CollapsibleSection>

            <CollapsibleSection
                title="Icon Theme"
                icon={<Star className="w-3.5 h-3.5" />}
                isOpen={activeSection === 'icon'}
                onToggle={() => toggleSection('icon')}
            >
                <IconPicker
                    onChange={(icon) => onUpdate({ icon })}
                    onCustomIconChange={(url) => onUpdate({ customIconUrl: url })}
                />
            </CollapsibleSection>

            {/* Checkbox Toggle */}
            <div className="px-1 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-600 font-medium">Checkbox</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onUpdate({ isCheckbox: true, checked: false })}
                        className="px-2.5 py-1 text-[10px] font-semibold rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                    >
                        Enable All
                    </button>
                    <button
                        onClick={() => onUpdate({ isCheckbox: false, checked: false })}
                        className="px-2.5 py-1 text-[10px] font-semibold rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                    >
                        Disable All
                    </button>
                </div>
            </div>
        </>
    );
};
