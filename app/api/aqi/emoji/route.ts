import fs from "fs/promises";
import { NextResponse } from "next/server";
import { url } from "../route";

export async function GET() {
    const data = await fetch(url);
    const json = await data.json();
    const value = Number(json.data.current.pollution.aqius);

    let icon = '';
    if (value <= 50) icon = 'excited';
    else if (value <= 100) icon = 'calm';
    else if (value <= 150) icon = 'neutral';
    else if (value <= 200) icon = 'stressed';
    else if (value <= 300) icon = 'sick';
    else icon = 'dead';

    const buffer = await fs.readFile(`${process.cwd()}/public/icons/${icon}.svg`);

    return new NextResponse(buffer, {
        headers: {
            'Content-Type': 'image/svg',
            'Content-Disposition': 'attachment; filename="emoji.svg"',
        },
    });
}