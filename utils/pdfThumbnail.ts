import path from 'path';
import { pathToFileURL } from 'url';
import { createCanvas, Path2D, DOMMatrix } from '@napi-rs/canvas';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

(globalThis as any).Path2D = Path2D;
(globalThis as any).DOMMatrix = DOMMatrix;

pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(
    path.join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')
).href;

const wasmUrl = path.join(process.cwd(), 'node_modules/pdfjs-dist/wasm') + path.sep;

export async function renderPdfFirstPageToBuffer(pdfBuffer: Buffer): Promise<Buffer | null> {
    try {
        const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(pdfBuffer), wasmUrl }).promise;
        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: 1.0 });
        const canvas = createCanvas(viewport.width, viewport.height);
        const ctx = canvas.getContext('2d');
        await page.render({ canvas: canvas as any, canvasContext: ctx as any, viewport }).promise;
        return canvas.toBuffer('image/jpeg', 80);
    } catch (err) {
        console.error('Failed to render PDF cover image:', err);
        return null;
    }
}
