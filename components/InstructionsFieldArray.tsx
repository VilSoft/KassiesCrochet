"use client"
import React, { useRef } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { FormControl, FormItem } from '@/components/ui/form'
import { Plus, Minus, X, ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface Props {
    form: UseFormReturn<any>
    fields: { id: string }[]
    /** dot-path to this section's instructions array, e.g. "sections.0.instructions" */
    fieldPrefix: string
    sectionIdx: number
    onNewFiles: (sectionIdx: number, instrIdx: number, files: File[]) => void
    /** key: "sectionIdx_instrIdx" */
    existingImages?: Map<string, string[]>
    onRemoveExistingImage?: (sectionIdx: number, instrIdx: number, filename: string) => void
}

export default function InstructionsFieldArray({
    form,
    fields,
    fieldPrefix,
    sectionIdx,
    onNewFiles,
    existingImages,
    onRemoveExistingImage,
}: Props) {
    const fileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map())

    const addInstruction = () => {
        const current = form.getValues(fieldPrefix) || []
        form.setValue(fieldPrefix, [...current, { value: '', images: [] }])
        setTimeout(() => {
            document.querySelectorAll('textarea').forEach((ta) => {
                ta.style.height = 'auto'
                ta.style.height = `${ta.scrollHeight}px`
            })
        })
    }

    const removeInstruction = (index: number) => {
        const current = form.getValues(fieldPrefix)
        form.setValue(fieldPrefix, current.filter((_: any, i: number) => i !== index))
    }

    const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
        const ta = e.currentTarget
        ta.style.height = 'auto'
        ta.style.height = `${ta.scrollHeight}px`
    }

    const handleFileChange = (instrIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? [])
        if (files.length > 0) onNewFiles(sectionIdx, instrIdx, files)
        e.target.value = ''
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Steps</span>
                <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={addInstruction}>
                    <Plus className="h-3 w-3 mr-1" /> Add step
                </Button>
            </div>
            <div className="space-y-3">
                {fields.map((field, i) => {
                    const imgKey = `${sectionIdx}_${i}`
                    return (
                        <div key={field.id} className="rounded-lg border border-border/60 bg-background p-3 space-y-2">
                            <div className="flex items-start gap-2">
                                <span className="text-xs font-semibold text-muted-foreground mt-2.5 w-5 shrink-0">{i + 1}</span>
                                <FormItem className="flex-1 mb-0">
                                    <FormControl>
                                        <textarea
                                            {...form.register(`${fieldPrefix}.${i}.value` as const)}
                                            className="block w-full resize-none overflow-hidden rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                            rows={1}
                                            placeholder={`Step ${i + 1}`}
                                            onInput={handleTextareaInput}
                                            value={form.watch(`${fieldPrefix}.${i}.value`)}
                                        />
                                    </FormControl>
                                    {(form.formState.errors as any)?.[fieldPrefix]?.[i]?.value && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {(form.formState.errors as any)[fieldPrefix][i].value?.message}
                                        </p>
                                    )}
                                </FormItem>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive mt-0.5"
                                    onClick={() => removeInstruction(i)}
                                >
                                    <Minus className="h-3.5 w-3.5" />
                                </Button>
                            </div>

                            {/* Existing images (modify mode) */}
                            {existingImages?.get(imgKey) && existingImages.get(imgKey)!.length > 0 && (
                                <div className="flex flex-wrap gap-2 pl-7">
                                    {existingImages.get(imgKey)!.map((img) => (
                                        <div key={img} className="relative group">
                                            <Image
                                                width={80}
                                                height={80}
                                                src={`/api/uploads/${img}`}
                                                alt=""
                                                className="rounded-md object-cover h-20 w-20"
                                            />
                                            {onRemoveExistingImage && (
                                                <button
                                                    type="button"
                                                    onClick={() => onRemoveExistingImage(sectionIdx, i, img)}
                                                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add step photos */}
                            <div className="pl-7">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    ref={(el) => { if (el) fileInputRefs.current.set(i, el) }}
                                    onChange={(e) => handleFileChange(i, e)}
                                />
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-xs text-muted-foreground"
                                    onClick={() => fileInputRefs.current.get(i)?.click()}
                                >
                                    <ImageIcon className="h-3.5 w-3.5 mr-1" /> Add photos
                                </Button>
                            </div>
                        </div>
                    )
                })}
            </div>
            {fields.length >= 3 && (
                <Button type="button" variant="ghost" size="sm" onClick={addInstruction} className="w-full mt-2 text-xs">
                    <Plus className="h-3 w-3 mr-1" /> Add step
                </Button>
            )}
        </div>
    )
}
