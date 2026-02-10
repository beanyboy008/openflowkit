import { useState, useCallback } from 'react';
import { Node, Edge, useReactFlow } from 'reactflow';
import { generateDiagramFromPrompt } from '../services/geminiService';
import { createDefaultEdge } from '../constants';
import { useFlowStore } from '../store';

import { useToast } from '../components/ui/ToastContext';

export const useAIGeneration = (
  recordHistory: () => void
) => {
  const { nodes, edges, setNodes, setEdges } = useFlowStore();
  const { fitView } = useReactFlow();
  const { addToast } = useToast();
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIRequest = useCallback(async (prompt: string) => {
    recordHistory();
    setIsGenerating(true);
    try {
      // ... logic ...
      const simplifiedNodes = nodes.map((n) => ({
        id: n.id,
        type: n.type,
        label: n.data.label,
        description: n.data.subLabel,
        x: n.position.x,
        y: n.position.y
      }));

      const currentGraph = JSON.stringify({
        nodes: simplifiedNodes,
        edges: edges.map((e) => ({ source: e.source, target: e.target, label: e.label })),
      });

      const selectedNodes = simplifiedNodes.filter(n => nodes.find(orig => orig.id === n.id)?.selected);
      const focusedContextJSON = selectedNodes.length > 0 ? JSON.stringify(selectedNodes) : undefined;

      const result = await generateDiagramFromPrompt(prompt, currentGraph, focusedContextJSON);

      const newNodes: Node[] = result.nodes.map((n) => ({
        id: n.id,
        type: n.type || 'process',
        position: { x: n.x, y: n.y },
        data: { label: n.label, subLabel: n.description },
      }));

      const newEdges: Edge[] = result.edges.map((e) =>
        createDefaultEdge(e.source, e.target, e.label, e.id)
      );

      setNodes(newNodes);
      setEdges(newEdges);
      setIsAIOpen(false);
      setTimeout(() => fitView({ duration: 800, padding: 0.2 }), 100);
      addToast('Diagram generated successfully!', 'success');
    } catch (error) {
      console.error('AI Generation failed:', error);
      addToast('Failed to generate diagram. Please check your API key or try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [nodes, edges, recordHistory, setNodes, setEdges, fitView, addToast]);

  return { isAIOpen, setIsAIOpen, isGenerating, handleAIRequest };
};
