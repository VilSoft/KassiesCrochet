import { z } from "zod"

const supplies = z.object({
    name: z.string().min(1, "Please enter name of ingredient"),
})

const instructions = z.object({
    value: z.string().min(1, "Please enter an instruction")
})

const formSchema = z.object({
    name: z.string().min(1, "Please enter a name"),
    supplies: z.array(supplies),
    instructions: z.array(instructions),
    image: z.array(z.string()).optional()
})

export {
    supplies,
    instructions,
    formSchema
}