import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

const MIME: Record<string, string> = {
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png':  'image/png',
    '.gif':  'image/gif',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.pdf':  'application/pdf',
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ filepath: string[] }> }
) {
    const filepath = (await params).filepath;
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const relativePath = path.join(...filepath);
    const filePath = path.join(uploadsDir, relativePath);

    // Path traversal guard
    if (!filePath.startsWith(uploadsDir)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const ext = path.extname(filepath[filepath.length - 1]).toLowerCase();
    const mimeType = MIME[ext] ?? 'application/octet-stream';
    const fileBuffer = await fs.promises.readFile(filePath);

    return new NextResponse(fileBuffer, {
        headers: { 'Content-Type': mimeType },
    });
}
