import supply from "./supply"
import section from "./section"
import { PatternTag } from "./tags"

export default interface pattern {
    _id: string
    name: string
    supplies: supply[]
    sections: section[]
    image?: string
    pdfFile?: string
    tags: PatternTag[]
}

export function isPdfPattern(p: pattern): boolean {
    return !!p.pdfFile
}
