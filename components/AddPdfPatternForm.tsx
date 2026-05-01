"use client"
import React, { useState } from 'react'
import { pattern } from '@/interfaces'
import { addPattern } from '@/redux/features/patternSlice'
import { setAddPdfPatternIsOpen } from '@/redux/features/patternListSlice'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/redux/store'
import { pdfFormSchema } from '@/interfaces/zPatterns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, FileIcon, ImageIcon } from 'lucide-react'
import { PatternTag } from '@/interfaces'
import TagCheckboxGroup from './TagCheckboxGroup'

export default function AddPdfPatternForm() {
    const dispatch = useDispatch<AppDispatch>()
    const [error, setError] = useState(0)
    const [pdfFile, setPdfFile] = useState<File | null>(null)
    const [pdfError, setPdfError] = useState(false)
    const [finalImageFile, setFinalImageFile] = useState<File | null>(null)
    const [tags, setTags] = useState<PatternTag[]>([])
    const [tagError, setTagError] = useState(false)

    const form = useForm<z.infer<typeof pdfFormSchema>>({
        resolver: zodResolver(pdfFormSchema),
        defaultValues: { name: '', tags: [] },
    })

    const onSubmit = async (values: z.infer<typeof pdfFormSchema>) => {
        if (!pdfFile) {
            setPdfError(true)
            return
        }
        setPdfError(false)
        if (tags.length === 0) {
            setTagError(true)
            return
        }
        setTagError(false)

        const patternObj: pattern = {
            _id: '',
            name: values.name,
            supplies: [],
            sections: [],
            pdfFile: '',
            tags,
        }

        const formData = new FormData()
        formData.append('action', 'add')
        formData.append('pdfFile', pdfFile)
        if (finalImageFile) formData.append('finalImage', finalImageFile)
        formData.append('pattern', JSON.stringify(patternObj))

        const res = await fetch('/api/pattern', { method: 'POST', body: formData })
        if (res.status === 201) {
            const data = await res.json()
            dispatch(addPattern(data.data))
            dispatch(setAddPdfPatternIsOpen(false))
            form.reset()
            setPdfFile(null)
            setFinalImageFile(null)
            setTags([])
            setTagError(false)
        } else {
            setError((e) => {
                const next = e + 1
                if (next >= 3) setTimeout(() => dispatch(setAddPdfPatternIsOpen(false)), 1000)
                return next
            })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pattern Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Granny Square Blanket" {...field} />
                            </FormControl>
                            {form.formState.errors.name && (
                                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                            )}
                        </FormItem>
                    )}
                />

                <div>
                    <p className="text-sm font-medium mb-1.5">PDF File</p>
                    <label className="flex items-center gap-2 cursor-pointer w-fit">
                        <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => {
                                setPdfFile(e.target.files?.[0] ?? null)
                                setPdfError(false)
                            }}
                        />
                        <Button type="button" size="sm" variant="outline" asChild>
                            <span>
                                <FileIcon className="h-3.5 w-3.5 mr-1" />
                                {pdfFile ? pdfFile.name : 'Choose PDF'}
                            </span>
                        </Button>
                    </label>
                    {pdfError && (
                        <p className="text-xs text-destructive mt-1">Please choose a PDF file</p>
                    )}
                </div>

                <TagCheckboxGroup
                    value={tags}
                    onChange={(next) => { setTags(next); setTagError(false); form.setValue('tags', next as any) }}
                    error={tagError ? 'Select at least one tag' : undefined}
                />

                <div>
                    <p className="text-sm font-medium mb-1.5">Cover Photo <span className="text-muted-foreground font-normal">(optional)</span></p>
                    <label className="flex items-center gap-2 cursor-pointer w-fit">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => setFinalImageFile(e.target.files?.[0] ?? null)}
                        />
                        <Button type="button" size="sm" variant="outline" asChild>
                            <span>
                                <ImageIcon className="h-3.5 w-3.5 mr-1" />
                                {finalImageFile ? finalImageFile.name : 'Choose photo'}
                            </span>
                        </Button>
                    </label>
                </div>

                {error > 0 && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {error < 3 ? 'An error occurred on the server.' : 'Too many errors, closing…'}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="ghost" onClick={() => dispatch(setAddPdfPatternIsOpen(false))}>
                        Cancel
                    </Button>
                    <Button type="submit">Save PDF Pattern</Button>
                </div>
            </form>
        </Form>
    )
}
