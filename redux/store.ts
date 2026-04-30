import { configureStore } from "@reduxjs/toolkit"
import patternReducer from './features/patternSlice'
import patternListReducer from './features/patternListSlice'
import { TypedUseSelectorHook, useSelector } from "react-redux"

export const store = configureStore({
    reducer: {
        patternReducer,
        patternListReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;