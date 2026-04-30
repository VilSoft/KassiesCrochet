"use client"
import React, { useState } from 'react'
import { pattern } from '@/interfaces'
import { addPattern } from '@/redux/features/patternSlice'
import { setAddPatternIsOpen } from '@/redux/features/patternListSlice'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/redux/store'
import { formSchema } from '@/interfaces/zPatterns'
import { useForm, useFieldArray, FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, ImageIcon } from 'lucide-react'
import SuppliesFieldArray from './SuppliesFieldArray'
import SectionsFieldArray from './SectionsFieldArray'

export default function AddPatternForm() {
    const dispatch = useDispatch<AppDispatch>()
    const [error, setError] = useState(0)
    const [finalImageFile, setFinalImageFile] = useState<File | null>(null)
    // key: "sectionIdx_instrIdx" → new files to upload
    const [instrFiles, setInstrFiles] = useState<Map<string, File[]>>(new Map())

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            supplies: [{ name: '' }],
            sections: [{ title: '', instructions: [{ value: '', images: [] }] }],
        },
    })

    const { fields: supplyFields } = useFieldArray({ control: form.control, name: 'supplies' })
    const { fields: sectionFields } = useFieldArray({ control: form.control, name: 'sections' })

    const handleNewInstrFiles = (sectionIdx: number, instrIdx: number, files: File[]) => {
        const key = `${sectionIdx}_${instrIdx}`
        setInstrFiles((prev) => {
            const next = new Map(prev)
            next.set(key, [...(next.get(key) ?? []), ...files])
            return next
        })
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const patternObj: pattern = {
            _id: '',
            name: values.name,
            supplies: values.supplies,
            sections: values.sections.map((sec) => ({
                title: sec.title,
                instructions: sec.instructions.map((i) => ({ value: i.value, images: [] })),
            })),
            image: '',
        }

        const formData = new FormData()
        formData.append('action', 'add')
        if (finalImageFile) formData.append('finalImage', finalImageFile)

        // Append per-instruction images with key instrImage_S_N_M
        instrFiles.forEach((files, key) => {
            const [s, n] = key.split('_').map(Number)
            files.forEach((file, m) => {
                formData.append(`instrImage_${s}_${n}_${m}`, file)
            })
        })

        formData.append('pattern', JSON.stringify(patternObj))

        const res = await fetch('/api/pattern', { method: 'POST', body: formData })
        if (res.status === 201) {
            const data = await res.json()
            dispatch(addPattern(data.data))
            dispatch(setAddPatternIsOpen(false))
            form.reset()
        } else {
            setError((e) => {
                const next = e + 1
                if (next >= 3) setTimeout(() => dispatch(setAddPatternIsOpen(false)), 1000)
                return next
            })
        }
    }

    const onError = (errors: FieldErrors<z.infer<typeof formSchema>>) => {
        console.log('Validation errors:', errors)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6 pt-2">
                {/* Pattern name */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pattern Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Chunky Beanie" {...field} />
                            </FormControl>
                            {form.formState.errors.name && (
                                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                            )}
                        </FormItem>
                    )}
                />

                {/* Final photo */}
                <div>
                    <p className="text-sm font-medium mb-1.5">Final Photo</p>
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
                    {finalImageFile && (
                        <p className="text-xs text-muted-foreground mt-1">{finalImageFile.name}</p>
                    )}
                </div>

                {/* Supplies */}
                <SuppliesFieldArray form={form} fields={supplyFields} />

                {/* Sections */}
                <SectionsFieldArray
                    form={form}
                    sectionFields={sectionFields}
                    onNewFiles={handleNewInstrFiles}
                />

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
                    <Button type="button" variant="ghost" onClick={() => dispatch(setAddPatternIsOpen(false))}>
                        Cancel
                    </Button>
                    <Button type="submit">Save Pattern</Button>
                </div>
            </form>
        </Form>
    )
}
