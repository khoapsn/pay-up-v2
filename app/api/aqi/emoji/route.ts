import fs from "fs/promises";
import { NextResponse } from "next/server";
import { url } from "../route";

export async function GET() {
    const data = await fetch(url);
    const json = await data.json();
    console.log(json);
    const value = Number(json.data.current.pollution.aqius);

    let icon = '';
    if (value <= 50) icon = 'face-0';
    else if (value <= 100) icon = 'face-1';
    else if (value <= 150) icon = 'face-2';
    else if (value <= 200) icon = 'face-3';
    else if (value <= 300) icon = 'face-4';
    else icon = 'face-5';

    const buffer = await fs.readFile(`${process.cwd()}/public/icons/${icon}.png`);

    return new NextResponse(new Uint8Array(buffer), {
        headers: {
            'Content-Type': 'image/png',
        },
    });
}
