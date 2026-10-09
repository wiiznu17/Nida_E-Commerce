---
name: nida-standards
description: >-
  Standard development workflows, component structuring, i18n localization rules, and UX guidelines for Nida Project.
  Use when creating, refactoring, or reviewing components, pages, forms, translations, and UI features in Nida Project.
---

# Nida Project — Engineering & UI/UX Standards

This skill document defines the development standards, architectural patterns, and quality guidelines for **Nida Project** (E-Commerce Platform & Back-Office). All AI agents and developers working on this codebase must strictly adhere to these principles to maintain clean, modular, and production-grade code.

---

## 1. Component Architecture & Directory Structure

### 1.1 Domain-Driven Organization
Components must be grouped cleanly by domain or feature under `components/<domain>/`. Never dump unrelated components into a flat `components/` folder.

```text
apps/admin/src/components/
├── index.ts                     # Master barrel export
├── common/                      # Reusable global UI (Header, Sidebar, Modals)
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── index.ts
├── layout/                      # Layout wrappers & shell
│   └── index.ts
├── media/                       # Media uploaders, croppers, gallery widgets
│   ├── ImageUploadModal.tsx
│   ├── MediaDropzone.tsx
│   └── index.ts
├── product/                     # Product domain
│   ├── ProductForm.tsx          # Main orchestrator component
│   ├── ProductPreviewModal.tsx
│   ├── PublishConfirmModal.tsx
│   ├── QuickRestockModal.tsx
│   ├── form/                    # Sub-components specific to ProductForm
│   │   ├── formConstants.ts     # Options, presets, enums
│   │   ├── formTypes.ts         # Form state interfaces & prop types
│   │   ├── FormTopBar.tsx       # Unified sticky action bar
│   │   ├── FormBasicInfoSection.tsx
│   │   ├── FormStatusOverviewCard.tsx
│   │   ├── FormMediaSection.tsx
│   │   ├── FormPricingSection.tsx
│   │   ├── FormTaxonomySection.tsx
│   │   ├── FormMaterialsCareSection.tsx
│   │   ├── FormMarketingTagSection.tsx
│   │   ├── FormVariantsSection.tsx
│   │   └── index.ts
│   └── index.ts
└── ui/                          # Primitive atom components (buttons, badges, inputs)
    └── index.ts
```

### 1.2 Sub-Component Rules (No "God Components")
- **Single Responsibility Principle**: Any component file approaching 250+ lines must be evaluated for decomposition.
- **Section Extraction**: Break complex forms and views into dedicated section components inside a sub-folder (e.g. `product/form/`).
- **Separate Types & Constants**: Do not clutter component files with large arrays of enum options, presets, or long interfaces. Move them to `formConstants.ts` and `formTypes.ts`.

### 1.3 Barrel Exports (`index.ts`)
- Every folder and sub-folder must contain an `index.ts` file that re-exports all public components, types, and constants.
- The root `components/index.ts` must re-export all domain folders.
- Imports across the app should use the clean barrel path:
  ```tsx
  // ✅ GOOD
  import { ProductForm, PublishConfirmModal } from '@/components';
  // or
  import { FormBasicInfoSection } from '@/components/product/form';

  // ❌ BAD (Deep, fragile paths)
  import { ProductForm } from '../../components/product/ProductForm';
  ```

### 1.4 Immediate Cleanup (Zero Dead Code)
- When refactoring, splitting, or relocating components, **immediately delete the old or duplicate files**.
- Never leave obsolete `.tsx` or `.ts` files in the repository.
- Ensure all imports across the codebase are updated to the new structure.

---

## 2. Internationalization (i18n) & Localization

### 2.1 100% JSON-Driven Translations
- **Zero Hardcoded Strings**: All UI labels, placeholders, tooltips, validation messages, and modal texts must come from translation files.
- Translations are stored in JSON files:
  - `apps/admin/src/locales/th.json` (Thai)
  - `apps/admin/src/locales/en.json` (English)
- Fetch translations using `useLanguage()` and `t()`:
  ```tsx
  const { t } = useLanguage();
  <label>{t('product.nameEn')}</label>
  ```

### 2.2 Strict Language Symmetry
- When adding, updating, or deleting a key in `th.json`, **you must update `en.json` in the exact same structure simultaneously**.
- Missing keys in either file are not acceptable.

### 2.3 Hierarchical Dot-Notation
Group translation keys logically by category/feature:
```json
{
  "common": { "save": "...", "cancel": "...", "delete": "..." },
  "nav": { "dashboard": "...", "products": "..." },
  "btn": { "save": "...", "confirm": "..." },
  "product": { "createTitle": "...", "pricingDiscounts": "..." },
  "preview": { "title": "..." },
  "publishModal": { "title": "..." },
  "quickRestock": { "title": "..." },
  "unsaved": { "title": "...", "description": "..." },
  "status": { "active": "...", "draft": "..." }
}
```

### 2.4 Clean LanguageContext
- `LanguageContext.tsx` must remain lightweight and purely functional (~80-90 lines).
- **Never embed hardcoded dictionary objects (`legacyTranslations`) in `LanguageContext.tsx`**.
- The fallback chain inside `t(key, fallback)` must resolve:
  1. Active language JSON (`locales[language]`)
  2. English fallback JSON (`locales.en`)
  3. `fallback` string argument or raw `key`

---

## 3. UI/UX Design & Form Conventions

### 3.1 Button & Action Deduplication
- **Eliminate Duplicate Action Buttons**: Do not render the same action button (e.g. "Save", "Save Draft", "Publish") in multiple competing places on the same screen.
- Maintain a single, prominent **Action Bar** (e.g. sticky top bar `FormTopBar.tsx`) that houses:
  - Navigation back button with unsaved change detection
  - Publication / Status indicator
  - Secondary action (e.g. Preview button, Save Draft)
  - Primary action (e.g. Publish / Save Changes)

### 3.2 Confirmation & Safeguard Modals
- **Destructive or High-Impact Actions**:
  - Always provide a confirmation modal before publishing live or deleting items (`PublishConfirmModal.tsx`).
  - Show a clear summary/checklist of changes or consequences in the modal.
- **Unsaved Changes Protection**:
  - When a user attempts to leave a dirty form, prompt with an `UnsavedChangesModal` with options to "Discard & Leave" or "Keep Editing".

### 3.3 Decoupled Inventory Management
- Product creation forms must focus on product specifications, taxonomy, media, and SKU definitions.
- **Do not mix direct live stock adjustments into general product editing forms**.
- Stock intake and inventory level adjustments must be handled through dedicated flows:
  - `QuickRestockModal.tsx` on the products list table
  - Dedicated Back-Office Inventory Management screen

### 3.4 SKU & Variant Integrity (ห้ามลบ SKU และล็อคสี/ไซส์เดิมในโหมดแก้ไข)
- **Zero Manual SKU Deletion**:
  - Do NOT provide row-level delete buttons in SKU tables.
  - SKU variants are strictly generated from the Color $\times$ Size matrix. Manual row deletion creates orphaned warehouse stock and breaks historical order lines.
- **Edit Mode Variant Locking**:
  - In edit mode (`isEdit`), original colors and sizes that already exist in the database are strictly locked (`<Lock size={10} />`) against deletion or unselecting.
  - Admins can add **new** colors or **new** sizes to existing products, but cannot delete historical ones. Newly added variants may be removed before saving.
- **Color Selection Management**:
  - In product creation forms, display clear selected color pills (`Selected Colors / สีที่เลือกไว้`) with `×` remove buttons so admins have complete visibility and control over chosen colors.

### 3.4 Strictly Zero Emojis in UI
- **Zero Emojis Policy**: Never use emojis (e.g. 🟢, 🟡, 🔴, 📦, ⚡, 🔒, 🚀, ✨, 💡, ✕, ⚠️) in UI components, button labels, badges, headers, alerts, or locale translation files (`th.json`, `en.json`).
- **Icons & Visual Indicators**:
  - Use high-quality SVG icons from `lucide-react` (e.g., `<Zap size={14} />`, `<Lock size={12} />`, `<Check size={14} />`).
  - Use subtle CSS status dot indicators instead of circle emojis:
    ```tsx
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      <span>{t('product.published')}</span>
    </span>
    ```

### 3.5 Anti-"AI Slop" Design Guidelines & Editorial Luxury
- **Eliminate AI Clichés ("AI Slop")**:
  - No gaudy rainbow/multitone gradients or unnecessary glowing drop shadows.
  - No cheesy sparkles, magic wands, or decorative filler that feels like generic AI demo templates.
  - No emoji-dense bullet lists inside cards or forms.
- **Editorial Modern Luxury Aesthetics (Nida Brand)**:
  - **Color Palette**: Sophisticated, grounded neutrals: crisp white, warm cream (`#FAF7F2`), subtle sand border (`#EAE3D9`), dark espresso (`#2B1810`), and slate/zinc accents.
  - **Typography**: Editorial hierarchy with tracked micro-labels (`tracking-wider text-[10px] font-black uppercase`), clean font weights, and high readability.
  - **Information Density**: Clean, purposeful card layouts, compact data rows, subtle borders, and delicate shadows (`shadow-xs` / `shadow-2xs`).
### 3.6 Horizontal Grid Balance & Void Elimination (Layout Symmetry)
Form layouts, detail views, and dashboard panels must strive for **horizontal completeness with zero awkward dead space or voids**.

**Golden Standard Reference**: `apps/admin/src/components/product/ProductForm.tsx` (`/admin/products/new`).

- **Complementary 12-Column Grid Sums**:
  Always design multi-column rows so their column spans sum cleanly to 12:
  - **8 : 4 Pairing**:
    - `lg:col-span-8`: Deep content & primary inputs (e.g. `FormBasicInfoSection`)
    - `lg:col-span-4`: Contextual summary, preview trigger, and status card (`FormStatusOverviewCard`)
  - **7 : 5 Pairing**:
    - `lg:col-span-7`: Financial & specification controls (`FormPricingSection` + `FormMaterialsCareSection`)
    - `lg:col-span-5`: Classification & metadata controls (`FormTaxonomySection` + `FormMarketingTagSection`)
  - **Full-Width (12 Cols)**: Reserved for high-density tables or visual showcases (e.g. `FormMediaSection`, `FormVariantsSection`).
- **Vertical Stretch & Height Alignment**:
  - When placing multiple stacked cards side-by-side, wrap each column with `flex flex-col space-y-5`.
  - Use `flex-1 flex flex-col justify-between` on child cards (see `FormMarketingTagSection.tsx`) so bottom cards automatically stretch to match the exact height of their taller neighbors, eliminating gaping voids at the bottom of the section.
- **Internal Sub-Grids (No Lone Floating Inputs)**:
  - Do not allow short, single inputs to float awkwardly across wide horizontal containers.
  - Group paired fields using internal grids:
    - 2-Column: Price + Compare Price with inline discount pill.
    - 3-Column: Department + Category + Sub-Category cascading dropdowns.
    - Responsive Grid Chips: Color presets and size presets aligned in clean grids.

### 3.7 Component Reusability First
- **Avoid One-Off Inline Duplication**:
  - Always search and reuse existing components from `components/common/`, `components/ui/`, `components/layout/`, and domain folders before writing new markup.
  - Examples of reusable components:
    - `StatusBadge` (universal status pill for orders, inventory, catalog)
    - `UnsavedChangesModal` (standard navigation guard)
    - Reusable button primitives (`components/ui/button.tsx`)
    - Modal frames and confirmation dialogs
  - When noticing the same card pattern, table header, or form group repeated across multiple views, extract it into a reusable sub-component immediately.

### 3.8 Badge Discipline & Elimination of Gratuitous UI Badges
- **Zero Meta-Badges on Headers**:
  - Do NOT stick redundant badges on card or section headers (e.g. `Predefined Enums`, `Locked`, `System`). Inputs, labels, and helper descriptions already communicate this information cleanly.
- **Zero Duplicate Status Badges**:
  - Never display a decorative status badge (e.g., "Published") right next to or above form controls that already toggle or display that exact status.
- **High Signal-to-Noise Ratio**:
  - Reserve badges exclusively for real-time, high-priority runtime statuses in tables (e.g., order lifecycle: `DELIVERED`, `PENDING`; inventory: `LOW_STOCK`, `OUT_OF_STOCK`).
  - Do NOT display persistent flashy "Unsaved edits" badges in action bars — protect forms via modal prompts (`UnsavedChangesModal`) upon exit instead.
  - Indiscriminate use of badges causes visual fatigue and badge blindness, cheapening the luxury feel of the application.

### 3.9 No Developer Internal Enum Keys in UI
- **Hide Internal Code Constants from End-Users & Admins**:
  - Never render raw TypeScript enum names, keys, or code symbols in the user interface (e.g. `MarketingTagKey.NEW_ARRIVAL`, `ProductSubCategory.SWEATERS_AND_KNITS`, `MarketingTagKey.NONE`, `OrderStatus.DELIVERED`).
  - The UI must exclusively display polished, localized, human-readable labels (e.g., "New Arrival" / "สินค้ามาใหม่", "Sweaters & Knits" / "สเวตเตอร์และเสื้อไหมพรม").
  - Internal keys exist solely for data consistency, database schemas, and API contracts—not for visual display.

### 3.10 Table Column Width Proportions & Content-Aware Sizing
- **Match Column Widths to Expected Content Length**:
  - Never allow browsers to automatically distribute table widths without proportional constraints on short data.
  - Short data columns (e.g. `Size` chips like `S`/`M`/`L`, small quantities, status badges, action icon buttons) must be constrained with explicit widths and center alignment:
    - Size Chip: `w-20 text-center` (or `w-24`)
    - Numeric Alert / Adjust Inputs: `w-28 text-center`
    - Action Icons (Delete / Edit): `w-12 text-center`
    - Stock Quantity & Status Badges (with multi-part hints): `w-60` to `w-64 whitespace-nowrap` (to cleanly fit `[0 units] Out (Restock after)` without wrapping)
  - Long data columns (e.g. `SKU Code`, `Product Title`, `Description`, `Customer Name`) should receive dominant, flexible width (`min-w-[180px]` or unconstrained width) so user input is never clipped while eliminating cavernous empty space next to short chips.

### 3.11 Elimination of Unnecessary Sub-Descriptions & Filler Captions
- **Do Not Add Redundant Captions**:
  - Never add obvious, generic sub-descriptions under section/card headers (e.g. avoid *"Manage master cover photos and individual color-specific images"* under "Product Media & Color Swatches", or *"Define SKU codes, colors, sizes, and price adjustments"* under "Product Variants & SKUs").
  - The section title, icons, and child form inputs already explain their own purpose. Extra explanatory text adds visual clutter and feels like boilerplate.
  - Reserve sub-descriptions and help text strictly for non-obvious business constraints, system safeguards (e.g. Decoupled Stock notice), or technical image requirements.

---

## 4. Central Types & Shared Models (`@repo/types`)

### 4.1 Single Source of Truth
- All shared entities, API request/response contracts, data transfer objects (DTOs), status enums, taxonomy enums, and domain models must reside in `packages/types/` (published internally as `@repo/types`).
- **Never redefine duplicate interfaces** in individual applications (e.g. `apps/admin` or `apps/storefront`).
- Examples of centralized entities:
  - Catalog: `ApiProduct`, `ApiSku`, `ProductStatus`, `SkuStatus`
  - Taxonomy: `Department`, `Category`, `SubCategory`, `DEPARTMENT_CONFIG`, `TaxonomyTree`
  - Orders: `Order`, `OrderItem`, `OrderStatus`, `PaymentStatus`
  - Inventory: `InventoryLog`, `InventoryMovementType`, `InventoryIntakeReason`
  - API: `ApiResponse<T>`, `PaginatedResponse<T>`

### 4.2 Clean Monorepo Import Convention
- Always import from `@repo/types`:
  ```tsx
  // ✅ GOOD
  import { ApiProduct, Department, Category, ProductStatus } from '@repo/types';

  // ❌ BAD: Fragile relative path across packages
  import { ApiProduct } from '../../../../packages/types/src/catalog.types';
  ```

### 4.3 Separation Between Central Types and Local UI Types
- **Central (`@repo/types`)**: Defines the data model contracts between frontend, backend API, and database.
- **Local (`*Types.ts`)**: Defines component-specific states, form validation tracking, active tabs, and modal props.
- Local types should compose or extend central types:
  ```tsx
  import type { ApiProduct, Department } from '@repo/types';

  export interface ProductFormState {
    nameEn: string;
    nameTh: string;
    department: Department | '';
    regularPrice: number;
    // UI-only helper states
    isSubmitting: boolean;
    activeTab: 'details' | 'media' | 'variants';
  }
  ```

### 4.4 Barrel Export & Build Cycle
- When adding or changing types in `packages/types/src/`:
  1. Export them in `packages/types/src/index.ts`.
  2. Compile the package to update the `./dist` artifacts:
     ```bash
     npm --prefix packages/types run build
     ```

---

## 5. Code Quality & Verification Workflow

### 5.1 Strict TypeScript & Linting
- Explicitly type all component props and form states.
- Avoid using `any` unless absolutely necessary for dynamic third-party helpers.
- Clean up unused imports, dead variables, and console logs before completing work.

### 5.2 Mandatory Verification Step
Before completing any task or reporting back to the user:
1. **Run Typecheck & Build**:
   ```bash
   npm --prefix packages/types run build
   npm --prefix apps/admin run build
   ```
2. Verify that:
   - There are 0 TypeScript compilation errors (`tsc -b`).
   - The Vite/Next bundle compiles cleanly without missing module warnings.
   - Any deleted files have no lingering import references.

---

## 6. Development Checklist

When implementing any feature or refactoring:
- [ ] Are components placed in domain-specific folders?
- [ ] Is complex logic split into sub-components under a dedicated sub-folder?
- [ ] Are types and constants separated into `formTypes.ts` / `formConstants.ts`?
- [ ] Are domain entities and shared enums imported from `@repo/types` instead of re-declared?
- [ ] If `@repo/types` was modified, was `npm --prefix packages/types run build` executed?
- [ ] Are all exports channeled through `index.ts` barrel files?
- [ ] Are old or obsolete files deleted?
- [ ] Are all UI texts extracted to both `th.json` and `en.json`?
- [ ] Is `LanguageContext.tsx` clean without hardcoded dictionaries?
- [ ] Are all UI texts free from emojis (in both JSX and locale JSONs)?
- [ ] Are visual indicators using SVG/Lucide icons or subtle CSS dots rather than emojis or AI-slop decorations?
- [ ] Is the layout balanced horizontally with complementary 12-column pairing and zero dead voids (following `admin/products/new`)?
- [ ] Are existing shared components (`StatusBadge`, `UnsavedChangesModal`, buttons) reused instead of writing duplicate inline UI?
- [ ] Are gratuitous badges eliminated (no meta-badges on headers, no duplicate "Published" tags above switches)?
- [ ] Are developer internal enum keys (e.g. `MarketingTagKey.*`, `ProductSubCategory.*`) hidden from UI presentation?
- [ ] Are table column widths sized proportionally to content length (e.g. compact widths for Size, Actions, and Numbers; flexible for titles and codes)?
- [ ] Are action buttons clean, unified, and non-redundant?
- [ ] Did you run `npm --prefix apps/admin run build` and pass with 0 errors?
