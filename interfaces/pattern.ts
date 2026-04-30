import supply from "./supply"
import section from "./section"

export default interface pattern {
    _id: string
    name: string
    supplies: supply[]
    sections: section[]
    image?: string
    pdfFile?: string
}

export function isPdfPattern(p: pattern): boolean {
    return !!p.pdfFile
}
