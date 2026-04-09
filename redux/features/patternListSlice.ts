import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { pattern } from '@/interfaces'
import { RootState } from "../store"

const initialState = {
    searchParam: "",
    addPatternIsOpen: false,
    patternIsOpen: false
}

export const listData = createSlice({
    name: "listData",
    initialState,
    reducers: {
        setSearchParam: (state, action: PayloadAction<string>) => {
            state.searchParam = action.payload;
        },
        setAddPatternIsOpen: (state, action: PayloadAction<boolean>) => {
            state.addPatternIsOpen = action.payload;
        },
        setIsPatternOpen: (state, action: PayloadAction<boolean>) => {
            state.patternIsOpen = action.payload;
        }
    }
})
export const getSearchParam = (state: RootState) => state.patternListReducer.searchParam;
export const getAddPatternIsOpen = (state: RootState) => state.patternListReducer.addPatternIsOpen;
export const getIsPatternOpen = (state: RootState) => state.patternListReducer.patternIsOpen;

export const { setSearchParam, setAddPatternIsOpen, setIsPatternOpen } = listData.actions;
export default listData.reducer;