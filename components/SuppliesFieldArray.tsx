"use client"
import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormControl, FormItem } from '@/components/ui/form'
import { Plus, Minus } from 'lucide-react'

interface Props {
    form: UseFormReturn<any>
    fields: { id: string }[]
}

export default function SuppliesFieldArray({ form, fields }: Props) {
    const addSupply = () => {
        const current = form.getValues('supplies') || []
        form.setValue('supplies', [...current, { name: '' }])
    }

    const removeSupply = (index: number) => {
        const current = form.getValues('supplies')
        form.setValue('supplies', current.filter((_: any, i: number) => i !== index))
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Supplies</h3>
                <Button type="button" size="sm" variant="outline" onClick={addSupply}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
            </div>
            <div className="space-y-2">
                {fields.map((field, i) => (
                    <div key={field.id} className="flex items-center gap-2">
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeSupply(i)}
                        >
                            <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <FormItem className="flex-1 mb-0">
                            <FormControl>
                                <Input
                                    placeholder={`Supply ${i + 1}`}
                                    {...form.register(`supplies.${i}.name` as const, {
                                        onChange: (e) => form.setValue(`supplies.${i}.name`, e.target.value.toLowerCase())
                                    })}
                                />
                            </FormControl>
                            {(form.formState.errors.supplies as any)?.[i]?.name && (
                                <p className="mt-1 text-xs text-destructive">
                                    {(form.formState.errors.supplies as any)[i].name?.message}
                                </p>
                            )}
                        </FormItem>
                    </div>
                ))}
            </div>
            {fields.length >= 3 && (
                <Button type="button" variant="outline" size="sm" onClick={addSupply} className="w-full mt-2">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Supply
                </Button>
            )}
        </div>
    )
}
