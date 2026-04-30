"use client"
import React from 'react'
import { UseFormReturn, useFieldArray } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2 } from 'lucide-react'
import InstructionsFieldArray from './InstructionsFieldArray'

interface SectionItemProps {
    form: UseFormReturn<any>
    sectionIdx: number
    onRemoveSection: (idx: number) => void
    onNewFiles: (sectionIdx: number, instrIdx: number, files: File[]) => void
    existingImages?: Map<string, string[]>
    onRemoveExistingImage?: (sectionIdx: number, instrIdx: number, filename: string) => void
}

function SectionItem({
    form,
    sectionIdx,
    onRemoveSection,
    onNewFiles,
    existingImages,
    onRemoveExistingImage,
}: SectionItemProps) {
    const fieldPrefix = `sections.${sectionIdx}.instructions`
    const { fields: instrFields } = useFieldArray({
        control: form.control,
        name: fieldPrefix as any,
    })

    return (
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            {/* Section header */}
            <div className="flex items-center gap-2">
                <Input
                    {...form.register(`sections.${sectionIdx}.title` as const)}
                    placeholder="Section title (e.g. Head, Body, Arms…)"
                    className="flex-1 font-medium"
                />
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemoveSection(sectionIdx)}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </div>
            {(form.formState.errors as any)?.sections?.[sectionIdx]?.title && (
                <p className="text-xs text-destructive -mt-2">
                    {(form.formState.errors as any).sections[sectionIdx].title?.message}
                </p>
            )}

            {/* Instructions within this section */}
            <InstructionsFieldArray
                form={form}
                fields={instrFields}
                fieldPrefix={fieldPrefix}
                sectionIdx={sectionIdx}
                onNewFiles={onNewFiles}
                existingImages={existingImages}
                onRemoveExistingImage={onRemoveExistingImage}
            />
        </div>
    )
}

interface SectionsFieldArrayProps {
    form: UseFormReturn<any>
    sectionFields: { id: string }[]
    onNewFiles: (sectionIdx: number, instrIdx: number, files: File[]) => void
    existingImages?: Map<string, string[]>
    onRemoveExistingImage?: (sectionIdx: number, instrIdx: number, filename: string) => void
}

export default function SectionsFieldArray({
    form,
    sectionFields,
    onNewFiles,
    existingImages,
    onRemoveExistingImage,
}: SectionsFieldArrayProps) {
    const addSection = () => {
        const current = form.getValues('sections') || []
        form.setValue('sections', [
            ...current,
            { title: '', instructions: [{ value: '', images: [] }] },
        ])
    }

    const removeSection = (idx: number) => {
        const current = form.getValues('sections')
        form.setValue('sections', current.filter((_: any, i: number) => i !== idx))
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Sections</h3>
                <Button type="button" size="sm" variant="outline" onClick={addSection}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add section
                </Button>
            </div>

            <div className="space-y-4">
                {sectionFields.map((field, idx) => (
                    <SectionItem
                        key={field.id}
                        form={form}
                        sectionIdx={idx}
                        onRemoveSection={removeSection}
                        onNewFiles={onNewFiles}
                        existingImages={existingImages}
                        onRemoveExistingImage={onRemoveExistingImage}
                    />
                ))}
            </div>

            {sectionFields.length >= 2 && (
                <Button type="button" variant="outline" size="sm" onClick={addSection} className="w-full mt-3">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add another section
                </Button>
            )}
        </div>
    )
}
