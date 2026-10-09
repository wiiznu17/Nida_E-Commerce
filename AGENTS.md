# Nida Project — Developer & Agent Guidelines

Guidelines and standards for all AI agents and developers working on the **Nida Project** codebase. For detailed runbooks and procedural standards, see [.agents/skills/nida-standards/SKILL.md](file:///.agents/skills/nida-standards/SKILL.md).

---

## 1. Component Architecture & Organization
- **Domain-Based Folders**: Place components in domain folders (e.g. `apps/admin/src/components/product/`, `layout/`, `media/`, `common/`, `ui/`).
- **Sub-Component Hierarchy**: Complex components (forms, dashboards) must have sub-components separated into sub-folders (e.g. `components/product/form/`).
- **File Size & Decomposition**: Keep component files focused and concise (< 250 lines). Extract large sections into distinct files.
- **Separate Types & Constants**: Place enums, select options, and constants in `*Constants.ts` and interfaces in `*Types.ts`.
- **Barrel Exports**: Every directory must have an `index.ts` re-exporting its contents. The root `components/index.ts` exports all modules.
- **Immediate Cleanup**: When moving or replacing components, **delete the old files immediately**. Never leave dead duplicate code.

---

## 2. Internationalization (i18n) & Localization
- **100% JSON-Driven**: All user-facing text must be stored in locale JSON files:
  - `apps/admin/src/locales/th.json`
  - `apps/admin/src/locales/en.json`
- **Zero Hardcoding**: Never write hardcoded Thai or English UI strings inside TSX/JSX components.
- **Symmetric Keys**: When adding or updating a key in `th.json`, add the exact same key to `en.json`.
- **Dot-Notation Namespacing**: Use organized paths like `common.*`, `nav.*`, `btn.*`, `product.*`, `preview.*`, `status.*`.
- **Lean Context**: Never hardcode translation dictionary objects inside `LanguageContext.tsx`.

---

## 3. UI/UX Standards & Anti-"AI Slop" Guidelines
- **Zero Emojis in UI**: Never use emojis (🟢, 🟡, 📦, ⚡, 🔒, 🚀, ✨, etc.) in UI labels, badges, buttons, headers, or locale translation strings (`th.json`, `en.json`).
  - Use professional Lucide SVG icons (`lucide-react`) or subtle CSS dot indicators (e.g. `w-1.5 h-1.5 rounded-full bg-emerald-500`) instead.
- **Strictly No "AI Slop" Decorations**:
  - Avoid AI aesthetic clichés: no gratuitous rainbow gradients, no excessive glowing/neon drop-shadows, no cheesy sparkles/magic icons, and no emoji-stuffed cards.
  - Follow authentic **Editorial Luxury Aesthetics**:
    - Refined, grounded palette: Crisp white, warm creams (`#FAF7F2`, `#EAE3D9`), deep espresso (`#2B1810`), and muted stone/zinc grays.
    - Intentional typography: Uppercase tracked micro-labels (`tracking-wider text-[10px] font-black uppercase`), crisp font weights.
    - Purposeful micro-interactions, subtle borders, and clean status pills with high information density.
- **Action Deduplication**: Do not duplicate action buttons (e.g., avoid having Save Draft / Publish in both Top Bar and Bottom Card). Keep actions unified in a single, clear Action Bar.
- **Action Safeguards**:
  - Always use confirmation modals for critical actions (`PublishConfirmModal.tsx`).
  - Use unsaved changes prompts (`UnsavedChangesModal`) to safeguard form input.
- **Decoupled Stock**: Do not allow free-form inventory mutations directly on product creation forms. Route stock updates through Inventory Control.
- **SKU & Variant Integrity (ห้ามลบ SKU และล็อคสี/ไซส์เดิมในโหมดแก้ไข)**:
  - **Zero Manual SKU Deletion**: Do not provide individual delete buttons on SKU table rows. SKUs are systematically derived from the Color x Size matrix to ensure inventory and order history consistency.
  - **Edit Mode Variant Locking**: In edit mode (`isEdit`), original colors and sizes that already exist in the database are strictly locked against deletion or toggling off. Admins may add new colors/sizes, but cannot destroy existing variant keys.
- **Horizontal Balance & Void Elimination (ความพอดีกันในแนวนอน / ห้ามมีช่องว่าง)**:
  - Form layouts, detail panels, and dashboards must be strictly balanced horizontally with **zero awkward gaps or dead empty space**.
  - **Use `admin/products/new` (`ProductForm.tsx`) as the golden reference**:
    - **Complementary 12-Column Grids**: Pair columns to sum exactly to 12 (e.g. `8 cols + 4 cols`, `7 cols + 5 cols`, or full `12 cols`). Never leave asymmetrical orphaned columns.
    - **Height & Vertical Alignment**: When stacking cards side-by-side, wrap columns with `flex flex-col space-y-5` and use `flex-1 flex flex-col justify-between` on child cards so row heights match and align cleanly.
    - **Internal Input Density**: Group related inputs into compact sub-grids (`grid grid-cols-2` or `grid-cols-3` like Price + Compare Price, or Dept + Category + SubCategory); never leave solitary narrow inputs floating in an expansive horizontal void.
- **Component Reusability (เน้นการใช้ Reusable Component)**:
  - Always reuse existing design system primitives and domain components (`components/common/`, `components/ui/`, `components/product/`) instead of duplicating ad-hoc inline JSX and custom Tailwind chunks.
  - Examples: `StatusBadge`, `UnsavedChangesModal`, shared button primitives, modal shells. Extract recurring UI patterns into clean, reusable components early.
- **Badge Discipline & No Gratuitous Badges (ลดการใส่ Badge พร่ำเพรื่อ)**:
  - **Zero Meta-Badges on Headers**: Do NOT stick redundant badges on card/section headers (e.g. `Predefined Enums`, `Locked`, `System`). Controls and field labels already convey this context.
  - **Zero Duplicate Status Badges**: Do NOT render decorative status badges right next to/above form switches that already reflect that exact state (e.g. no "Published" badge right above a Published/Draft switcher).
  - **High Signal-to-Noise**: Reserve badges exclusively for essential entity runtime states in tables (e.g. Delivered, Low Stock, Out of Stock). Eliminate frivolous badges that create visual noise (e.g. no "Unsaved edits" badges, no redundant status chips). Form protection should be handled cleanly by modal prompts (`UnsavedChangesModal`) upon navigation, not persistent flashy badges.
- **No Developer Internal Enum Keys in UI (ห้ามแสดง Enum Code บนหน้า UI)**:
  - Never display raw code/TypeScript enum names (e.g. `MarketingTagKey.NEW_ARRIVAL`, `ProductSubCategory.SWEATERS_AND_KNITS`, `MarketingTagKey.NONE`) in UI cards, labels, or badges.
  - End-users and admin staff must only see clean, human-friendly localized titles (e.g. "New Arrival", "Sweaters & Knits"). Keep internal enum symbols strictly inside code and API payloads.
- **Table Column Proportions & Sizing (กำหนดขนาดคอลัมน์ตารางให้สมส่วนกับข้อมูล)**:
  - Always size table columns according to their expected data length to prevent disproportionately wide or cramped columns.
  - Never allow compact data columns (e.g. `Size` chips like S/M/L, action buttons, small numeric inputs) to float unconstrained in wide flexible space.
  - Explicitly assign fixed/compact widths to short data (e.g. `w-20 text-center` for Size, `w-12 text-center` for action icons, `w-28 text-center` for numeric thresholds), give adequate comfortable width to multi-part indicators (e.g. `w-64 whitespace-nowrap` for Stock badges and hints), while giving unconstrained/flexible width to naturally long content (such as SKU Code or Product Title).
- **Eliminate Unnecessary Sub-Descriptions & Filler Captions (ตัดคำอธิบายที่ไม่จำเป็นออก ห้ามมีข้อความรก)**:
  - Do NOT add redundant subtitles or filler captions under card or section headers when the header title already makes the purpose clear (e.g., avoid captions like "Manage master cover photos and individual color-specific images" or "Define SKU codes, colors, sizes, and price adjustments").
  - Keep headers minimal, clean, and high-density. Reserve explanatory text only for non-obvious business logic or critical safety hints.

---

## 4. Central Types & Shared Models (`@repo/types`)
- **Single Source of Truth**: All shared domain entities, API contracts, DTOs, status enums, and taxonomy definitions must live in `packages/types/` (package `@repo/types`).
- **Zero Duplicate Interfaces**: Never declare duplicate types or interfaces for entities (e.g. `Product`, `Sku`, `OrderStatus`, `Department`) inside `apps/admin`, `apps/store`, or backend APIs.
- **Package-Level Imports**: Always import via package specifier:
  ```ts
  import { ApiProduct, Department, Category, ApiResponse } from '@repo/types';
  ```
  Never use relative cross-package paths (e.g. `../../../../packages/types/...`).
- **Local vs Central Separation**:
  - Central (`@repo/types`): Domain entities, database contracts, universal enums, API request/response types.
  - Local (`*Types.ts`): Component-specific UI state, modal visibility, form helper flags. Local form types must map to or extend types from `@repo/types`.
- **Barrel Export & Build**: When adding or updating types in `packages/types/src/`, always re-export through `packages/types/src/index.ts` and run:
  ```bash
  npm --prefix packages/types run build
  ```

---

## 5. Verification & Build
- Always test TypeScript compilation before completing any task:
  ```bash
  npm --prefix packages/types run build
  npm --prefix apps/admin run build
  ```
- Ensure 0 errors, no broken barrel exports, and no unused variables/imports.
