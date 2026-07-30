import type { Note } from "@/lib/content/schemas";

// D-008: typed, Zod-validated external-link array — the single MVP source
// for Notes. Empty until Hakan selects and confirms the three articles
// (CONTENT_INVENTORY.md: "REQUIRES ARTICLE SELECTION"). An empty array
// keeps app/notes/page.tsx on its honest pending-copy path (D-009).
export const notes: Note[] = [];
