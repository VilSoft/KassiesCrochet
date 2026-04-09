import { CaseReducer, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { pattern } from '@/interfaces'
import { RootState } from "../store"

type Patterns = {
    patterns: Array<pattern>
}

type InitialState = {
    value: Patterns
}

const initialState = {
    value: {
        patterns: []
    } as Patterns
} as InitialState

export const patterns = createSlice({
    name: "patterns",
    initialState,
    reducers: {
        setPatterns: (state, action: PayloadAction<Array<pattern>>) => {
            return {
                value: {
                    patterns: action.payload
                }
            }
        },
        addPattern: (state, action: PayloadAction<pattern>) => {
            state.value.patterns.push(action.payload);
        },
        modifyPattern: (state, action: PayloadAction<pattern>) => {
            const index = state.value.patterns.findIndex((r) => r._id === action.payload._id)
            if (index !== -1) { 
                state.value.patterns[index] = action.payload
            }
        }
    }
})
export const getPatterns = (state: RootState) => state.patternReducer.value.patterns;

export const { setPatterns, addPattern, modifyPattern } = patterns.actions;
export default patterns.reducer;