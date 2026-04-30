import mongoose, { Schema, model, models } from 'mongoose'

const supplySchema = new Schema(
    { name: { type: String, required: true } },
    { _id: false }
)

const instructionSchema = new Schema(
    {
        value:  { type: String, required: true },
        images: { type: [String], default: [] },
    },
    { _id: false }
)

const sectionSchema = new Schema(
    {
        title:        { type: String, required: true },
        instructions: { type: [instructionSchema], required: true },
    },
    { _id: false }
)

const patternSchema = new Schema({
    name:     { type: String, required: true },
    supplies: { type: [supplySchema], required: false, default: [] },
    sections: { type: [sectionSchema], required: false, default: [] },
    image:    { type: String, required: false, default: '' },
    pdfFile:  { type: String, required: false, default: '' },
})

// In development, delete the cached model so schema changes take effect on hot reload.
// In production this branch never runs (modules are only evaluated once).
if (process.env.NODE_ENV !== 'production') {
    delete (mongoose.models as any).Pattern
}

const Pattern = models.Pattern || model('Pattern', patternSchema)

export default Pattern
