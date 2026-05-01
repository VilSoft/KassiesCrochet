import { z } from "zod"
import { PATTERN_TAGS } from "./tags"

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

const tagEnum = z.enum(PATTERN_TAGS)

const formSchema = z.object({
    name: z.string().min(1, "Please enter a name"),
    supplies: z.array(supplies),
    sections: z.array(sections).min(1, "Add at least one section"),
    tags: z.array(tagEnum).min(1, "Select at least one tag"),
})

const pdfFormSchema = z.object({
    name: z.string().min(1, "Please enter a name"),
    tags: z.array(tagEnum).min(1, "Select at least one tag"),
})

export { supplies, instructions, sections, formSchema, pdfFormSchema }
