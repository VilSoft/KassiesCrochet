export const PATTERN_TAGS = ['My Pattern', 'Purchased', 'Tester'] as const
export type PatternTag = (typeof PATTERN_TAGS)[number]
