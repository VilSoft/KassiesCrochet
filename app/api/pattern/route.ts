import { connectMongoPatterns } from "@/utils";
import { Pattern } from "@/models";
import { pattern } from "@/interfaces"
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { writeFile, unlink } from "fs/promises";

const uploadDir = path.join(process.cwd(), 'uploads');

// export const config = {
//     api: {
//         bodyParser: false
//     }
// }


export async function POST(req: NextRequest) {
    try {
        const data = await req.formData();
        const file: File | null = data.get('image') as unknown as File
        const action = data.get('action') as unknown as string
        const pattern = data.get('pattern') as unknown as string
        const oldImage = data.get('oldImageLocaltion') as unknown as string
        console.log('got fields')
        if (!action || !pattern) {
            return NextResponse.json({ error: 'Missing action or pattern data' }, { status: 500 })
        }
        if (file) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const path = `${uploadDir}/${JSON.parse(pattern).image}`;
            await writeFile(path, buffer);
            console.log(oldImage)
            if (oldImage) {
                const path = `${uploadDir}/${oldImage}`;
                await unlink(path);
            }
        }
        switch (action) {
            case 'add':
                return await addPattern(JSON.parse(pattern));
            case 'modify':
                return await modifyPattern(JSON.parse(pattern) as pattern);
        }
    } catch (err) {
        return NextResponse.json({ error: `Failed to process the request: ${err}` }, { status: 500 })
    }
}

export async function GET() {
    return await getPatterns();
}

// POST: Add
async function addPattern(patternToAdd: any) {
    console.log("here")
    console.log(patternToAdd)
    console.log('Connecting to DB')
    const db = await connectMongoPatterns()
    console.log('Connected to DB')
    console.log('Sending')
    const sendJSON = patternToAdd
    const key: string = "_id"
    delete sendJSON[key]
    const pattern = await Pattern.create(sendJSON)
    console.log('Sent')
    db.connection.close()
    return NextResponse.json(
        { message: 'Pattern added successfully', data: pattern },
        { status: 201 }
    )
}

// GET: Get
async function getPatterns() {
    console.log('Connecting to DB');
    const db = await connectMongoPatterns()
    console.log('Connected to DB');
    console.log('Getting patterns');
    const pattern = await Pattern.find({})
    console.log('Got patterns');
    db.connection.close();
    const formatted: Array<pattern> = pattern;

    return NextResponse.json(formatted)
}

// // POST: Modify
async function modifyPattern(modPattern: pattern) {

    console.log('Connecting to DB')
    const db = await connectMongoPatterns()
    console.log('Connected to DB')
    console.log('Getting')
    const pattern = await Pattern.findByIdAndUpdate(modPattern._id, modPattern, { new: true })
    console.log('Got')
    db.connection.close()
    return NextResponse.json(
        { message: 'Pattern modified successfully', data: pattern },
        { status: 201 }
    )
}

// // DELETE: Remove
// async function removePattern(req: any, res: any) {

//     console.log('Connecting to DB')
//     let db = await connectMongoPatterns()
//     console.log('Connected to DB')
//     console.log('Removing')
//     // const pattern = await Pattern.remove({ _id: req.body.id })
//     console.log('Removed')
//     db.connection.close()

//     // res.json({ pattern })
// }