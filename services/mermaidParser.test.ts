import { describe, it, expect } from 'vitest';
import { parseMermaid } from './mermaidParser';

describe('mermaidParser', () => {
    it('should parse a basic flowchart with TB direction', () => {
        const input = `
            flowchart TD
            A[Start] --> B[End]
        `;
        const result = parseMermaid(input);
        expect(result.nodes).toHaveLength(2);
        expect(result.edges).toHaveLength(1);
        expect(result.nodes[0].data.label).toBe('Start');
        expect(result.nodes[1].data.label).toBe('End');
        expect(result.edges[0].source).toBe('A');
        expect(result.edges[0].target).toBe('B');
    });

    it('should handle different node types based on shapes', () => {
        const input = `
            flowchart TD
            S([Start Node])
            P[Process Node]
            D{Decision Node}
            E((End Node))
        `;
        const result = parseMermaid(input);
        expect(result.nodes.find(n => n.id === 'S')?.type).toBe('start');
        expect(result.nodes.find(n => n.id === 'P')?.type).toBe('process');
        expect(result.nodes.find(n => n.id === 'D')?.type).toBe('decision');
        expect(result.nodes.find(n => n.id === 'E')?.type).toBe('end');
    });

    it('should parse edges with labels', () => {
        const input = `
            flowchart TD
            A -->|Yes| B
            A -->|No| C
        `;
        const result = parseMermaid(input);
        expect(result.edges).toHaveLength(2);
        expect(result.edges[0].label).toBe('Yes');
        expect(result.edges[1].label).toBe('No');
    });

    it('should handle LR direction', () => {
        const input = `
            flowchart LR
            A --> B
        `;
        const result = parseMermaid(input);
        // In LR, nodes are placed horizontally
        expect(result.nodes[1].position.x).toBeGreaterThan(result.nodes[0].position.x);
        expect(result.nodes[1].position.y).toBe(result.nodes[0].position.y);
    });

    it('should return error if no flowchart declaration is found', () => {
        const input = `A --> B`;
        const result = parseMermaid(input);
        expect(result.error).toBeDefined();
        expect(result.nodes).toHaveLength(0);
    });

    it('should handle inline node declarations in edges', () => {
        const input = `
            flowchart TD
            A[Node A] --> B((Node B))
        `;
        const result = parseMermaid(input);
        expect(result.nodes).toHaveLength(2);
        expect(result.nodes.find(n => n.id === 'A')?.data.label).toBe('Node A');
        expect(result.nodes.find(n => n.id === 'B')?.type).toBe('end');
    });
});
