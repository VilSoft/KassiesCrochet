import path from 'path';
import { pathToFileURL } from 'url';
import { createRequire } from 'module';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Load via the same createRequire mechanism pdfjs-dist's NodeCanvasFactory
// uses internally, so Path2D/DOMMatrix instances are recognized by the
// canvases (including transparency-group scratch canvases) it creates.
const { createCanvas, Path2D, DOMMatrix } = createRequire(import.meta.url)('@napi-rs/canvas');

(globalThis as any).Path2D = Path2D;
(globalThis as any).DOMMatrix = DOMMatrix;

pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(
    path.join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')
).href;

const wasmUrl = path.join(process.cwd(), 'node_modules/pdfjs-dist/wasm') + '/';

// pdfjs's built-in NodeCanvasFactory does its own require("@napi-rs/canvas"),
// which can resolve to a different module instance than the one above -
// causing Path2D/DOMMatrix identity checks (used for transparency groups)
// to fail. Supplying our own factory keeps every canvas on the same instance.
class CanvasFactory {
    create(width: number, height: number) {
        if (width <= 0 || height <= 0) throw new Error('Invalid canvas size');
        const canvas = createCanvas(width, height);
        return { canvas, context: canvas.getContext('2d') };
    }
    reset(canvasAndContext: any, width: number, height: number) {
        canvasAndContext.canvas.width = width;
        canvasAndContext.canvas.height = height;
    }
    destroy(canvasAndContext: any) {
        canvasAndContext.canvas.width = 0;
        canvasAndContext.canvas.height = 0;
        canvasAndContext.canvas = null;
        canvasAndContext.context = null;
    }
}

export async function renderPdfFirstPageToBuffer(pdfBuffer: Buffer): Promise<Buffer | null> {
    try {
        const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(pdfBuffer), wasmUrl, CanvasFactory }).promise;
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
