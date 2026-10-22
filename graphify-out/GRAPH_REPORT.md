# Graph Report - KassiesCrochet  (2026-10-22)

## Corpus Check
- Corpus is ~11,632 words - fits in a single context window. You may not need a graph.

## Summary
- 377 nodes · 869 edges · 20 communities (17 shown, 3 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.82)
- Token cost: 103,344 input · 0 output

## Community Hubs (Navigation)
- Pattern Forms & Field Arrays
- Page Shell & Pattern List
- Dev Deps & Label UI
- Pattern Detail View
- Docs: Architecture & Deploy
- Runtime Dependencies
- Modals & Dialogs
- Pattern Types & Schemas
- TypeScript Config
- shadcn Config
- Pattern API Route
- Uploads & Health Routes
- PDF Thumbnail Rendering
- ESLint Config
- Mongoose Pattern Model
- Root Layout & Font
- Mongo Connection Cache
- Unused Boilerplate Icons
- PostCSS Config
- Next/Vercel Logos

## God Nodes (most connected - your core abstractions)
1. `cn()` - 55 edges
2. `react` - 24 edges
3. `Button` - 23 edges
4. `Patterns()` - 21 edges
5. `ModifyPatternForm()` - 19 edges
6. `AddPatternForm()` - 17 edges
7. `AddPdfPatternForm()` - 16 edges
8. `compilerOptions` - 16 edges
9. `ShowPattern()` - 15 edges
10. `Input` - 15 edges

## Surprising Connections (you probably didn't know these)
- `MONGO_URI environment variable` --conceptually_related_to--> `connectMongoPatterns()`  [AMBIGUOUS]
  docker-compose.yml → utils/connectMongo.tsx
- `Patterns()` --shares_data_with--> `patternSlice`  [INFERRED]
  components/Patterns.tsx → CLAUDE.md
- `AddPatternForm()` --references--> `Shared form field-array sub-components (Supplies/Sections/SectionItem/Instructions)`  [INFERRED]
  components/AddPatternForm.tsx → CLAUDE.md
- `ModifyPatternForm()` --references--> `Shared form field-array sub-components (Supplies/Sections/SectionItem/Instructions)`  [INFERRED]
  components/ModifyPatternForm.tsx → CLAUDE.md
- `key-based remount of ShowPattern` --conceptually_related_to--> `Patterns()`  [EXTRACTED]
  CLAUDE.md → components/Patterns.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Push-to-master deployment pipeline** — _github_workflows_deploy, _github_workflows_deploy_build_job, _github_workflows_deploy_deploy_sh, docker_compose, claude_deployment [INFERRED 0.75]
- **PDF pattern feature** — claude_pdf_pattern_type, interfaces_pattern_ispdfpattern, interfaces_zpatterns_pdfformschema, components_addpdfpatternform_addpdfpatternform, components_modifypatternform_modifypdfpatternform, claude_pdf_thumbnail [EXTRACTED 1.00]
- **File upload and serving flow** — claude_post_formdata_keys, claude_api_pattern_route, claude_file_naming_convention, claude_upload_directories, claude_api_uploads_route, docker_compose_uploads_volume [INFERRED 0.85]
- **Default create-next-app public/ boilerplate asset set (all unused)** — public_file_icon, public_globe_icon, public_next_logo, public_vercel_logo, public_window_icon [INFERRED 0.95]

## Communities (20 total, 3 thin omitted)

### Community 0 - "Pattern Forms & Field Arrays"
Cohesion: 0.13
Nodes (45): Shared form field-array sub-components (Supplies/Sections/SectionItem/Instructions), AddPatternForm(), AddPdfPatternForm(), InstructionsFieldArray(), Props, ModifyPatternForm(), ModifyPdfPatternForm(), SectionItem() (+37 more)

### Community 1 - "Page Shell & Pattern List"
Cohesion: 0.08
Nodes (30): Home(), PDF pattern list thumbnail (cover photo or FileIcon), Layout(), LayoutProps, Navbar(), PatternListItem(), Patterns(), ShowToast (+22 more)

### Community 2 - "Dev Deps & Label UI"
Cohesion: 0.05
Nodes (36): Label, labelVariants, devDependencies, eslint, eslint-config-next, @tailwindcss/postcss, @types/node, @types/react (+28 more)

### Community 3 - "Pattern Detail View"
Cohesion: 0.13
Nodes (27): ShowPattern(), AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay (+19 more)

### Community 4 - "Docs: Architecture & Deploy"
Cohesion: 0.08
Nodes (24): Build and Deploy Docker Image workflow, build job (self-hosted runner), deploy.sh KassiesCrochet (host script), CLAUDE.md project guide, /api/pattern (GET/POST/DELETE), /api/uploads/[...filepath] catch-all, Dark mode default-on with pre-hydration script, Deployment via self-hosted runner (+16 more)

### Community 5 - "Runtime Dependencies"
Cohesion: 0.08
Nodes (26): dependencies, class-variance-authority, @hookform/resolvers, lodash, lucide-react, mongoose, @napi-rs/canvas, next (+18 more)

### Community 6 - "Modals & Dialogs"
Cohesion: 0.13
Nodes (16): WhichOpen, add, addPdf, conv, mod, show, Modal(), ModalProps (+8 more)

### Community 7 - "Pattern Types & Schemas"
Cohesion: 0.19
Nodes (13): Props, PatternProp, Props, Checkbox, pattern, isPdfPattern(), pattern, patternForm (+5 more)

### Community 8 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 9 - "shadcn Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 10 - "Pattern API Route"
Cohesion: 0.24
Nodes (10): addPattern(), DELETE(), GET(), imageUploadDir, modifyPattern(), pdfUploadDir, POST(), uploadDir (+2 more)

### Community 11 - "Uploads & Health Routes"
Cohesion: 0.18
Nodes (4): dynamic, MIME, nextConfig, next

### Community 12 - "PDF Thumbnail Rendering"
Cohesion: 0.22
Nodes (3): pdfjs-dist, CanvasFactory, { createCanvas, Path2D, DOMMatrix }

### Community 13 - "ESLint Config"
Cohesion: 0.33
Nodes (4): compat, __dirname, eslintConfig, __filename

### Community 14 - "Mongoose Pattern Model"
Cohesion: 0.33
Nodes (4): instructionSchema, patternSchema, sectionSchema, supplySchema

### Community 16 - "Mongo Connection Cache"
Cohesion: 0.40
Nodes (3): mongoose, globalForMongo, MongoCache

### Community 17 - "Unused Boilerplate Icons"
Cohesion: 0.67
Nodes (3): File/Document Icon (16x16 page with folded corner and text lines; unused create-next-app boilerplate), Globe Icon (16x16 world/web globe with meridians; unused create-next-app boilerplate), Browser Window Icon (16x16 window with three title-bar dots; unused create-next-app boilerplate)

## Ambiguous Edges - Review These
- `connectMongoPatterns()` → `MONGO_URI environment variable`  [AMBIGUOUS]
  docker-compose.yml · relation: conceptually_related_to
- `healthcheck /api/health on port 5000` → `/api/pattern (GET/POST/DELETE)`  [AMBIGUOUS]
  docker-compose.yml · relation: conceptually_related_to
- `Geist font via next/font` → `Visual style shared with homeauto dashboard and KassiesRecipies`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **28 isolated node(s):** `conv`, `show`, `mod`, `add`, `addPdf` (+23 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 165 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Uploads & Health Routes` to `Pattern Forms & Field Arrays`, `Page Shell & Pattern List`, `Dev Deps & Label UI`, `Pattern Detail View`, `Pattern API Route`, `Root Layout & Font`?**
  _High betweenness centrality (0.131) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `Patterns()` (e.g. with `PDF pattern list thumbnail (cover photo or FileIcon)` and `getAddPatternIsOpen()`) actually correct?**
  _`Patterns()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `conv`, `show`, `mod` to the rest of the system?**
  _28 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Pattern Forms & Field Arrays` be split into smaller, more focused modules?**
  _Cohesion score 0.12655367231638417 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `Runtime Dependencies` to `Dev Deps & Label UI`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `connectMongoPatterns()` and `MONGO_URI environment variable`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `healthcheck /api/health on port 5000` and `/api/pattern (GET/POST/DELETE)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._