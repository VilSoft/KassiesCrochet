"use client"

import React, { useEffect, useState } from 'react'
import { pattern, PATTERN_TAGS, PatternTag } from '@/interfaces'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/redux/store'
import { setPatterns, getPatterns } from '@/redux/features/patternSlice'
import {
    getSearchParam,
    getAddPatternIsOpen,
    getIsPatternOpen,
    getAddPdfPatternIsOpen,
    setIsPatternOpen,
    setAddPatternIsOpen,
} from '@/redux/features/patternListSlice'
import { WhichOpen } from './enums'
import Modal from './Modal'
import AddPatternForm from './AddPatternForm'
import AddPdfPatternForm from './AddPdfPatternForm'
import ShowPattern from './ShowPattern'
import Image from 'next/image'
import { Button } from './ui/button'
import { FileIcon } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'

const TAB_TRIGGER_CLASS =
    'rounded-none border-b-2 border-transparent mb-[-1px] px-4 py-2.5 text-sm font-medium text-muted-foreground bg-transparent shadow-none ' +
    'data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none'

function PatternListItem({
    p,
    idx,
    onClick,
}: {
    p: pattern
    idx: number
    onClick: (p: pattern) => void
}) {
    return (
        <li
            onClick={() => onClick(p)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card cursor-pointer transition-all duration-150 hover:shadow-md hover:border-primary/30 hover:bg-accent animate-in fade-in-0 slide-in-from-bottom-2"
            style={{ animationDelay: `${idx * 40}ms` }}
        >
            {p.image && (
                <Image
                    width={48}
                    height={48}
                    src={`/api/uploads/${p.image}`}
                    alt={p.name}
                    className="h-12 w-12 rounded-lg object-cover shrink-0"
                />
            )}
            {p.pdfFile && !p.image && (
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <FileIcon className="h-6 w-6 text-muted-foreground" />
                </div>
            )}
            <span className="text-sm font-medium">{p.name}</span>
        </li>
    )
}

export default function Patterns() {
    const dispatch = useDispatch<AppDispatch>()
    const patterns = useSelector(getPatterns)
    const search = useSelector(getSearchParam)
    const isOpen = useSelector(getAddPatternIsOpen)
    const isPatternOpen = useSelector(getIsPatternOpen)
    const isPdfOpen = useSelector(getAddPdfPatternIsOpen)

    const [loaded, setLoaded] = useState(false)
    const [openPattern, setOpenPattern] = useState<pattern | undefined>(undefined)

    const handleOpenPattern = (p: pattern) => {
        setOpenPattern(p)
        dispatch(setIsPatternOpen(true))
    }

    useEffect(() => {
        if (loaded) return
        const fetchPatterns = async () => {
            const res = await fetch('/api/pattern', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            })
            const data = await res.json()
            dispatch(setPatterns(data))
            setLoaded(true)
        }
        fetchPatterns()
    }, [loaded, dispatch])

    const matchesSearch = (p: pattern) =>
        p.name.toLowerCase().includes(search.toLowerCase())

    const byTag = (tag: PatternTag) =>
        patterns.filter((p) => (p.tags ?? []).includes(tag) && matchesSearch(p))

    const untagged = patterns.filter(
        (p) => (p.tags ?? []).length === 0 && matchesSearch(p)
    )

    const hasUntagged = patterns.some((p) => (p.tags ?? []).length === 0)

    return (
        <div className="flex justify-center px-4 py-6">
            <div className="w-full max-w-xl">
                {/* Loading skeletons */}
                {!loaded && (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-16 rounded-xl border border-border bg-muted animate-pulse"
                            />
                        ))}
                    </div>
                )}

                {/* Empty state — no patterns in DB */}
                {loaded && patterns.length === 0 && (
                    <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
                        <p className="text-base font-medium">No patterns yet.</p>
                        <Button onClick={() => dispatch(setAddPatternIsOpen(true))}>
                            Add your first pattern
                        </Button>
                    </div>
                )}

                {/* Tabs */}
                {loaded && patterns.length > 0 && (
                    <Tabs defaultValue="My Pattern">
                        <TabsList className="w-full justify-start gap-0 h-auto p-0 bg-transparent border-b border-border rounded-none">
                            {PATTERN_TAGS.map((tag) => (
                                <TabsTrigger key={tag} value={tag} className={TAB_TRIGGER_CLASS}>
                                    {tag}
                                </TabsTrigger>
                            ))}
                            {hasUntagged && (
                                <TabsTrigger value="Untagged" className={TAB_TRIGGER_CLASS}>
                                    Untagged
                                </TabsTrigger>
                            )}
                        </TabsList>

                        {PATTERN_TAGS.map((tag) => {
                            const list = byTag(tag)
                            return (
                                <TabsContent
                                    key={tag}
                                    value={tag}
                                    className="mt-4 data-[state=active]:animate-in data-[state=active]:fade-in-0 duration-200"
                                >
                                    {list.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-16 text-sm">
                                            {search ? 'No patterns match your search.' : 'No patterns in this category.'}
                                        </p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {list.map((p, idx) => (
                                                <PatternListItem key={p._id} p={p} idx={idx} onClick={handleOpenPattern} />
                                            ))}
                                        </ul>
                                    )}
                                </TabsContent>
                            )
                        })}

                        {hasUntagged && (
                            <TabsContent
                                value="Untagged"
                                className="mt-4 data-[state=active]:animate-in data-[state=active]:fade-in-0 duration-200"
                            >
                                {untagged.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-16 text-sm">
                                        No patterns match your search.
                                    </p>
                                ) : (
                                    <ul className="space-y-2">
                                        {untagged.map((p, idx) => (
                                            <PatternListItem key={p._id} p={p} idx={idx} onClick={handleOpenPattern} />
                                        ))}
                                    </ul>
                                )}
                            </TabsContent>
                        )}
                    </Tabs>
                )}

                <Modal title="Add a Pattern" isOpen={isOpen} type={WhichOpen.add}>
                    <AddPatternForm />
                </Modal>
                <Modal title="Add a PDF Pattern" isOpen={isPdfOpen} type={WhichOpen.addPdf}>
                    <AddPdfPatternForm />
                </Modal>
                <Modal title={openPattern?.name ?? ''} isOpen={isPatternOpen} type={WhichOpen.show}>
                    {openPattern && <ShowPattern key={openPattern._id} pattern={openPattern} />}
                </Modal>
            </div>
        </div>
    )
}
