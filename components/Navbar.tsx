"use client"
import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Moon, Sun } from 'lucide-react'
import { Input } from './ui/input'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/redux/store'
import { setAddPatternIsOpen, setAddPdfPatternIsOpen, setSearchParam } from '@/redux/features/patternListSlice'
import Image from 'next/image'
import icon from '@/public/crochet.ico'

export default function Navbar() {
    const dispatch = useDispatch<AppDispatch>()
    const [isDarkMode, setIsDarkMode] = useState(false)

    useEffect(() => {
        const theme = localStorage.getItem('theme')
        if (theme === 'dark') {
            window.document.documentElement.classList.add('dark')
            setIsDarkMode(true)
        }
    }, [])

    const toggleTheme = () => {
        const root = window.document.documentElement
        const isDark = root.classList.contains('dark')
        if (isDark) {
            root.classList.remove('dark')
            localStorage.setItem('theme', 'light')
            setIsDarkMode(false)
        } else {
            root.classList.add('dark')
            localStorage.setItem('theme', 'dark')
            setIsDarkMode(true)
        }
    }

    return (
        <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 gap-3">
                <div className="flex items-center gap-2 shrink-0">
                    <Image width={28} height={28} src={icon} alt="" />
                    <span className="font-semibold text-sm hidden sm:block">Kassie's Crochet Patterns</span>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    <Input
                        type="text"
                        className="w-32 sm:w-48 h-8 text-sm"
                        placeholder="Search…"
                        onChange={(e) => dispatch(setSearchParam(e.target.value))}
                    />
                    <Button size="sm" onClick={() => dispatch(setAddPatternIsOpen(true))}>
                        Add Pattern
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => dispatch(setAddPdfPatternIsOpen(true))}>
                        Add PDF
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        className="h-8 w-8"
                    >
                        {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </nav>
    )
}
