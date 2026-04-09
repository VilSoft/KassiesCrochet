import supply from "./supply"

export default interface pattern {
    _id: string,
    name: string,
    supplies: Array<supply>,
    instructions: Array<string>,
    image: Array<string>
}