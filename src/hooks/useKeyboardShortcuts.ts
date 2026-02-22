import { useEffect, useState } from 'react';

interface ShortcutHandlers {
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;
  undo: () => void;
  redo: () => void;
  duplicateNode: (id: string) => void;
  selectAll: () => void;
  onCommandBar: () => void;
  onSearch: () => void;
  onShortcutsHelp: () => void;
  onAddNode: () => void;
  onSelectMode: () => void;
  onPanMode: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onPasteImage: (dataUrl: string) => void;
  onPasteText: (text: string) => void;
}

export const useKeyboardShortcuts = ({
  selectedNodeId,
  selectedEdgeId,
  deleteNode,
  deleteEdge,
  undo,
  redo,
  duplicateNode,
  selectAll,
  onCommandBar,
  onSearch,
  onShortcutsHelp,
  onAddNode,
  onSelectMode,
  onPanMode,
  onCopy,
  onPaste,
  onPasteImage,
  onPasteText,
}: ShortcutHandlers) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {

      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;

      // Command Bar (Cmd+K)
      if (isCmdOrCtrl && e.key === 'k') {
        e.preventDefault();
        onCommandBar();
        return;
      }

      // Search (Cmd+F)
      if (isCmdOrCtrl && e.key === 'f') {
        e.preventDefault();
        onSearch();
        return;
      }

      // Help (?) - Shift+/
      if (e.key === '?' || (isShift && e.key === '/')) {
        // Only if not typing in input
        const tag = (document.activeElement as HTMLElement)?.tagName;
        const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || (document.activeElement as HTMLElement)?.isContentEditable;
        if (!isEditable) {
          e.preventDefault();
          onShortcutsHelp();
        }
      }

      // Add Node (N)
      if (e.key === 'n' && !isCmdOrCtrl) {
        const tag = (document.activeElement as HTMLElement)?.tagName;
        const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || (document.activeElement as HTMLElement)?.isContentEditable;
        if (!isEditable) {
          e.preventDefault();
          onAddNode();
          return;
        }
      }

      // Select Mode (A)
      if (e.key === 'a' && !isCmdOrCtrl) {
        const tag = (document.activeElement as HTMLElement)?.tagName;
        const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || (document.activeElement as HTMLElement)?.isContentEditable;
        if (!isEditable) {
          e.preventDefault();
          onSelectMode();
          return;
        }
      }

      // Pan Mode (H)
      if (e.key === 'h' && !isCmdOrCtrl) {
        const tag = (document.activeElement as HTMLElement)?.tagName;
        const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || (document.activeElement as HTMLElement)?.isContentEditable;
        if (!isEditable) {
          e.preventDefault();
          onPanMode();
          return;
        }
      }

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const tag = (document.activeElement as HTMLElement)?.tagName;
        const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || (document.activeElement as HTMLElement)?.isContentEditable;
        if (isEditable) return;

        if (selectedNodeId) {
          deleteNode(selectedNodeId);
        }
        if (selectedEdgeId) {
          deleteEdge(selectedEdgeId);
        }
      }

      // Undo / Redo
      if (isCmdOrCtrl && e.key === 'z') {
        e.preventDefault();
        if (isShift) {
          redo();
        } else {
          undo();
        }
      }
      if (isCmdOrCtrl && e.key === 'y') {
        e.preventDefault();
        redo();
      }

      // Duplicate
      if (isCmdOrCtrl && e.key === 'd') {
        e.preventDefault();
        if (selectedNodeId) duplicateNode(selectedNodeId);
      }

      // Copy (Cmd+C)
      if (isCmdOrCtrl && e.key === 'c') {
        const tag = (document.activeElement as HTMLElement)?.tagName;
        const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || (document.activeElement as HTMLElement)?.isContentEditable;
        if (!isEditable) {
          e.preventDefault();
          onCopy();
          return;
        }
      }

      // Paste (Cmd+V) — check clipboard for images first, then fall back to node paste
      if (isCmdOrCtrl && e.key === 'v') {
        const tag = (document.activeElement as HTMLElement)?.tagName;
        const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || (document.activeElement as HTMLElement)?.isContentEditable;
        if (!isEditable) {
          e.preventDefault();
          navigator.clipboard.read().then((items) => {
            // 1. Check for image
            for (const item of items) {
              const imageType = item.types.find((t) => t.startsWith('image/'));
              if (imageType) {
                item.getType(imageType).then((blob) => {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const dataUrl = ev.target?.result as string;
                    if (dataUrl) onPasteImage(dataUrl);
                  };
                  reader.readAsDataURL(blob);
                });
                return;
              }
            }
            // 2. Read text — check if it's our internal marker
            navigator.clipboard.readText().then((text) => {
              if (text === '[OFK:nodes]') {
                // User copied nodes internally and hasn't copied anything else since
                onPaste();
              } else if (text && text.trim()) {
                // External text on clipboard — create a node with it
                onPasteText(text.trim());
              } else {
                onPaste();
              }
            }).catch(() => onPaste());
          }).catch(() => {
            // Clipboard API failed (permissions) — fall back to node paste
            onPaste();
          });
          return;
        }
      }

      // Select All
      if (isCmdOrCtrl && e.key === 'a') {
        e.preventDefault();
        // Only if focus is body or canvas (not inputs)
        const tag = (document.activeElement as HTMLElement)?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          selectAll();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodeId, selectedEdgeId, deleteNode, deleteEdge, undo, redo, duplicateNode, selectAll, onCommandBar, onSearch, onShortcutsHelp, onAddNode, onSelectMode, onPanMode, onCopy, onPaste, onPasteImage, onPasteText]);
};
