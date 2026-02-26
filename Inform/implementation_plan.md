# KB Phase 2 — Implementation Plan

15 enhancements across Content, UX, Admin, and Performance.

---

## New NPM Dependencies

### Frontend (`apps/antigravity`)
| Package | Purpose |
|---------|---------|
| `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-code-block-lowlight` | Rich Text Editor (#7) |
| `lowlight` | Syntax highlighting for code blocks (#8, #13) |
| `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` | Drag-and-drop module reorder (#9) |
| `sharp` (already bundled with Next.js) | Image optimization (#36) |

### Backend (`apps/backend`)
| Package | Purpose |
|---------|---------|
| `sharp` | Server-side image resizing/compression (#36) |
| `nodemailer` | Email notifications (#35) |

---

## Proposed Changes

### 1. Database Schema Changes

#### [MODIFY] [schema.prisma](file:///home/genai/knowledge_base/packages/db/prisma/schema.prisma)

**Module model** — extend `type` to support new values: `TABLE`, `CODE`, `EMBED`; add `metadata Json?` for language, headers, etc.

```diff
 model Module {
   ...
   type       String // TEXT | PDF | VIDEO | URL | IMAGE | TABLE | CODE | EMBED
   content    String?
   file_path  String?
   url        String?
   title      String?
+  metadata   Json?     // e.g. { language: "python" }, { headers: [...] }, { embedUrl: "..." }
   order      Int       @default(0)
   ...
 }
```

**New model: PageVersion** — stores revision snapshots.

```prisma
model PageVersion {
  id         String   @id @default(uuid())
  page_id    String
  version    Int
  snapshot   Json     // full page + modules snapshot
  changed_by String?
  created_at DateTime @default(now())

  page Page @relation(fields: [page_id], references: [id], onDelete: Cascade)
  user User? @relation(fields: [changed_by], references: [id], onDelete: SetNull)
  @@map("page_versions")
}
```

**New model: PageTemplate** — pre-defined layouts.

```prisma
model PageTemplate {
  id          String @id @default(uuid())
  name        String @unique
  description String?
  modules     Json   // array of module skeletons
  created_at  DateTime @default(now())
  @@map("page_templates")
}
```

**New model: ActivityLog** — user activity tracking.

```prisma
model ActivityLog {
  id          String   @id @default(uuid())
  user_id     String
  action      String   // viewed | created | edited | deleted
  entity_type String
  entity_id   String
  created_at  DateTime @default(now())

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  @@map("activity_logs")
}
```

**Page model** — add approval workflow field.

```diff
 model Page {
   ...
-  status        String    @default("draft") // draft | published | archived
+  status        String    @default("draft") // draft | review | published | archived
+  reviewed_by_id String?
+  reviewed_at    DateTime?
   ...
+  reviewed_by User? @relation("PageReviewedBy", ...)
+  versions    PageVersion[]
 }
```

---

### 2. Rich Text Editor (#7)

#### [NEW] `apps/antigravity/src/components/RichTextEditor.tsx`
- TipTap editor component with toolbar (bold, italic, headings, lists, links, images, code blocks)
- Outputs HTML string stored in `module.content`

#### [MODIFY] [page.tsx (admin editor)](file:///home/genai/knowledge_base/apps/antigravity/src/app/admin/pages/%5Bid%5D/page.tsx)
- Replace `<textarea>` with `<RichTextEditor>` when `type === "TEXT"`

---

### 3. Markdown Rendering (#8)

#### [MODIFY] [page.tsx (public view)](file:///home/genai/knowledge_base/apps/antigravity/src/app/pages/%5Bslug%5D/page.tsx)
- For TEXT modules: detect if content is Markdown vs HTML
- Render Markdown with `lowlight` for syntax-highlighted code fences

---

### 4. Drag-and-Drop Module Reorder (#9)

#### [MODIFY] [page.tsx (admin editor)](file:///home/genai/knowledge_base/apps/antigravity/src/app/admin/pages/%5Bid%5D/page.tsx)
- Replace current module list with `@dnd-kit/sortable` wrapper
- On drop, call existing `modulesApi.reorder()` endpoint

---

### 5. Version History (#10)

#### [NEW] `apps/backend/src/versions/` (module: service, controller)
- `POST /api/pages/:id/snapshot` — store current state as a version
- `GET /api/pages/:id/versions` — list all versions
- `POST /api/pages/:id/versions/:versionId/restore` — restore a snapshot
- Auto-snapshot before each page update in `pages.service.ts`

#### [NEW] `apps/antigravity/src/app/admin/pages/[id]/versions/page.tsx`
- UI showing version list with timestamps and diff view

---

### 6. Page Templates (#11)

#### [NEW] `apps/backend/src/templates/` (module: service, controller)
- CRUD for templates
- `GET /api/templates` — list templates
- `POST /api/pages/from-template/:templateId` — create page from template

#### [MODIFY] Admin Pages list — add "Create from Template" button

---

### 7. New Module Types (#12, #13, #14)

#### Table Module (#12)
- `type: "TABLE"`, `metadata: { headers: [...], rows: [[...], ...] }`
- Admin: editable grid for adding/removing rows and columns
- Public view: renders as styled HTML `<table>`

#### Code Snippet Module (#13)
- `type: "CODE"`, `content: "code string"`, `metadata: { language: "python" }`
- Admin: code textarea with language dropdown
- Public view: syntax-highlighted with `lowlight`

#### Embed Module (#14 — iframe only)
- `type: "EMBED"`, `metadata: { embedUrl: "https://..." }`
- Admin: URL input
- Public view: renders as sandboxed `<iframe>`

#### Files modified:
- [MODIFY] Admin page editor — add TABLE, CODE, EMBED to type selector with appropriate form fields
- [MODIFY] Public page view — add rendering for each new type
- [MODIFY] Backend Module DTOs — allow new type values

---

### 8. Breadcrumb Navigation (#20)

#### [MODIFY] [page.tsx (public)](file:///home/genai/knowledge_base/apps/antigravity/src/app/pages/%5Bslug%5D/page.tsx)
- Already has basic breadcrumbs — enhance to show full parent→child→page hierarchy
- Fetch section parent chain from backend

#### [MODIFY] [admin layout](file:///home/genai/knowledge_base/apps/antigravity/src/app/admin/layout.tsx)
- Dynamic breadcrumbs using pathname segments

---

### 9. Approval Workflow (#31)

#### [MODIFY] `pages.service.ts`
- Add `submitForReview(id)` → sets status to `"review"`
- Add `approve(id, reviewerId)` → sets status to `"published"`, records reviewer
- Add `reject(id, reviewerId)` → sets status back to `"draft"`

#### [MODIFY] `pages.controller.ts` — new endpoints:
- `PATCH /api/pages/:id/submit-review`
- `PATCH /api/pages/:id/approve`
- `PATCH /api/pages/:id/reject`

#### [MODIFY] Admin page editor — add "Submit for Review" / "Approve" / "Reject" buttons based on current status

---

### 10. Trash / Soft Delete (#33)

#### [NEW] `apps/antigravity/src/app/admin/trash/page.tsx`
- Lists all pages where `deleted_at IS NOT NULL`
- "Restore" button and "Permanently Delete" button

#### [MODIFY] `pages.service.ts`
- Add `restore(id)` — sets `deleted_at` back to `null`
- Add `permanentDelete(id)` — hard delete from DB

#### [MODIFY] Admin layout sidebar — add "🗑️ Trash" menu item

---

### 11. User Activity Log (#34)

#### [NEW] `apps/backend/src/activity/` (module: service, controller)
- `POST /api/activity` — log an activity
- `GET /api/activity?userId=...` — get user activities
- Middleware/interceptor to auto-log page views, edits, creates

#### [NEW] `apps/antigravity/src/app/admin/activity/page.tsx`
- Filterable table of all user activities

#### [MODIFY] Admin layout sidebar — add "📋 Activity" menu item

---

### 12. Email Notifications (#35)

#### [NEW] `apps/backend/src/notifications/` (module: service)
- Uses `nodemailer` to send emails
- Configurable SMTP via env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- Templates: page approved, page rejected, page updated

#### [MODIFY] Approval workflow endpoints — trigger email on approve/reject

---

### 13. Image Optimization (#36)

#### [MODIFY] `files.controller.ts`
- After IMAGE upload, use `sharp` to auto-resize (max 1920px width) and compress (quality 80)
- Save optimized version alongside original

---

### 14. CDN Integration (#37)

#### [MODIFY] `files.controller.ts`
- Add optional `CDN_BASE_URL` env var
- When set, return CDN-prefixed URLs instead of local paths

#### [MODIFY] Frontend `filesApi.getFileUrl()`
- Prefix with CDN base when configured via `NEXT_PUBLIC_CDN_URL`

---

## Verification Plan

### Build Verification
```bash
cd packages/db && npx prisma db push && npx prisma generate
cd apps/backend && npm run build
cd apps/antigravity && npm run build
```

### Manual Verification
- Rich text editor: create TEXT module, verify toolbar and HTML output
- Drag-and-drop: reorder modules, verify order saved to DB
- New module types: create TABLE, CODE, EMBED modules and verify rendering
- Approval workflow: submit → review → approve/reject cycle
- Trash: delete page, verify it appears in trash, restore it
- Activity log: perform actions, verify logged in admin activity page
- Image upload: upload large image, verify it's compressed
