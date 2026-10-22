// Copies pdf.js browser assets (worker, wasm decoders, fonts, cmaps) into
// public/pdfjs so the client-side PdfViewer can load them. Runs on predev /
// prebuild, so the copy always matches the installed pdfjs-dist version.
import { cpSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const pdfjsRoot = dirname(require.resolve('pdfjs-dist/package.json'))
const dest = join(process.cwd(), 'public', 'pdfjs')

rmSync(dest, { recursive: true, force: true })
mkdirSync(dest, { recursive: true })
cpSync(join(pdfjsRoot, 'build', 'pdf.worker.min.mjs'), join(dest, 'pdf.worker.min.mjs'))
for (const dir of ['wasm', 'cmaps', 'standard_fonts', 'iccs']) {
    cpSync(join(pdfjsRoot, dir), join(dest, dir), { recursive: true })
}
console.log('pdfjs assets copied to public/pdfjs')
