import React, { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="bg-blobs pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-[var(--blob-opacity)]">
                <div style={{ background: 'radial-gradient(ellipse at center, hsl(243 75% 38% / 0.28) 0%, transparent 70%)', willChange: 'transform' }} className="absolute -top-64 -left-40 h-[52rem] w-[52rem] animate-blob-drift-1" />
                <div style={{ background: 'radial-gradient(ellipse at center, hsl(210 85% 45% / 0.22) 0%, transparent 70%)', willChange: 'transform' }} className="absolute top-20 -right-52 h-[44rem] w-[44rem] animate-blob-drift-2" />
                <div style={{ background: 'radial-gradient(ellipse at center, hsl(270 60% 32% / 0.2) 0%, transparent 70%)', willChange: 'transform' }} className="absolute -bottom-40 left-1/3 h-[40rem] w-[40rem] animate-blob-drift-3" />
            </div>
            <main className="relative">
                {children}
            </main>
        </div>
    )
}

export default Layout
