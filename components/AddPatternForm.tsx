"use client"
import React, { useState } from 'react'
import { supply, pattern, patternForm } from '@/interfaces'
import style from '@/styles/PatternForm.module.css'
import { addPattern } from '@/redux/features/patternSlice'
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { formSchema, instructions } from '@/interfaces/zPatterns'
import { useForm, FieldErrors, useFieldArray } from 'react-hook-form'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"  
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import { z } from "zod"
import { zodResolver } from '@hookform/resolvers/zod'
import { setAddPatternIsOpen } from '@/redux/features/patternListSlice'
import * as _ from 'lodash'

const errMsgs: string[] = ["An error has occured on the server", "Too many errors occuring, try again later"]

function AddPatternForm() {
    const dispatch = useDispatch<AppDispatch>();
    const [error, setError] = useState<number>(0);
    const [forceRefresh, setForceRefresh] = useState<boolean>(false);
    const [images, setImages] = useState<File[] | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            supplies: [{ name: "" }],
            instructions: [{ value: "" }],
            image: []
        }
    })
    const control = form.control;

    // Set up watchers
    const { fields: supplyFields } = useFieldArray({
        control,
        name: "supplies"
    });
    const { fields: instructionFields } = useFieldArray({
        control,
        name: "instructions"
    });

    // Array controls
    const addSupply = () => {
        const currentSupplies = form.getValues("supplies") || [];
        const newSupply = { name: "" }
        form.setValue("supplies", [...currentSupplies, newSupply])
    }
    const removeSupply = (index: number) => {
        const currentSupplies = form.getValues("supplies");
        const updatedSupplies = currentSupplies.filter((_, i) => i !== index);
        form.setValue("supplies", updatedSupplies);
    }
    const addInstruction = () => {
        const currentInstructions = form.getValues("instructions") || [];
        const newInstructions = {value: ""}
        form.setValue("instructions", [...currentInstructions, newInstructions])

        // Make sure none of the textareas gets resized
        setTimeout(() => {
            document.querySelectorAll("textarea").forEach((textarea) => {
                textarea.style.height = "auto";
                textarea.style.height = `${textarea.scrollHeight}px`;
            })
        })
    }
    const removeInstruction = (index: number) => {
        const currentInstructions = form.getValues("instructions");
        const updatedInstructions = currentInstructions.filter((_, i) => i !== index);
        form.setValue("instructions", updatedInstructions);
    }

    // Automatically change textarea height
    const handleInstrInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {

        const textarea = e.target as HTMLTextAreaElement;
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            let tmp = images;
            tmp?.push(e.target.files[0])
            setImages(tmp);
        }
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // Convert from zod pattern object to pattern interface
        const instructs: string[] = values.instructions.map((ins: z.infer<typeof instructions>) => ins.value);
        const pattern: pattern = {
            _id: "",
            name: values.name,
            supplies: values.supplies,
            instructions: instructs,
            image: []
        }
        const formData = new FormData();
        formData.append('action', 'add');

        _.forEach(images, (image, index: number) => {
            if (image instanceof File) {
                formData.append("image", image);
                const now: Date = new Date()
                const dateAsString = `${now.getMonth() + 1}_${now.getDate()}_${now.getFullYear()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`
                pattern.image[index] = pattern.name.replace(' ', '_') + '-' + dateAsString + '-' + index + image.name.slice(image.name.indexOf('.'));
            }
        })

        formData.append("pattern", JSON.stringify(pattern));

        // Send to database
        await fetch('/api/pattern', {
            method: 'POST',
            body: formData
        }).then(async (res) => {
            // Error handling and closing dialog
            if (res.status === 201) {
                const data = await res.json();
                dispatch(addPattern(data.data));
                setAddPatternIsOpen(false);
            } else {
                setError(error + 1);
                if (error >= 2) {
                    setTimeout(() => {
                        setAddPatternIsOpen(false);
                    }, 1000)
                }
            }
        })
    }

    const onError = (errors: FieldErrors<z.infer<typeof formSchema>>) => {
        console.log("Validation errors: ", errors)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)}>
                <FormField 
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Da Yummy's Name</FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} />
                            </FormControl>
                            {form.formState.errors.name && (
                                <p className="mt-1 text-sm text-red-500">{form.formState.errors.name.message}</p>
                            )}
                        </FormItem>
                    )}
                /><br />
                <FormField 
                    control={form.control}
                    name="supplies"
                    render={({}) => (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-medium">Supplies</h3>
                                <Button type="button" onClick={addSupply} className="ml-4">Add</Button>
                            </div>
                            {supplyFields.map((field, i) => (
                                <div key={field.id} className={style.ingredient}>
                                    <Button type="button" onClick={() => removeSupply(i)} className={style.remove}>-</Button>
                                    <div className={style.spec}>
                                        <FormItem>
                                            <FormControl>
                                                <label>Name
                                                    <Input {...form.register(`supplies.${i}.name` as const, {
                                                        onChange: (e) => {
                                                            form.setValue(`supplies.${i}.name`, e.target.value.toLowerCase())
                                                        }
                                                    })} />
                                                </label>
                                            </FormControl>
                                            {form.formState.errors.supplies?.[i]?.name && (
                                                <p className="mt-1 text-sm text-red-500">{form.formState.errors.supplies?.[i]?.name.message}</p>
                                            )}
                                        </FormItem>
                                    </div>
                                </div>
                            ))}
                            {supplyFields.length >= 2 ? 
                                <Button type="button" onClick={addSupply} className="w-full">Add Supply</Button> : <></>
                            }
                        </div>
                    )}
                /><br />
                <FormField 
                    control={form.control}
                    name="instructions"
                    render={({}) => (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-medium">Instructions</h3>
                                <Button type="button" onClick={addInstruction} className="ml-4">Add</Button>
                            </div>
                            {instructionFields.map((field, i) => (
                                <div key={field.id} className={style.instruction}>
                                    <Button type="button" onClick={() => removeInstruction(i)} className={style.remove}>-</Button>
                                    <FormItem >
                                        <FormControl>
                                            <label className={style.label}>{i + 1}:
                                                <textarea 
                                                    {...form.register(`instructions.${i}.value` as const)}
                                                    className="block w-full !resize-none overflow-hidden rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent "
                                                    rows={1}
                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInstrInput(e)}
                                                    placeholder=''
                                                    value={form.watch(`instructions.${i}.value`)}
                                                />
                                            </label>
                                        </FormControl>
                                        {form.formState.errors.instructions?.[i]?.value && (
                                            <p className="mt-1 text-sm text-red-500">{form.formState.errors.instructions?.[i]?.value.message}</p>
                                        )}
                                    </FormItem>
                                </div>
                            ))}
                            {instructionFields.length >= 2 ? 
                                <Button type="button" onClick={addInstruction} className="w-full">Add Instruction</Button> : <></>
                            }
                        </div>
                    )}
                />
                <FormField 
                    control={form.control}
                    name="image"
                    render={({}) => (
                        <FormItem>
                            <label htmlFor='image'>Choose an image:</label>
                            <Input type="file" id="image" name="image" accept="image/*" onChange={handleImageChange} />
                        </FormItem>
                    )}
                />
                {error > 0 && 
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4"/>
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{ error < 2 ? errMsgs[0] : errMsgs[1] }</AlertDescription>
                    </Alert>
                }
                <br />
                <div className="flex justify-end items-center space-x-4">
                    <Button type="button" variant="secondary" onClick={() => setAddPatternIsOpen(false)}>Cancel</Button>
                    <Button type="submit">Submit</Button>
                </div>
            </form>
        </Form>
    )
}

export default AddPatternForm
