# PDF Attachment Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow users to drag-and-drop PDFs onto nodes, upload to Supabase Storage, and display as clickable links.

**Architecture:** PDFs are uploaded to Supabase Storage `attachments` bucket (public read). Node stores the public URL + original filename. Displayed as a clickable link on the node with a FileText icon. Properties panel shows attached file with remove button and file picker.

**Tech Stack:** Supabase Storage, React, TypeScript

---

### Task 1: Add attachment fields to NodeData

**Files:**
- Modify: `src/lib/types.ts:16-40`

Add `attachmentUrl?: string` and `attachmentName?: string` to `NodeData` interface.

**Commit:** `feat: add attachment fields to NodeData`

---

### Task 2: Add Supabase upload helper

**Files:**
- Modify: `src/lib/supabase.ts`

Add `uploadAttachment(file: File, userId: string): Promise<{ url: string; name: string } | null>` function that:
1. Generates path: `{userId}/{Date.now()}-{file.name}`
2. Uploads to `attachments` bucket
3. Returns public URL + original filename

**Commit:** `feat: add Supabase attachment upload helper`

---

### Task 3: Render attachment link on nodes

**Files:**
- Modify: `src/components/CustomNode.tsx:388-399`

Below the existing link section, add attachment display:
- FileText icon + truncated filename
- Clicks open the PDF in a new tab
- Same styling pattern as the existing link

**Commit:** `feat: display PDF attachment link on nodes`

---

### Task 4: Add attachment section to properties panel

**Files:**
- Modify: `src/components/properties/NodeProperties.tsx:438`

Below the Link Input section, add:
- "Attached File" row with Paperclip icon
- If attachment exists: show filename + remove button
- If no attachment: show file input (accept=".pdf")
- On file select: upload to Supabase, set attachmentUrl + attachmentName on node

**Commit:** `feat: add attachment section to properties panel`

---

### Task 5: Handle PDF drag-and-drop onto existing nodes

**Files:**
- Modify: `src/components/FlowCanvas.tsx:123-144`

Extend `onDrop` handler:
1. If file is PDF and dropped on an existing node → upload to Supabase → set attachment fields on that node
2. If file is PDF and dropped on canvas (no node) → create a new node with the attachment
3. Use `document.elementFromPoint()` or React Flow's node intersection to detect target node

**Commit:** `feat: handle PDF drag-and-drop onto nodes`

---

### Task 6: Build, deploy, verify

Run typecheck, build, commit all, push, deploy to Vercel.
