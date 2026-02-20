import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { NodeProps, NodeResizer } from 'reactflow';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { NodeData } from '@/lib/types';
import { useFlowStore } from '../store';

const AnnotationNode = ({ id, data, selected }: NodeProps<NodeData>) => {
  const setNodes = useFlowStore((s) => s.setNodes);

  const [editingLabel, setEditingLabel] = useState(false);
  const [editingBody, setEditingBody] = useState(false);
  const [labelDraft, setLabelDraft] = useState(data.label || '');
  const [bodyDraft, setBodyDraft] = useState(data.subLabel || '');
  const labelRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setLabelDraft(data.label || ''); }, [data.label]);
  useEffect(() => { setBodyDraft(data.subLabel || ''); }, [data.subLabel]);

  const commitLabel = useCallback(() => {
    setEditingLabel(false);
    setNodes((nodes) => nodes.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, label: labelDraft } } : n
    ));
  }, [id, labelDraft, setNodes]);

  const commitBody = useCallback(() => {
    setEditingBody(false);
    setNodes((nodes) => nodes.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, subLabel: bodyDraft } } : n
    ));
  }, [id, bodyDraft, setNodes]);

  const stopPropagation = useCallback((e: React.KeyboardEvent | React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  useEffect(() => {
    if (editingLabel && labelRef.current) { labelRef.current.focus(); labelRef.current.select(); }
  }, [editingLabel]);

  useEffect(() => {
    if (editingBody && bodyRef.current) { bodyRef.current.focus(); bodyRef.current.select(); }
  }, [editingBody]);

  return (
    <>
      <NodeResizer
        color="#ca8a04"
        isVisible={selected}
        minWidth={200}
        minHeight={100}
      />
      <div
        className={`
          relative flex flex-col h-full shadow-md rounded-br-3xl rounded-tl-sm rounded-tr-sm rounded-bl-sm border border-yellow-300 transition-all duration-200
          bg-yellow-100/90
          ${selected ? `ring-2 ring-yellow-400 ring-offset-2 z-10` : 'hover:shadow-lg'}
        `}
        style={{ minWidth: 200, width: '100%', height: '100%' }}
      >
        <div className="p-4 flex flex-col h-full">
          {editingLabel ? (
            <textarea
              ref={labelRef}
              className="w-full bg-yellow-50/90 border border-yellow-400 rounded px-1 py-0.5 outline-none resize-none text-sm font-bold text-yellow-900 leading-tight"
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Escape') { setLabelDraft(data.label || ''); setEditingLabel(false); }
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitLabel(); }
              }}
              onClick={stopPropagation}
              onMouseDown={stopPropagation}
              rows={1}
            />
          ) : (
            <div
              className="text-sm font-bold text-yellow-900 border-b border-yellow-200 pb-2 mb-2 cursor-text"
              onClick={(e) => { e.stopPropagation(); setEditingLabel(true); }}
            >
              {data.label || <span className="text-yellow-600 italic">Click to add title</span>}
            </div>
          )}

          {editingBody ? (
            <textarea
              ref={bodyRef}
              className="w-full flex-1 bg-yellow-50/90 border border-yellow-400 rounded px-1 py-0.5 outline-none resize-none text-xs text-yellow-800 font-medium leading-relaxed"
              value={bodyDraft}
              onChange={(e) => setBodyDraft(e.target.value)}
              onBlur={commitBody}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Escape') { setBodyDraft(data.subLabel || ''); setEditingBody(false); }
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitBody(); }
              }}
              onClick={stopPropagation}
              onMouseDown={stopPropagation}
              rows={Math.max(3, bodyDraft.split('\n').length)}
            />
          ) : (
            <div
              className="text-xs text-yellow-800 font-medium leading-relaxed markdown-content flex-1 overflow-hidden cursor-text"
              onClick={(e) => { e.stopPropagation(); setEditingBody(true); }}
            >
              {data.subLabel ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {data.subLabel}
                </ReactMarkdown>
              ) : (
                <span className="text-yellow-600 italic">Click to add note</span>
              )}
            </div>
          )}
        </div>

        {/* Decorative corner fold */}
        <div className="absolute bottom-0 right-0 w-8 h-8 bg-yellow-200/50 rounded-tl-xl border-t border-l border-yellow-300/30"></div>
      </div>
    </>
  );
};

export default memo(AnnotationNode);
