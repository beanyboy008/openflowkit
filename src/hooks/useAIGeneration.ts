import { useState, useCallback } from 'react';
import { Node, Edge, useReactFlow } from 'reactflow';
import { generateDiagramFromChat, ChatMessage } from '../services/aiService';
import { parseOpenFlowDSL } from '@/lib/openFlowDSLParser';
import { getElkLayout } from '../services/elkLayout';
import { createDefaultEdge } from '../constants';
import { useFlowStore } from '../store';
import { useToast } from '../components/ui/ToastContext';

export const useAIGeneration = (
  recordHistory: () => void
) => {
  const { nodes, edges, setNodes, setEdges, brandConfig, globalEdgeOptions } = useFlowStore();
  const { fitView } = useReactFlow();
  const { addToast } = useToast();
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const clearChat = useCallback(() => setChatMessages([]), []);

  const handleAIRequest = useCallback(async (prompt: string, imageBase64?: string) => {
    recordHistory();
    setIsGenerating(true);

    // Create user message
    const userMessage: ChatMessage = {
      role: 'user',
      parts: [{ text: prompt }]
    };

    try {
      // 1. Prepare context (include icon + color for style-consistent updates)
      const simplifiedNodes = nodes.map((n) => ({
        id: n.id,
        type: n.type,
        label: n.data.label,
        description: n.data.subLabel,
        icon: n.data.icon,
        color: n.data.color,
      }));

      const currentGraph = JSON.stringify({
        nodes: simplifiedNodes,
        edges: edges.map((e) => ({ source: e.source, target: e.target, label: e.label })),
      });

      const selectedNodes = simplifiedNodes.filter(n => nodes.find(orig => orig.id === n.id)?.selected);

      // 2. Call AI (now using unified service)
      // Fall back to env var at runtime — Zustand persist can serialize apiKey as undefined
      const apiKey = brandConfig.apiKey || import.meta.env.VITE_ANTHROPIC_API_KEY;

      const callAI = (msg: string, img?: string) => generateDiagramFromChat(
        chatMessages,
        msg,
        currentGraph,
        img,
        apiKey,
        brandConfig.aiModel,
        brandConfig.aiProvider || 'gemini',
        brandConfig.customBaseUrl
      );

      let dslText = await callAI(prompt, imageBase64);

      // 3. Update Chat History
      if (imageBase64) {
        userMessage.parts[0].text += " [Image Attached]";
      }

      // 4. Parse DSL (with self-correction retry)
      const cleanDSL = (raw: string) => raw.replace(/```(yaml|flowmind|)?/g, '').replace(/```/g, '').trim();

      let parseResult = parseOpenFlowDSL(cleanDSL(dslText));

      // Step 9: If parse error, feed error back to AI for one retry
      if (parseResult.error) {
        console.warn('Parse error, attempting self-correction:', parseResult.error);
        const correctionPrompt = `Your DSL had a parse error: "${parseResult.error}". Please fix and output corrected FlowMind DSL only.`;
        dslText = await callAI(correctionPrompt);
        parseResult = parseOpenFlowDSL(cleanDSL(dslText));
        if (parseResult.error) {
          throw new Error(parseResult.error);
        }
      }

      // Step 8: Structural quality validation
      const qualityIssues: string[] = [];
      const nonNoteNodes = parseResult.nodes.filter(n => n.type !== 'annotation');

      if (nonNoteNodes.length >= 5) {
        // Type diversity: need 3+ node types
        const nodeTypes = new Set(parseResult.nodes.map(n => n.type));
        if (nodeTypes.size < 3) {
          qualityIssues.push(`Only ${nodeTypes.size} node type(s) used — need at least 3 (e.g., start, process, decision, end, note)`);
        }

        // Linearity check: count nodes with 2+ outgoing edges
        const outDegree = new Map<string, number>();
        parseResult.edges.forEach(e => outDegree.set(e.source, (outDegree.get(e.source) || 0) + 1));
        const branchingNodes = [...outDegree.values()].filter(d => d >= 2).length;
        if (branchingNodes < 1) {
          qualityIssues.push('No branching — every node has at most 1 outgoing edge. Add decision points or parallel paths.');
        }
      }

      // Completeness: non-note nodes should have icons + colors + subLabels
      const incompleteNodes = nonNoteNodes.filter(n =>
        !n.data.icon || !n.data.color || !n.data.subLabel
      );
      if (incompleteNodes.length > 0) {
        qualityIssues.push(`${incompleteNodes.length} node(s) missing icon, color, or subLabel: ${incompleteNodes.map(n => n.data.label || n.id).join(', ')}`);
      }

      // Auto-retry once if quality fails
      if (qualityIssues.length > 0) {
        console.warn('Quality issues detected, retrying:', qualityIssues);
        const retryPrompt = `Your diagram has these quality issues:\n${qualityIssues.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\nPlease regenerate with fixes. Output corrected FlowMind DSL only.`;
        const retryDsl = await callAI(retryPrompt);
        const retryResult = parseOpenFlowDSL(cleanDSL(retryDsl));
        // Use retry result only if it parses successfully and has nodes
        if (!retryResult.error && retryResult.nodes.length > 0) {
          dslText = retryDsl;
          parseResult = retryResult;
        }
        // Otherwise keep the original (imperfect but parseable)
      }

      const modelMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: dslText }]
      };

      setChatMessages(prev => [...prev, userMessage, modelMessage]);

      // 5. Merge Logic: Preserve IDs for existing labels
      // We expect the AI to try and preserve labels.
      // V2 parser prefers explicit IDs but handles implicit ones via label mapping.

      const idMap = new Map<string, string>();

      parseResult.nodes.forEach(newNode => {
        // Try to match by label to preserve existing node states if possible
        const existingNode = nodes.find(n => n.data.label?.toLowerCase() === newNode.data.label?.toLowerCase());
        if (existingNode) {
          idMap.set(newNode.id, existingNode.id);
        } else {
          // New node
          idMap.set(newNode.id, newNode.id);
        }
      });

      // Reconstruct nodes with mapped IDs
      const finalNodes = parseResult.nodes.map(n => ({
        ...n,
        id: idMap.get(n.id)!,
        type: n.type || 'process'
      }));

      // Reconstruct edges with mapped IDs
      const finalEdges = parseResult.edges.map(e => {
        const sourceId = idMap.get(e.source);
        const targetId = idMap.get(e.target);

        if (!sourceId || !targetId) {
          console.warn(`Skipping edge with missing node: ${e.source} -> ${e.target}`);
          return null;
        }

        // Apply Global Default if parser returns 'default'
        let edgeType = e.type;
        if (edgeType === 'default' || !edgeType) {
          edgeType = globalEdgeOptions.type === 'default' ? undefined : globalEdgeOptions.type;
        }

        // Preserve specific styles (curved/dashed) if recognized by attributes
        if (e.data?.styleType === 'curved') edgeType = 'default'; // ReactFlow default is bezier/curved

        return {
          ...e,
          source: sourceId,
          target: targetId,
          type: edgeType,
          animated: e.animated || globalEdgeOptions.animated,
          style: {
            ...e.style,
            strokeWidth: globalEdgeOptions.strokeWidth,
            ...(globalEdgeOptions.color ? { stroke: globalEdgeOptions.color } : {})
          },
          id: `e-${sourceId}-${targetId}-${Date.now()}` // Ensure unique edge ID
        };
      }).filter(Boolean) as Edge[];


      // 6. Apply Auto-Layout (ELK) - CRITICAL for V2 which returns (0,0)
      // mrtree is ELK's dedicated tree algorithm — cleaner hierarchy than 'layered' for AI-generated flows
      const layoutedNodes = await getElkLayout(finalNodes, finalEdges, {
        direction: 'TB',
        algorithm: 'mrtree',
        spacing: 'loose'
      });

      setNodes(layoutedNodes);
      setEdges(finalEdges);

      // Wait for render then fit view
      setTimeout(() => fitView({ duration: 800, padding: 0.2 }), 100);

      addToast('Diagram generated successfully!', 'success');
    } catch (error: any) {
      console.error('AI Generation failed:', error);
      addToast(`Failed to generate: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [nodes, edges, recordHistory, setNodes, setEdges, fitView, addToast, chatMessages, brandConfig.apiKey, globalEdgeOptions]);

  return { isAIOpen, setIsAIOpen, isGenerating, handleAIRequest, chatMessages, clearChat };
};
