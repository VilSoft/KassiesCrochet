"use client"
import React, { useState } from 'react'
import { pattern, isPdfPattern } from '@/interfaces'
import { modifyPattern } from '@/redux/features/patternSlice'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/redux/store'
import { formSchema, pdfFormSchema } from '@/interfaces/zPatterns'
import { useForm, useFieldArray, FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, ImageIcon, FileIcon } from 'lucide-react'
import Image from 'next/image'
import SuppliesFieldArray from './SuppliesFieldArray'
import SectionsFieldArray from './SectionsFieldArray'

interface Props {
    setModMode: React.Dispatch<React.SetStateAction<boolean>>
    setPattern: React.Dispatch<React.SetStateAction<pattern>>
    pattern: pattern
}

function ModifyPdfPatternForm({ setModMode, pattern, setPattern }: Props) {
    const dispatch = useDispatch<AppDispatch>()
    const [error, setError] = useState(0)
    const [newPdfFile, setNewPdfFile] = useState<File | null>(null)
    const [finalImageFile, setFinalImageFile] = useState<File | null>(null)

    const form = useForm<z.infer<typeof pdfFormSchema>>({
        resolver: zodResolver(pdfFormSchema),
        defaultValues: { name: pattern.name },
    })

    const onSubmit = async (values: z.infer<typeof pdfFormSchema>) => {
        const modPatternObj: pattern = {
            ...pattern,
            name: values.name,
        }

        const formData = new FormData()
        formData.append('action', 'modify')
        if (newPdfFile) {
            formData.append('pdfFile', newPdfFile)
            if (pattern.pdfFile) formData.append('oldPdfFile', pattern.pdfFile)
        }
        if (finalImageFile) {
            formData.append('finalImage', finalImageFile)
            if (pattern.image) formData.append('oldFinalImage', pattern.image)
        }
        formData.append('pattern', JSON.stringify(modPatternObj))

        const res = await fetch('/api/pattern', { method: 'POST', body: formData })
        if (res.status === 201) {
            const data = await res.json()
            dispatch(modifyPattern(data.data))
            setPattern(data.data)
            setModMode(false)
        } else {
            setError((e) => {
                const next = e + 1
                if (next >= 3) setTimeout(() => setModMode(false), 1000)
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
                                <Input {...field} />
                            </FormControl>
                            {form.formState.errors.name && (
                                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                            )}
                        </FormItem>
                    )}
                />

                <div>
                    <p className="text-sm font-medium mb-1.5">PDF File</p>
                    {pattern.pdfFile && !newPdfFile && (
                        <p className="text-xs text-muted-foreground mb-2">
                            Current: {pattern.pdfFile.replace('pdf/', '')}
                        </p>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer w-fit">
                        <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => setNewPdfFile(e.target.files?.[0] ?? null)}
                        />
                        <Button type="button" size="sm" variant="outline" asChild>
                            <span>
                                <FileIcon className="h-3.5 w-3.5 mr-1" />
                                {newPdfFile ? newPdfFile.name : 'Replace PDF'}
                            </span>
                        </Button>
                    </label>
                </div>

                <div>
                    <p className="text-sm font-medium mb-1.5">Cover Photo <span className="text-muted-foreground font-normal">(optional)</span></p>
                    {pattern.image && !finalImageFile && (
                        <div className="mb-2">
                            <Image
                                width={80}
                                height={80}
                                src={`/api/uploads/${pattern.image}`}
                                alt="Current cover photo"
                                className="rounded-md object-cover h-20 w-20"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Current photo</p>
                        </div>
                    )}
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
                                {finalImageFile ? finalImageFile.name : pattern.image ? 'Replace photo' : 'Choose photo'}
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
                    <Button type="button" variant="ghost" onClick={() => setModMode(false)}>
                        Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </Form>
    )
}

export default function ModifyPatternForm({ setModMode, pattern, setPattern }: Props) {
    if (isPdfPattern(pattern)) {
        return <ModifyPdfPatternForm setModMode={setModMode} pattern={pattern} setPattern={setPattern} />
    }
    const dispatch = useDispatch<AppDispatch>()
    const [error, setError] = useState(0)
    const [finalImageFile, setFinalImageFile] = useState<File | null>(null)
    // key: "sectionIdx_instrIdx" → new files to upload
    const [instrFiles, setInstrFiles] = useState<Map<string, File[]>>(new Map())
    // filenames the user has explicitly removed from existing instruction images
    const [removedInstrImages, setRemovedInstrImages] = useState<string[]>([])

    // Build initial existing-images map from the pattern, keyed "sectionIdx_instrIdx"
    const [existingInstrImages, setExistingInstrImages] = useState<Map<string, string[]>>(() => {
        const map = new Map<string, string[]>()
        ;(pattern.sections ?? []).forEach((sec, s) => {
            sec.instructions.forEach((instr, n) => {
                if (instr.images && instr.images.length > 0) {
                    map.set(`${s}_${n}`, [...instr.images])
                }
            })
        })
        return map
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: pattern.name,
            supplies: pattern.supplies.map((s) => ({ name: s.name })),
            sections: (pattern.sections ?? []).map((sec) => ({
                title: sec.title,
                instructions: sec.instructions.map((instr) => ({
                    value: typeof instr === 'string' ? instr : instr.value,
                    images: [],
                })),
            })),
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

    const handleRemoveExistingImage = (sectionIdx: number, instrIdx: number, filename: string) => {
        setRemovedInstrImages((prev) => [...prev, filename])
        const key = `${sectionIdx}_${instrIdx}`
        setExistingInstrImages((prev) => {
            const next = new Map(prev)
            const imgs = (next.get(key) ?? []).filter((f) => f !== filename)
            if (imgs.length > 0) next.set(key, imgs)
            else next.delete(key)
            return next
        })
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const sections = values.sections.map((sec, s) => ({
            title: sec.title,
            instructions: sec.instructions.map((instr, n) => ({
                value: instr.value,
                // carry surviving existing images; new ones are added by the API
                images: existingInstrImages.get(`${s}_${n}`) ?? [],
            })),
        }))

        const modPatternObj: pattern = {
            _id: pattern._id,
            name: values.name,
            supplies: values.supplies,
            sections,
            image: pattern.image,
        }

        const formData = new FormData()
        formData.append('action', 'modify')
        if (finalImageFile) {
            formData.append('finalImage', finalImageFile)
            if (pattern.image) formData.append('oldFinalImage', pattern.image)
        }

        instrFiles.forEach((files, key) => {
            const [s, n] = key.split('_').map(Number)
            files.forEach((file, m) => {
                formData.append(`instrImage_${s}_${n}_${m}`, file)
            })
        })

        formData.append('oldInstrImages', JSON.stringify(removedInstrImages))
        formData.append('pattern', JSON.stringify(modPatternObj))

        const res = await fetch('/api/pattern', { method: 'POST', body: formData })
        if (res.status === 201) {
            const data = await res.json()
            dispatch(modifyPattern(data.data))
            setPattern(data.data)
            setModMode(false)
        } else {
            setError((e) => {
                const next = e + 1
                if (next >= 3) setTimeout(() => setModMode(false), 1000)
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
                                <Input {...field} />
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
                    {pattern.image && !finalImageFile && (
                        <div className="mb-2">
                            <Image
                                width={80}
                                height={80}
                                src={`/api/uploads/${pattern.image}`}
                                alt="Current final photo"
                                className="rounded-md object-cover h-20 w-20"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Current photo</p>
                        </div>
                    )}
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
                                {finalImageFile ? finalImageFile.name : pattern.image ? 'Replace photo' : 'Choose photo'}
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
                    existingImages={existingInstrImages}
                    onRemoveExistingImage={handleRemoveExistingImage}
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
                    <Button type="button" variant="ghost" onClick={() => setModMode(false)}>
                        Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </Form>
    )
}
