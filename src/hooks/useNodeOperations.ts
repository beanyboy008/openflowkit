import { useCallback } from 'react';
import { Node, useReactFlow } from 'reactflow';
import { NodeData } from '@/lib/types';
import { useFlowStore } from '../store';
import { NODE_WIDTH, NODE_HEIGHT } from '../constants';

export const useNodeOperations = (recordHistory: () => void) => {
    const { nodes, setNodes, setEdges, setSelectedNodeId } = useFlowStore();
    const { screenToFlowPosition } = useReactFlow();

    // --- Node Data Updates ---
    const updateNodeData = useCallback((id: string, data: Partial<NodeData>) => {
        setNodes((nds) =>
            nds.map((node) => node.id === id ? { ...node, data: { ...node.data, ...data } } : node)
        );
    }, [setNodes]);

    const updateNodeType = useCallback((id: string, type: string) => {
        recordHistory();
        setNodes((nds) => nds.map((node) => node.id === id ? { ...node, type } : node));
    }, [setNodes, recordHistory]);

    const updateNodeZIndex = useCallback((id: string, action: 'front' | 'back') => {
        recordHistory();
        setNodes((nds) => {
            const node = nds.find((n) => n.id === id);
            if (!node) return nds;

            const zIndices = nds.map((n) => n.zIndex || 0);
            const maxZ = Math.max(...zIndices, 0);
            const minZ = Math.min(...zIndices, 0);

            const newZ = action === 'front' ? maxZ + 1 : minZ - 1;

            return nds.map((n) => (n.id === id ? { ...n, zIndex: newZ } : n));
        });
    }, [setNodes, recordHistory]);

    // --- Delete ---
    const deleteNode = useCallback((id: string) => {
        recordHistory();
        setNodes((nds) => nds.filter((n) => n.id !== id));
        setSelectedNodeId(null);
    }, [setNodes, recordHistory, setSelectedNodeId]);

    // --- Duplicate ---
    const duplicateNode = useCallback((id: string) => {
        const nodeToDuplicate = nodes.find((n) => n.id === id);
        if (!nodeToDuplicate) return;
        recordHistory();
        const newNodeId = `${Date.now()}`;
        const newNode: Node = {
            ...nodeToDuplicate,
            id: newNodeId,
            position: { x: nodeToDuplicate.position.x + 50, y: nodeToDuplicate.position.y + 50 },
            selected: true,
        };
        setNodes((nds) => [...nds.map((n) => ({ ...n, selected: false })), newNode]);
        setSelectedNodeId(newNodeId);
    }, [nodes, recordHistory, setNodes, setSelectedNodeId]);

    // --- Add Nodes ---
    const handleAddNode = useCallback((position?: { x: number; y: number }) => {
        recordHistory();
        const id = `${Date.now()}`;
        const newNode: Node = {
            id,
            position: position || { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
            data: { label: '', subLabel: '', color: 'slate', autoFocusLabel: true },
            type: 'process',
        };
        setNodes((nds) => nds.concat(newNode));
        setSelectedNodeId(id);
    }, [setNodes, recordHistory, setSelectedNodeId]);

    const handleAddAnnotation = useCallback((position?: { x: number; y: number }) => {
        recordHistory();
        const id = `${Date.now()}`;
        const newNode: Node = {
            id,
            position: position || { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
            data: { label: 'Note', subLabel: 'Add your comments here.', color: 'yellow' },
            type: 'annotation',
        };
        setNodes((nds) => nds.concat(newNode));
        setSelectedNodeId(id);
    }, [setNodes, recordHistory, setSelectedNodeId]);

    const handleAddSection = useCallback((position?: { x: number; y: number }) => {
        recordHistory();
        const id = `section-${Date.now()}`;
        const newNode: Node = {
            id,
            position: position || { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 },
            data: { label: 'New Section', subLabel: '', color: 'blue' },
            type: 'section',
            style: { width: 500, height: 400 },
            zIndex: -1,
        };
        setNodes((nds) => nds.concat(newNode));
        setSelectedNodeId(id);
    }, [setNodes, recordHistory, setSelectedNodeId]);

    const handleAddTextNode = useCallback((position?: { x: number; y: number }) => {
        recordHistory();
        const id = `text-${Date.now()}`;
        const newNode: Node = {
            id,
            position: position || { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
            data: { label: 'Text', subLabel: '', color: 'slate' },
            type: 'text',
        };
        setNodes((nds) => nds.concat(newNode));
        setSelectedNodeId(id);
    }, [setNodes, recordHistory, setSelectedNodeId]);

    const handleAddImage = useCallback((imageUrl: string, position?: { x: number; y: number }) => {
        recordHistory();
        const id = `image-${Date.now()}`;
        const newNode: Node = {
            id,
            position: position || { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
            data: { label: 'Image', imageUrl, transparency: 1, rotation: 0 },
            type: 'image',
            style: { width: 200, height: 200 },
        };
        setNodes((nds) => nds.concat(newNode));
        setSelectedNodeId(id);
    }, [setNodes, recordHistory, setSelectedNodeId]);

    // --- Drag Operations ---
    const onNodeDragStart = useCallback((event: React.MouseEvent, node: Node) => {
        recordHistory();

        // Alt + Drag Duplication
        if (event.altKey) {
            const newNodeId = `${Date.now()}`;
            const newNode: Node = {
                ...node,
                id: newNodeId,
                selected: false, // The static clone should not be selected
                position: { ...node.position }, // Clone executes at START position
                // We might want to reset zIndex or ensure it's correct?
                zIndex: (node.zIndex || 0) - 1, // Put clone slightly behind?
            };

            // Add the CLONE (which stays behind)
            setNodes((nds) => nds.concat(newNode));

            // The user continues dragging the ORIGINAL 'node'.
        }
    }, [recordHistory, setNodes]);

    const onNodeDrag = useCallback((_event: React.MouseEvent, _node: Node, draggedNodes: Node[]) => {
        const { nodes: storeNodes, setActiveGuides } = useFlowStore.getState();

        // Merge dragged positions into store nodes
        const draggedNodesMap = new Map(draggedNodes.map(n => [n.id, n]));
        const mergedNodes = storeNodes.map(n => draggedNodesMap.get(n.id) || n);

        // Alignment guides
        const THRESHOLD = 8;
        const guides: { axis: 'x' | 'y'; position: number }[] = [];
        const draggedIds = new Set(draggedNodes.map(n => n.id));
        const otherNodes = mergedNodes.filter(n => !draggedIds.has(n.id) && n.type !== 'section');

        for (const dragged of draggedNodes) {
            const dw = (dragged.width ?? NODE_WIDTH);
            const dh = (dragged.height ?? NODE_HEIGHT);
            const dLeft = dragged.position.x;
            const dCx = dLeft + dw / 2;
            const dRight = dLeft + dw;
            const dTop = dragged.position.y;
            const dCy = dTop + dh / 2;
            const dBottom = dTop + dh;

            for (const other of otherNodes) {
                const ow = (other.width ?? NODE_WIDTH);
                const oh = (other.height ?? NODE_HEIGHT);
                const oLeft = other.position.x;
                const oCx = oLeft + ow / 2;
                const oRight = oLeft + ow;
                const oTop = other.position.y;
                const oCy = oTop + oh / 2;
                const oBottom = oTop + oh;

                // X-axis alignment (vertical guide lines)
                for (const [dVal, oVal] of [[dLeft, oLeft], [dLeft, oCx], [dLeft, oRight], [dCx, oLeft], [dCx, oCx], [dCx, oRight], [dRight, oLeft], [dRight, oCx], [dRight, oRight]]) {
                    if (Math.abs(dVal - oVal) < THRESHOLD) {
                        guides.push({ axis: 'x', position: oVal });
                    }
                }
                // Y-axis alignment (horizontal guide lines)
                for (const [dVal, oVal] of [[dTop, oTop], [dTop, oCy], [dTop, oBottom], [dCy, oTop], [dCy, oCy], [dCy, oBottom], [dBottom, oTop], [dBottom, oCy], [dBottom, oBottom]]) {
                    if (Math.abs(dVal - oVal) < THRESHOLD) {
                        guides.push({ axis: 'y', position: oVal });
                    }
                }
            }
        }

        // Deduplicate guides
        const unique = guides.filter((g, i, arr) =>
            arr.findIndex(o => o.axis === g.axis && Math.abs(o.position - g.position) < 1) === i
        );
        setActiveGuides(unique);
    }, []);

    const onNodeDragStop = useCallback((_event: React.MouseEvent, draggedNode: Node) => {
        useFlowStore.getState().setActiveGuides([]);
        const { nodes: currentNodes } = useFlowStore.getState();

        if (draggedNode.type === 'section') return;

        // Section/Parenting Logic
        let absX = draggedNode.position.x;
        let absY = draggedNode.position.y;
        if (draggedNode.parentNode) {
            const currentParent = currentNodes.find((n) => n.id === draggedNode.parentNode);
            if (currentParent) {
                absX += currentParent.position.x;
                absY += currentParent.position.y;
            }
        }

        const sectionNodes = currentNodes.filter((n) => n.type === 'section' && n.id !== draggedNode.id);
        let newParent: Node | null = null;

        for (const section of sectionNodes) {
            const sW = (section.style?.width as number) || 500;
            const sH = (section.style?.height as number) || 400;
            const sX = section.position.x;
            const sY = section.position.y;

            if (
                absX > sX &&
                absX < sX + sW &&
                absY > sY &&
                absY < sY + sH
            ) {
                newParent = section;
                break;
            }
        }

        if (newParent?.id === draggedNode.parentNode) return;

        const updatedNodes = currentNodes.map((n) => {
            if (n.id !== draggedNode.id) return n;
            if (newParent) {
                return {
                    ...n,
                    parentNode: newParent.id,
                    extent: 'parent' as const,
                    position: {
                        x: absX - newParent.position.x,
                        y: absY - newParent.position.y,
                    },
                };
            } else if (n.parentNode) {
                // Unparent
                const { parentNode, extent, ...rest } = n as any;
                return { ...rest, position: { x: absX, y: absY } };
            }
            return { ...n, position: draggedNode.position };
        });

        setNodes(updatedNodes);
    }, [setNodes]);

    const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
        setSelectedNodeId(node.id);
    }, [setSelectedNodeId]);


    return {
        updateNodeData,
        updateNodeType,
        updateNodeZIndex,
        deleteNode,
        duplicateNode,
        handleAddNode,
        handleAddAnnotation,
        handleAddSection,
        handleAddTextNode,
        handleAddImage,
        onNodeDragStart,
        onNodeDrag,
        onNodeDragStop,
        onNodeDoubleClick
    };
};
