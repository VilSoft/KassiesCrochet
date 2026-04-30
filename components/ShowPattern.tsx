"use client"
import { pattern, isPdfPattern } from '@/interfaces'
import React, { useState } from 'react'
import Image from 'next/image'
import { PencilLine, Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import ModifyPatternForm from './ModifyPatternForm'
import { deletePattern } from '@/redux/features/patternSlice'
import { setIsPatternOpen } from '@/redux/features/patternListSlice'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/redux/store'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface PatternProp {
    pattern: pattern
}

export default function ShowPattern({ pattern }: PatternProp) {
    const dispatch = useDispatch<AppDispatch>()
    const [modMode, setModMode] = useState(false)
    const [patternHere, setPattern] = useState<pattern>(pattern)
    const [deleteOpen, setDeleteOpen] = useState(false)

    const handleDelete = async () => {
        const imageFiles = isPdfPattern(patternHere)
            ? (patternHere.pdfFile ? [patternHere.pdfFile] : [])
            : [
                ...(patternHere.image ? [patternHere.image] : []),
                ...(patternHere.sections ?? []).flatMap((s) => s.instructions.flatMap((i) => i.images ?? [])),
              ]
        const res = await fetch('/api/pattern', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: patternHere._id, imageFiles }),
        })
        if (res.ok) {
            dispatch(deletePattern(patternHere._id))
            dispatch(setIsPatternOpen(false))
        }
    }

    if (modMode) {
        return (
            <ModifyPatternForm
                pattern={patternHere}
                setModMode={setModMode}
                setPattern={setPattern}
            />
        )
    }

    if (isPdfPattern(patternHere)) {
        return (
            <div className="py-2">
                <div className="flex justify-end gap-2 mb-4">
                    <Button variant="outline" size="sm" onClick={() => setModMode(true)}>
                        <PencilLine className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                    </Button>
                </div>
                <embed
                    src={`/api/uploads/${patternHere.pdfFile}`}
                    type="application/pdf"
                    className="w-full rounded-xl border border-border"
                    style={{ height: '70vh' }}
                />
                <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{patternHere.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This permanently removes the pattern and its PDF. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        )
    }

    return (
        <div className="py-2">
            {/* Final photo */}
            {patternHere.image && (
                <div className="w-full mb-5 rounded-xl overflow-hidden bg-muted">
                    <Image
                        width={0}
                        height={0}
                        sizes="100vw"
                        src={`/api/uploads/${patternHere.image}`}
                        alt={patternHere.name}
                        className="w-full h-auto object-cover"
                    />
                </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-2 mb-5">
                <Button variant="outline" size="sm" onClick={() => setModMode(true)}>
                    <PencilLine className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                </Button>
            </div>

            {/* Supplies */}
            <section className="mb-5">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Supplies</h2>
                <ul className="space-y-1">
                    {patternHere.supplies.map((s) => (
                        <li key={s.name} className="text-sm flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 shrink-0" />
                            {s.name}
                        </li>
                    ))}
                </ul>
            </section>

            {/* Sections + Instructions */}
            <section>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Instructions</h2>
                <div className="space-y-5">
                    {(patternHere.sections ?? []).map((sec, s) => (
                        <div key={s} className="rounded-xl border border-border bg-card p-4">
                            <h3 className="text-sm font-semibold mb-3">{sec.title}</h3>
                            <ol className="space-y-4">
                                {sec.instructions.map((instr, j) => (
                                    <li key={j} className="flex gap-3">
                                        <span className="text-sm font-semibold text-muted-foreground shrink-0 w-5">{j + 1}.</span>
                                        <div className="flex-1">
                                            <p className="text-sm leading-relaxed">{instr.value}</p>
                                            {instr.images && instr.images.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {instr.images.map((img, k) => (
                                                        <Image
                                                            key={k}
                                                            width={0}
                                                            height={0}
                                                            sizes="(max-width: 640px) 40vw, 160px"
                                                            src={`/api/uploads/${img}`}
                                                            alt={`Step ${j + 1} image ${k + 1}`}
                                                            className="w-32 h-32 rounded-lg object-cover"
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    ))}
                </div>
            </section>

            {/* Delete confirmation */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{patternHere.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This permanently removes the pattern and all its images. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
