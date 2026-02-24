import React, { memo, useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import { NodeData } from '@/lib/types';
import { ExternalLink, Check, FileText } from 'lucide-react';

import { ICON_MAP } from './IconMap';
import MemoizedMarkdown from './MemoizedMarkdown';
import { NODE_COLOR_PALETTE, NODE_EXPORT_COLORS } from '../theme';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useFlowStore } from '../store';

const getDefaults = (type: string) => {
  switch (type) {
    case 'start': return { color: 'emerald', icon: null, shape: 'rounded' };
    case 'end': return { color: 'red', icon: null, shape: 'rounded' };
    case 'decision': return { color: 'amber', icon: null, shape: 'diamond' };
    case 'annotation': return { color: 'yellow', icon: null, shape: 'rounded' };
    case 'custom': return { color: 'violet', icon: null, shape: 'rounded' };
    default: return { color: 'slate', icon: null, shape: 'rounded' };
  }
}

const CustomNode = ({ id, data, type, selected }: NodeProps<NodeData>) => {
  const designSystem = useDesignSystem();
  const setNodes = useFlowStore((s) => s.setNodes);

  const [editingLabel, setEditingLabel] = useState(false);
  const [editingSubLabel, setEditingSubLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState(data.label || '');
  const [subLabelDraft, setSubLabelDraft] = useState(data.subLabel || '');
  const labelRef = useRef<HTMLTextAreaElement>(null);
  const subLabelRef = useRef<HTMLTextAreaElement>(null);
  const isAutoFocusing = useRef(false);

  // Sync drafts when data changes externally
  useEffect(() => { setLabelDraft(data.label || ''); }, [data.label]);
  useEffect(() => { setSubLabelDraft(data.subLabel || ''); }, [data.subLabel]);

  const commitLabel = useCallback(() => {
    if (isAutoFocusing.current) return;
    setEditingLabel(false);
    setNodes((nodes) => nodes.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, label: labelDraft } } : n
    ));
  }, [id, labelDraft, setNodes]);

  const commitSubLabel = useCallback(() => {
    setEditingSubLabel(false);
    setNodes((nodes) => nodes.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, subLabel: subLabelDraft } } : n
    ));
  }, [id, subLabelDraft, setNodes]);

  const stopPropagation = useCallback((e: React.KeyboardEvent | React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Stop propagation only when shift is NOT held, so shift-click multi-select works
  const stopMousePropagation = useCallback((e: React.MouseEvent) => {
    if (!e.shiftKey) e.stopPropagation();
  }, []);

  const toggleChecked = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, checked: !n.data.checked } } : n
    ));
  }, [id, setNodes]);

  const handleLinkClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (data.link) window.open(data.link, '_blank', 'noopener,noreferrer');
  }, [data.link]);

  const handleAttachmentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (data.attachmentUrl) window.open(data.attachmentUrl, '_blank', 'noopener,noreferrer');
  }, [data.attachmentUrl]);

  const handleLabelKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Escape') { setLabelDraft(data.label || ''); setEditingLabel(false); }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitLabel(); }
  }, [commitLabel, data.label]);

  const handleSubLabelKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Escape') { setSubLabelDraft(data.subLabel || ''); setEditingSubLabel(false); }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitSubLabel(); }
  }, [commitSubLabel, data.subLabel]);

  useEffect(() => {
    if (editingLabel) {
      // Retry focus until it sticks — React Flow steals focus, which triggers onBlur→commitLabel.
      // isAutoFocusing prevents commitLabel from removing the textarea during this window.
      const interval = setInterval(() => {
        if (labelRef.current) {
          labelRef.current.focus();
          if (document.activeElement === labelRef.current) {
            isAutoFocusing.current = false;
            clearInterval(interval);
          }
        }
      }, 30);
      const timeout = setTimeout(() => { isAutoFocusing.current = false; clearInterval(interval); }, 500);
      return () => { clearInterval(interval); clearTimeout(timeout); };
    }
  }, [editingLabel]);

  useEffect(() => {
    if (editingSubLabel && subLabelRef.current) { subLabelRef.current.focus(); subLabelRef.current.select(); }
  }, [editingSubLabel]);

  // Auto-focus label on creation (N key)
  useEffect(() => {
    if (data.autoFocusLabel) {
      isAutoFocusing.current = true;
      setEditingLabel(true);
      setNodes((nodes) => nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, autoFocusLabel: undefined } } : n
      ));
    }
  }, [data.autoFocusLabel, id, setNodes]);

  const defaults = getDefaults(type || 'process');
  const activeColor = data.color || defaults.color;
  const activeIconKey = data.icon === 'none' ? null : (data.icon || defaults.icon);
  const activeShape = data.shape || defaults.shape || 'rounded';

  // Theme colors
  const style = NODE_COLOR_PALETTE[activeColor] || NODE_COLOR_PALETTE.slate;
  const exportColors = NODE_EXPORT_COLORS[activeColor] || NODE_EXPORT_COLORS.slate;

  // Resolve icons
  const IconComponent = useMemo(() => {
    if (data.customIconUrl) return null;
    if (!activeIconKey) return null;
    const exactMatch = ICON_MAP[activeIconKey];
    if (exactMatch) return exactMatch;
    const keyLower = activeIconKey.toLowerCase();
    const foundKey = Object.keys(ICON_MAP).find(k => k.toLowerCase() === keyLower);
    return foundKey ? ICON_MAP[foundKey] : null;
  }, [activeIconKey, data.customIconUrl]);

  // Typography
  const fontFamilyMap: Record<string, string> = {
    inter: 'font-inter', roboto: 'font-roboto', outfit: 'font-outfit',
    playfair: 'font-playfair', fira: 'font-fira', sans: 'font-sans',
    serif: 'font-serif', mono: 'font-mono',
  };

  // Use Design System font if no specific font is selected on the node
  const dsFontFamily = designSystem.typography.fontFamily.split(',')[0].trim().toLowerCase();
  // Map DS font to tailwind class if possible, or use inline style
  // For now, simpler to use inline style for font-family if it comes from DS

  const fontFamilyClass = data.fontFamily ? fontFamilyMap[data.fontFamily] : '';
  const fontFamilyStyle = !data.fontFamily ? { fontFamily: designSystem.typography.fontFamily } : {};

  const fontSize = data.fontSize || '14';
  const isNumericSize = !isNaN(Number(fontSize));
  const fontSizeClass = isNumericSize ? '' : (fontSize === 'small' ? 'text-xs' : fontSize === 'medium' ? 'text-sm' : fontSize === 'large' ? 'text-base' : 'text-lg');
  const fontSizeStyle = isNumericSize ? { fontSize: fontSize + 'px' } : {};

  // Layout alignment: Dynamic
  const layoutClass = 'flex-col';
  const hasIcon = IconComponent || data.customIconUrl;

  // -- Shape Rendering Logic -- //
  const getShapeSVG = () => {
    const strokeColor = exportColors.border;
    const fillColor = exportColors.bg;

    const commonProps = {
      stroke: strokeColor,
      strokeWidth: designSystem.components.edge.strokeWidth || "2", // Use DS edge width or default
      vectorEffect: "non-scaling-stroke",
      fill: fillColor
    };

    switch (activeShape) {
      case 'diamond':
        return <polygon points="50,0 100,50 50,100 0,50" {...commonProps} />;
      case 'hexagon':
        return <polygon points="15,0 85,0 100,50 85,100 15,100 0,50" {...commonProps} />;
      case 'parallelogram':
        return <polygon points="15,0 100,0 85,100 0,100" {...commonProps} />;
      case 'triangle':
        return <polygon points="50,0 100,100 0,100" {...commonProps} />;
      case 'cylinder':
        return (
          <>
            <path d="M0,15 L0,85 Q0,100 50,100 Q100,100 100,85 L100,15 Q100,0 50,0 Q0,0 0,15 Z" {...commonProps} />
            <ellipse cx="50" cy="15" rx="50" ry="15" stroke={strokeColor} strokeWidth="2" vectorEffect="non-scaling-stroke" fill={fillColor} fillOpacity={0.5} />
          </>
        );
      case 'circle':
        return <circle cx="50" cy="50" r="48" {...commonProps} />;
      case 'ellipse':
        return <ellipse cx="50" cy="50" rx="48" ry="48" {...commonProps} />;
      default: return null;
    }
  };

  const isComplexShape = ['diamond', 'hexagon', 'parallelogram', 'cylinder', 'circle', 'ellipse'].includes(activeShape);
  const isCircular = activeShape === 'circle';

  // CSS classes for standard shapes
  // If we are using Design System, we might want to override these defaults
  const borderRadiusClass = !isComplexShape ? (
    activeShape === 'rectangle' ? 'rounded-sm' :
      activeShape === 'capsule' ? 'rounded-[2rem]' : 'rounded-xl'
  ) : '';

  // Calculate Border Radius from Design System if shape is 'rounded' (default)
  const getBorderRadius = () => {
    if (isComplexShape) return '0';
    if (activeShape === 'capsule') return '9999px';
    if (activeShape === 'rectangle') return '4px'; // Or 0
    // For 'rounded' or others
    return designSystem.components.node.borderRadius;
  };

  // Container style
  const containerStyle: React.CSSProperties = {
    minWidth: isCircular ? 150 : 200,
    width: '100%',
    height: '100%',
    ...(isCircular ? { aspectRatio: '1/1' } : {}),
    ...fontFamilyStyle,

    // Apply Design System Styles for Box Shadow and Border
    boxShadow: !isComplexShape ? designSystem.components.node.boxShadow : 'none',
    borderWidth: !isComplexShape ? designSystem.components.node.borderWidth : 0,
    padding: !isComplexShape ? 0 : 0, // Padding handled by inner div usually, but border might affect sizing
    borderRadius: getBorderRadius(),
  };

  return (
    <>
      <NodeResizer
        color="#94a3b8"
        isVisible={selected}
        minWidth={isCircular ? 150 : 200}
        minHeight={isCircular ? 150 : 80}
        lineStyle={{ borderStyle: 'solid', borderWidth: 1 }}
        handleStyle={{ width: 8, height: 8, borderRadius: 4 }}
      />

      {/* Main Node Container */}
      <div
        className={`relative group flex flex-col justify-center h-full transition-all duration-200
          ${!isComplexShape ? style.bg : ''}
          ${!isComplexShape ? style.border : ''}
          ${selected ? 'ring-2 ring-indigo-500 ring-offset-4' : ''}
        `}
        style={containerStyle}
      >
        {/* SVG Background Layer for Complex Shapes */}
        {isComplexShape && (
          <div className="absolute inset-0 w-full h-full z-0">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible drop-shadow-sm"
            >
              {getShapeSVG()}
            </svg>
          </div>
        )}

        {/* Content Layer */}
        <div className={`relative z-10 p-4 flex ${layoutClass} items-center
          ${isComplexShape && activeShape === 'diamond' ? 'px-8 py-6' : ''}
          ${isComplexShape && activeShape === 'hexagon' ? 'px-8' : ''}
          ${isComplexShape && activeShape === 'parallelogram' ? 'px-8' : ''}
          ${isComplexShape && activeShape === 'cylinder' ? 'pt-8 pb-4' : ''}
        `}
          style={{ padding: designSystem.components.node.padding }}
        >

          {/* Icon Area */}
          <div className="flex items-center gap-1.5 shrink-0 mb-2">
            {data.customIconUrl && (
              <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border border-black/5 shadow-sm overflow-hidden ${style.iconBg}`}>
                <img src={data.customIconUrl} alt="icon" className="w-6 h-6 object-contain" />
              </div>
            )}

            {IconComponent && (
              <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border border-black/5 shadow-sm ${style.iconBg}`}>
                <IconComponent className={`w-5 h-5 ${style.iconColor}`} />
              </div>
            )}
          </div>

          {/* Text Content */}
          <div className={`flex flex-col min-w-0 ${!hasIcon ? 'w-full' : ''} ${fontFamilyClass}`} style={{ textAlign: data.align || 'center', ...fontFamilyStyle }}>
            {/* Checkbox + Label row */}
            <div className={`flex items-start gap-2 ${data.isCheckbox ? '' : ''}`}>
              {data.isCheckbox && (
                <button
                  onClick={toggleChecked}
                  className={`shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150 cursor-pointer
                    ${data.checked
                      ? 'bg-indigo-500 border-indigo-500 text-white'
                      : 'bg-white border-slate-300 hover:border-indigo-400'
                    }`}
                >
                  {data.checked && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                </button>
              )}
              <div className={`flex-1 min-w-0 ${data.isCheckbox && data.checked ? 'line-through opacity-50' : ''}`}>
            {editingLabel ? (
              <textarea
                ref={labelRef}
                className={`w-full bg-white/90 border border-indigo-400 rounded px-1 py-0.5 outline-none resize-none leading-tight ${fontSizeClass}`}
                style={{
                  ...fontSizeStyle,
                  fontWeight: data.fontWeight || 'bold',
                  fontStyle: data.fontStyle || 'normal',
                  textAlign: data.align || 'center',
                }}
                value={labelDraft}
                onChange={(e) => setLabelDraft(e.target.value)}
                onBlur={commitLabel}
                onKeyDown={handleLabelKeyDown}
                onClick={stopPropagation}
                onMouseDown={stopPropagation}
                rows={Math.max(1, labelDraft.split('\n').length)}
              />
            ) : (
              <div
                className={`leading-tight block break-words markdown-content [&>p]:m-0 cursor-text ${fontSizeClass}`}
                style={{
                  ...fontSizeStyle,
                  fontWeight: data.fontWeight || 'bold',
                  fontStyle: data.fontStyle || 'normal',
                }}
                onMouseDown={stopMousePropagation}
                onClick={(e) => { if (e.shiftKey) return; e.stopPropagation(); setEditingLabel(true); }}
              >
                {data.label ? (
                  <MemoizedMarkdown content={data.label} />
                ) : (
                  <span className="text-slate-400 italic">Untitled</span>
                )}
              </div>
            )}
            {editingSubLabel ? (
              <textarea
                ref={(el) => {
                  (subLabelRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
                  if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }
                }}
                className="w-full bg-white/90 border border-indigo-400 rounded px-1 py-0.5 outline-none resize-none text-xs text-slate-600 mt-1 leading-normal overflow-hidden"
                style={{
                  fontWeight: 'normal',
                  fontStyle: 'normal',
                  textAlign: data.align || 'center',
                  minHeight: '3em',
                }}
                value={subLabelDraft}
                onChange={(e) => {
                  setSubLabelDraft(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onBlur={commitSubLabel}
                onKeyDown={handleSubLabelKeyDown}
                onClick={stopPropagation}
                onMouseDown={stopPropagation}
              />
            ) : data.subLabel ? (
              <div
                className="text-xs text-slate-600 mt-1 leading-normal markdown-content break-words cursor-text"
                style={{
                  fontWeight: 'normal',
                  fontStyle: 'normal',
                  textAlign: data.align || 'center',
                  opacity: 0.85
                }}
                onMouseDown={stopMousePropagation}
                onClick={(e) => { if (e.shiftKey) return; e.stopPropagation(); setEditingSubLabel(true); }}
              >
                <MemoizedMarkdown content={data.subLabel} />
              </div>
            ) : (
              <div
                className="mt-1 min-h-[1em] cursor-text"
                onMouseDown={stopMousePropagation}
                onClick={(e) => { if (e.shiftKey) return; e.stopPropagation(); setSubLabelDraft(''); setEditingSubLabel(true); }}
              />
            )}
              </div>{/* close checkbox flex-1 wrapper */}
            </div>{/* close checkbox + label row */}

            {/* Clickable Link */}
            {data.link && (
              <div
                className="flex items-center gap-1 mt-2 cursor-pointer group/link"
                onClick={handleLinkClick}
              >
                <ExternalLink className="w-3 h-3 text-indigo-400 shrink-0" />
                <span className="text-[11px] text-indigo-500 hover:text-indigo-700 group-hover/link:underline truncate max-w-[180px]">
                  {data.link.replace(/^https?:\/\/(www\.)?/, '').slice(0, 40)}
                </span>
              </div>
            )}

            {/* Attached File */}
            {data.attachmentUrl && (
              <div
                className="flex items-center gap-1 mt-1.5 cursor-pointer group/attachment"
                onClick={handleAttachmentClick}
              >
                <FileText className="w-3 h-3 text-rose-400 shrink-0" />
                <span className="text-[11px] text-rose-500 hover:text-rose-700 group-hover/attachment:underline truncate max-w-[180px]">
                  {data.attachmentName || 'Attachment'}
                </span>
              </div>
            )}
          </div>

          {/* Image */}
          {data.imageUrl && (
            <div className="w-full mt-3 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
              <img src={data.imageUrl} alt="attachment" className="w-full h-auto max-h-[200px] object-cover" />
            </div>
          )}
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        isConnectableStart={true}
        isConnectableEnd={true}
        className={`!w-4 !h-4 !border-2 !border-white ${style.handle} transition-all duration-150 hover:!scale-150 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 [.is-connecting_&]:opacity-100'}`}
        style={{ left: '50%', top: 0, transform: 'translate(-50%, -50%)', pointerEvents: 'all' }}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        isConnectableStart={true}
        isConnectableEnd={true}
        className={`!w-4 !h-4 !border-2 !border-white ${style.handle} transition-all duration-150 hover:!scale-150 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 [.is-connecting_&]:opacity-100'}`}
        style={{ left: '50%', top: '100%', transform: 'translate(-50%, -50%)', pointerEvents: 'all' }}
      />

      <Handle
        type="source"
        position={Position.Left}
        id="left"
        isConnectableStart={true}
        isConnectableEnd={true}
        className={`!w-4 !h-4 !border-2 !border-white ${style.handle} transition-all duration-150 hover:!scale-150 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 [.is-connecting_&]:opacity-100'}`}
        style={{ top: '50%', left: 0, transform: 'translate(-50%, -50%)', pointerEvents: 'all' }}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectableStart={true}
        isConnectableEnd={true}
        className={`!w-4 !h-4 !border-2 !border-white ${style.handle} transition-all duration-150 hover:!scale-150 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 [.is-connecting_&]:opacity-100'}`}
        style={{ top: '50%', left: '100%', transform: 'translate(-50%, -50%)', pointerEvents: 'all' }}
      />
    </>
  );
};

export default memo(CustomNode);
