"use client"
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { useState, useEffect } from "react"
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";
import { Input } from "./ui/input";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { setAddPatternIsOpen } from "@/redux/features/patternListSlice";
import { setSearchParam } from "@/redux/features/patternListSlice";
import { Menu } from "lucide-react";

export default function Navbar() {
    const dispatch = useDispatch<AppDispatch>();
    const [isDarkMode, setIsDarkmode] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
        const root = window.document.documentElement;
        const theme = localStorage.getItem("theme");
        if (theme === "dark") {
            root.classList.add("dark");
            setIsDarkmode(true);
        }
    }, [])

    const toggleTheme = () => {
        const root = window.document.documentElement;
        const isDark = root.classList.contains("dark");

        if (isDark) {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
            setIsDarkmode(false);
        } else {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
            setIsDarkmode(true);
        }
    }

    return (
        <nav className="w-full h-auto p-2">
            <div className="flex justify-between items-center">
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            Kassie's Crochet Patterns
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
                <div className="ml-auto flex justify-between">
                    <Input type="text" className="px-3 py-2 w-50" placeholder="Search..." onChange={(e) => dispatch(setSearchParam(e.target.value))} />
                    <Button variant="outline" onClick={() => setIsOpen(!isOpen)}>
                        <Menu />
                    </Button>
                </div>
            </div>
            {isOpen &&
                <div className="ml-auto flex justify-end mt-1">
                    <Button onClick={() => dispatch(setAddPatternIsOpen(true))} variant="outline">Add Pattern</Button>
                    <Button onClick={toggleTheme} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg" variant="outline">
                        {isDarkMode ? <Sun /> : <Moon />}
                    </Button>
                </div>
            }
        </nav>
    )
}