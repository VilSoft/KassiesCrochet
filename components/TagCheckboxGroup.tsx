"use client"
import { PATTERN_TAGS, PatternTag } from '@/interfaces'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface Props {
    value: PatternTag[]
    onChange: (next: PatternTag[]) => void
    error?: string
}

export default function TagCheckboxGroup({ value, onChange, error }: Props) {
    const toggle = (tag: PatternTag) => {
        onChange(
            value.includes(tag)
                ? value.filter((t) => t !== tag)
                : [...value, tag]
        )
    }

    return (
        <div>
            <p className="text-sm font-medium mb-2">Tags</p>
            <div className="flex flex-wrap gap-4">
                {PATTERN_TAGS.map((tag) => (
                    <div key={tag} className="flex items-center gap-2">
                        <Checkbox
                            id={`tag-${tag}`}
                            checked={value.includes(tag)}
                            onCheckedChange={() => toggle(tag)}
                        />
                        <Label htmlFor={`tag-${tag}`} className="cursor-pointer font-normal">
                            {tag}
                        </Label>
                    </div>
                ))}
            </div>
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
    )
}
