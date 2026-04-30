import { z } from "zod"

const supplies = z.object({
    name: z.string().min(1, "Please enter a supply name"),
})

const instructions = z.object({
    value: z.string().min(1, "Please enter an instruction"),
    images: z.array(z.string()).optional()
})

const sections = z.object({
    title: z.string().min(1, "Please enter a section title"),
    instructions: z.array(instructions).min(1, "Add at least one step"),
})

const formSchema = z.object({
    name: z.string().min(1, "Please enter a name"),
    supplies: z.array(supplies),
    sections: z.array(sections).min(1, "Add at least one section"),
})

const pdfFormSchema = z.object({
    name: z.string().min(1, "Please enter a name"),
})

export { supplies, instructions, sections, formSchema, pdfFormSchema }
