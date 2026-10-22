# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Start production server
```

`predev`/`prebuild` run `scripts/copy-pdfjs.mjs`, copying the pdf.js worker, wasm decoders (JPEG2000/JBIG2 images need them), cmaps, fonts and ICC profiles from `pdfjs-dist` into `public/pdfjs/` (gitignored). The client `PdfViewer` loads them from `/pdfjs/`.

No test suite is configured.

## Architecture

**Next.js 16 / React 19** app for managing crochet patterns. App Router, TypeScript, Tailwind CSS v4, shadcn/ui, Redux Toolkit, react-hook-form + Zod, Mongoose.

### Data model

```
pattern
  _id, name
  image?: string              filename stored as "images/foo.jpg" (new) or bare "foo.jpg" (legacy)
  pdfFile?: string            filename stored as "pdf/foo.pdf"; presence indicates PDF pattern type
  supplies: supply[]          { name }
  sections: section[]         { title, instructions: instruction[] }
  instruction                 { value, images?: string[] }
```

`isPdfPattern(p)` — type guard in `interfaces/pattern.ts`; returns `!!p.pdfFile`. PDF patterns have empty `supplies` and `sections`.

All types live in `interfaces/`. Zod schemas in `interfaces/zPatterns.ts` are the source of truth for form validation: `formSchema` (regular patterns), `pdfFormSchema` (PDF patterns — name only).

### Database

MongoDB via Mongoose. Connection string hardcoded in `utils/connectMongo.tsx` as `mongodb://localhost:27017/patterns`. `connectMongoPatterns()` caches one connection promise on `globalThis` — routes just `await` it and must **never** call `connection.close()` (breaks concurrent requests). The `utils/.env.local` file exists but is **not** used by the connect function.

**Mongoose model caching gotcha**: `models/patternModel.tsx` deletes the cached `mongoose.models.Pattern` in development before re-registering. This is intentional — Mongoose caches compiled models across hot reloads, and with `strict: true` it silently drops fields not in the cached schema. Without this, schema changes are invisible until a full process restart.

### API routes (`app/api/`)

- `GET /api/pattern` — fetch all patterns
- `POST /api/pattern` — add or modify; `action` field is `"add"` or `"modify"`
- `DELETE /api/pattern` — delete by id; also removes files from disk
- `GET /api/uploads/[...filepath]` — catch-all; serves files from `uploads/` at project root. Handles legacy bare filenames (`foo.jpg` → `uploads/foo.jpg`), new image paths (`images/foo.jpg` → `uploads/images/foo.jpg`), and PDF paths (`pdf/foo.pdf` → `uploads/pdf/foo.pdf`). Path-traversal guarded.

**Upload directories:**
- `uploads/images/` — cover photos and instruction images (new uploads)
- `uploads/pdf/` — PDF pattern files
- `uploads/` — legacy image location (old records; still served correctly via catch-all)

**POST FormData keys:**
- `finalImage` — cover photo (File, optional)
- `instrImage_S_N_M` — image M for section S, instruction N (File)
- `pdfFile` — PDF file for PDF patterns (File)
- `oldFinalImage` — filename to delete on replace (modify only)
- `oldInstrImages` — JSON array of instruction image filenames to delete (modify only)
- `oldPdfFile` — PDF filename to delete on replace (modify only)

File naming on disk: `{sanitizedName}-final-{timestamp}.{ext}`, `{sanitizedName}-s{S}instr{N}-{M}-{timestamp}.{ext}`, `{sanitizedName}-{timestamp}.pdf`

### Redux (`redux/`)

Two slices:
- `patternSlice` — `patterns: pattern[]`; actions: `setPatterns`, `addPattern`, `modifyPattern`, `deletePattern`
- `patternListSlice` — UI state: `searchParam`, `addPatternIsOpen`, `patternIsOpen`, `addPdfPatternIsOpen`

`ReduxProvider` and `ToastProvider` wrap the app in `app/page.tsx`. Use `const toast = useToast()` from `components/Toast.tsx`; `toast(msg)` for success, `toast(msg, 'error')` for failures.

### Component tree

```
Patterns          — fetches on mount, renders list + owns all modals
  Modal           — Radix Dialog wrapper; closes via Redux dispatch based on WhichOpen enum
                    WhichOpen: conv, show, add, addPdf, mod
                    show modal uses sm:max-w-4xl (wide, for PDF embed)
  ShowPattern     — read view; edit toggle renders ModifyPatternForm inline
                    if isPdfPattern: renders PdfViewer + Edit/Delete only (no image, no supplies/sections)
  PdfViewer       — pdf.js (pdfjs-dist) renders pages to canvases, lazily via IntersectionObserver;
                    zoom, open-in-tab, download. Replaces <embed>, which showed blank pages in Firefox.
  AddPatternForm  — add regular pattern form
  AddPdfPatternForm — add PDF pattern form (name + PDF file + optional cover photo)
  ModifyPatternForm — edit form; if isPdfPattern delegates to ModifyPdfPatternForm (name + replace PDF + replace photo)

Shared form sub-components:
  SuppliesFieldArray      — supplies add/remove rows
  SectionsFieldArray      — sections add/remove; renders SectionItem per section
    SectionItem           — own component (calls useFieldArray for its instructions)
      InstructionsFieldArray — steps within one section; per-step image upload
```

**Key pattern**: `ShowPattern` receives a `pattern` prop but stores it in `useState`. `Patterns.tsx` passes `key={openPattern._id}` to force a full remount when a different pattern is selected (Radix Dialog keeps children alive between opens, so without the key, `useState` would hold stale data).

**PDF pattern list thumbnail**: PDF patterns with a cover photo (`p.image`) show it as a thumbnail. Without a cover photo, a `FileIcon` placeholder renders instead.

### Styling

Tailwind CSS v4 with `@theme inline` in `app/globals.css`. Semantic color variables (`--background`, `--foreground`, etc.) are defined in `:root` / `.dark`, then mapped to Tailwind's `--color-*` namespace via `@theme inline`. Without this mapping, utilities like `bg-background` resolve to transparent.

Visual style mirrors the sibling `homeauto` dashboard: same HSL tokens (indigo primary, dark surfaces), Inter font (`--font-inter`), drifting radial-gradient blobs in `components/Layout.tsx`. Custom utilities in `globals.css`: `glass-nav`, `animate-blob-drift-{1,2,3}`. Shared-look classes copied from KassiesRecipies (keep values in sync): `card-clean` (= recipes `.recipe-card-clean` base), `card-hover` (lift + primary glow; add for clickable cards), `section-label`, `brand-title` (gradient wordmark). `tailwindcss-animate` is loaded via `@plugin`. Dialogs are solid `bg-card` and use fade+zoom only — the `slide-in-from-*` classes double up with Tailwind v4's `translate` property and make dialogs fly in from the corner.

Dark mode: **default on**. Inline script in `app/layout.tsx` adds `dark` to `<html>` pre-hydration unless `localStorage.theme === 'light'`. `Navbar.tsx` toggle flips the class and persists the choice.

CSS Modules in `styles/` are largely unused after the Tailwind migration; prefer Tailwind utility classes for new work.

### Deployment

Pushes to `master` trigger `.github/workflows/deploy.yml` on a self-hosted runner, which calls `deploy.sh KassiesCrochet` on the host machine.
