"use client"

import React, { useEffect, useRef, useState } from 'react'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import { Download, ExternalLink, Loader2, Minus, Plus } from 'lucide-react'
import { Button } from './ui/button'

// Renders PDFs with pdf.js onto canvases instead of the browser's built-in
// viewer (<embed>), which shows blank pages in some Firefox setups.
// Assets in /pdfjs are copied from pdfjs-dist by scripts/copy-pdfjs.mjs.
const ASSETS = '/pdfjs/'
const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2]

interface PdfViewerProps {
    src: string
    title: string
}

export default function PdfViewer({ src, title }: PdfViewerProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [doc, setDoc] = useState<PDFDocumentProxy | null>(null)
    const [error, setError] = useState(false)
    const [width, setWidth] = useState(0)
    const [zoomIdx, setZoomIdx] = useState(2)

    // Load the document
    useEffect(() => {
        let cancelled = false
        let loaded: PDFDocumentProxy | null = null
        ;(async () => {
            try {
                const pdfjs = await import('pdfjs-dist')
                pdfjs.GlobalWorkerOptions.workerSrc = `${ASSETS}pdf.worker.min.mjs`
                loaded = await pdfjs.getDocument({
                    url: src,
                    wasmUrl: `${ASSETS}wasm/`,
                    cMapUrl: `${ASSETS}cmaps/`,
                    cMapPacked: true,
                    standardFontDataUrl: `${ASSETS}standard_fonts/`,
                    iccUrl: `${ASSETS}iccs/`,
                }).promise
                if (cancelled) loaded.destroy()
                else setDoc(loaded)
            } catch (err) {
                console.error('PDF load failed', err)
                if (!cancelled) setError(true)
            }
        })()
        return () => {
            cancelled = true
            loaded?.destroy()
        }
    }, [src])

    // Track available width so pages fit the dialog
    useEffect(() => {
        const el = scrollRef.current
        if (!el) return
        const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)))
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const zoom = ZOOM_STEPS[zoomIdx]
    const pageWidth = Math.max(0, Math.floor((width - 32) * zoom))

    return (
        <div className="rounded-xl border border-card-border overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-card-border bg-muted/40 text-sm">
                <span className="text-muted-foreground">
                    {doc ? `${doc.numPages} page${doc.numPages === 1 ? '' : 's'}` : ''}
                </span>
                <div className="flex items-center gap-1 ml-auto">
                    <Button
                        size="icon" variant="ghost" className="h-8 w-8" aria-label="Zoom out"
                        disabled={zoomIdx === 0}
                        onClick={() => setZoomIdx((z) => Math.max(0, z - 1))}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
                    <Button
                        size="icon" variant="ghost" className="h-8 w-8" aria-label="Zoom in"
                        disabled={zoomIdx === ZOOM_STEPS.length - 1}
                        onClick={() => setZoomIdx((z) => Math.min(ZOOM_STEPS.length - 1, z + 1))}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                    <Button asChild size="icon" variant="ghost" className="h-8 w-8" aria-label="Open in new tab">
                        <a href={src} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                    </Button>
                    <Button asChild size="icon" variant="ghost" className="h-8 w-8" aria-label="Download">
                        <a href={src} download={`${title}.pdf`}><Download className="h-4 w-4" /></a>
                    </Button>
                </div>
            </div>

            <div ref={scrollRef} className="h-[70vh] overflow-auto bg-muted/30 p-4">
                {error && (
                    <p className="text-center text-sm text-muted-foreground py-16">
                        Couldn&apos;t load this PDF. Try opening it in a new tab.
                    </p>
                )}
                {!error && !doc && (
                    <div className="flex justify-center py-16 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                )}
                {doc && pageWidth > 0 && (
                    <div className="flex flex-col items-center gap-4">
                        {Array.from({ length: doc.numPages }, (_, i) => (
                            <PdfPage key={i} doc={doc} pageNumber={i + 1} width={pageWidth} root={scrollRef} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

interface PdfPageProps {
    doc: PDFDocumentProxy
    pageNumber: number
    width: number
    root: React.RefObject<HTMLDivElement | null>
}

// One page: reserves its size up front, renders to canvas only when scrolled near
function PdfPage({ doc, pageNumber, width, root }: PdfPageProps) {
    const wrapRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [aspect, setAspect] = useState(11 / 8.5)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        let cancelled = false
        doc.getPage(pageNumber).then((page) => {
            const vp = page.getViewport({ scale: 1 })
            if (!cancelled) setAspect(vp.height / vp.width)
        })
        return () => { cancelled = true }
    }, [doc, pageNumber])

    useEffect(() => {
        const el = wrapRef.current
        if (!el) return
        const io = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true) },
            { root: root.current, rootMargin: '600px 0px' }
        )
        io.observe(el)
        return () => io.disconnect()
    }, [root])

    useEffect(() => {
        if (!visible || !canvasRef.current) return
        let task: RenderTask | null = null
        let cancelled = false
        doc.getPage(pageNumber).then((page) => {
            if (cancelled || !canvasRef.current) return
            const dpr = window.devicePixelRatio || 1
            const base = page.getViewport({ scale: 1 })
            const viewport = page.getViewport({ scale: (width / base.width) * dpr })
            const canvas = canvasRef.current
            canvas.width = Math.floor(viewport.width)
            canvas.height = Math.floor(viewport.height)
            task = page.render({ canvas, viewport })
            task.promise.catch(() => {})
        })
        return () => {
            cancelled = true
            task?.cancel()
        }
    }, [visible, doc, pageNumber, width])

    return (
        <div
            ref={wrapRef}
            className="bg-white shadow-card shrink-0"
            style={{ width, height: Math.round(width * aspect) }}
        >
            <canvas ref={canvasRef} className="block w-full h-full" aria-label={`Page ${pageNumber}`} />
        </div>
    )
}
