import { connectMongoPatterns } from "@/utils";
import { Pattern } from "@/models";
import { pattern } from "@/interfaces";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { writeFile, unlink, mkdir } from "fs/promises";
import { renderPdfFirstPageToBuffer } from "@/utils/pdfThumbnail";

const uploadDir      = path.join(process.cwd(), 'uploads');
const imageUploadDir = path.join(uploadDir, 'images');
const pdfUploadDir   = path.join(uploadDir, 'pdf');

export async function GET() {
    const db = await connectMongoPatterns();
    const patterns = await Pattern.find({});
    db.connection.close();
    return NextResponse.json(patterns);
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.formData();
        const action = data.get('action') as string | null;
        const patternJson = data.get('pattern') as string | null;

        if (!action || !patternJson) {
            return NextResponse.json({ error: 'Missing action or pattern data' }, { status: 400 });
        }

        const patternObj: pattern = JSON.parse(patternJson);
        const sanitizedName = patternObj.name.replace(/\s+/g, '_').toLowerCase();
        const timestamp = Date.now();

        // Ensure upload subdirectories exist
        await mkdir(imageUploadDir, { recursive: true });
        await mkdir(pdfUploadDir, { recursive: true });

        // Handle final image
        const finalFile = data.get('finalImage');
        if (finalFile instanceof File) {
            const ext = finalFile.name.slice(finalFile.name.lastIndexOf('.'));
            const filename = `${sanitizedName}-final-${timestamp}${ext}`;
            await writeFile(path.join(imageUploadDir, filename), Buffer.from(await finalFile.arrayBuffer()));
            patternObj.image = 'images/' + filename;

            // Delete old final image when replacing
            const oldFinal = data.get('oldFinalImage') as string | null;
            if (oldFinal) {
                await unlink(path.join(uploadDir, oldFinal)).catch(() => {});
            }
        }

        // Handle per-instruction images (keys: instrImage_S_N_M — section, instruction, image index)
        for (const [key, value] of (data as any).entries()) {
            const match = (key as string).match(/^instrImage_(\d+)_(\d+)_(\d+)$/);
            if (!match || !(value instanceof File)) continue;
            const S = parseInt(match[1]);
            const N = parseInt(match[2]);
            const M = parseInt(match[3]);
            const ext = value.name.slice(value.name.lastIndexOf('.'));
            const filename = `${sanitizedName}-s${S}instr${N}-${M}-${timestamp}${ext}`;
            await writeFile(path.join(imageUploadDir, filename), Buffer.from(await value.arrayBuffer()));
            if (!patternObj.sections[S]?.instructions[N]) continue;
            if (!patternObj.sections[S].instructions[N].images) patternObj.sections[S].instructions[N].images = [];
            patternObj.sections[S].instructions[N].images![M] = 'images/' + filename;
        }

        // Delete old instruction images marked for removal
        const oldInstrJson = data.get('oldInstrImages') as string | null;
        if (oldInstrJson) {
            const oldFiles: string[] = JSON.parse(oldInstrJson);
            await Promise.all(oldFiles.map(f => unlink(path.join(uploadDir, f)).catch(() => {})));
        }

        // Handle PDF file
        const pdfUpload = data.get('pdfFile');
        let pdfBufferForCover: Buffer | null = null;
        if (pdfUpload instanceof File) {
            const filename = `${sanitizedName}-${timestamp}.pdf`;
            const buf = Buffer.from(await pdfUpload.arrayBuffer());
            await writeFile(path.join(pdfUploadDir, filename), buf);
            patternObj.pdfFile = 'pdf/' + filename;
            const oldPdf = data.get('oldPdfFile') as string | null;
            if (oldPdf) await unlink(path.join(uploadDir, oldPdf)).catch(() => {});

            const hasNewPhoto = finalFile instanceof File;
            if (!hasNewPhoto && !patternObj.image) {
                pdfBufferForCover = buf;
            }
        }

        // Auto-generate cover image from PDF page 1 if no photo was provided/exists
        if (pdfBufferForCover) {
            const coverBuffer = await renderPdfFirstPageToBuffer(pdfBufferForCover);
            if (coverBuffer) {
                const coverFilename = `${sanitizedName}-final-${timestamp}.jpg`;
                await writeFile(path.join(imageUploadDir, coverFilename), coverBuffer);
                patternObj.image = 'images/' + coverFilename;
            }
        }

        switch (action) {
            case 'add':    return await addPattern(patternObj);
            case 'modify': return await modifyPattern(patternObj);
            default:       return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
        }
    } catch (err) {
        return NextResponse.json({ error: `Failed to process the request: ${err}` }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { id, imageFiles }: { id: string; imageFiles: string[] } = await req.json();
        if (!id) return NextResponse.json({ error: 'Missing pattern id' }, { status: 400 });

        const db = await connectMongoPatterns();
        await Pattern.findByIdAndDelete(id);
        db.connection.close();

        await Promise.all(
            (imageFiles ?? []).map(f => unlink(path.join(uploadDir, f)).catch(() => {}))
        );

        return NextResponse.json({ message: 'Pattern deleted' }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: `Failed to delete: ${err}` }, { status: 500 });
    }
}

async function addPattern(patternObj: pattern) {
    const db = await connectMongoPatterns();
    const sendJSON: any = { ...patternObj };
    delete sendJSON['_id'];
    const created = await Pattern.create(sendJSON);
    db.connection.close();
    return NextResponse.json({ message: 'Pattern added successfully', data: created }, { status: 201 });
}

async function modifyPattern(patternObj: pattern) {
    const db = await connectMongoPatterns();
    const updated = await Pattern.findByIdAndUpdate(patternObj._id, patternObj, { new: true });
    db.connection.close();
    return NextResponse.json({ message: 'Pattern modified successfully', data: updated }, { status: 201 });
}
