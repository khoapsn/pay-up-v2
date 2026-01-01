import { NextRequest, NextResponse } from "next/server";
import { getMoods } from "../../_libs/data";
import { createCanvas } from "canvas";
import dayjs from "dayjs";
import { moodValueOptions } from "../../_libs/models";

const today = dayjs();
const radius = 20;
const padding = 15;
const defaultId = 'e2d9a073-be95-46a1-97cd-d750aa12d436';
const bgColor = '#8e8e93';

export async function GET(request: NextRequest) {
    const params = (new URL(request.url)).searchParams;
    const id = params.get('id') || defaultId;
    const year = Number(params.get('year')) || today.year();
    const moods = await getMoods(id, year);

    const canvas = createCanvas(31 * 2 * radius + 30 * padding, 12 * 2 * radius + 11 * padding);
    const ctx = canvas.getContext('2d');

    [...Array(12).keys()].forEach(e => {
        [...Array(today.month(e).daysInMonth()).keys()].forEach(f => {
            const x = radius + f * (2 * radius + padding);
            const y = radius + e * (2 * radius + padding);

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = bgColor;
            ctx.fill();
        });
    });

    moods.forEach(e => {
        const date = dayjs(e.date);
        const x = radius + (date.date() - 1) * (2 * radius + padding);
        const y = radius + date.month() * (2 * radius + padding);
        const color = moodValueOptions.find(f => f.value === e.value)?.color;

        if (color) {
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }
    });

    const buffer = canvas.toBuffer('image/png');
    return new NextResponse(new Uint8Array(buffer), {
        headers: {
            'Content-Type': 'image/png',
        },
    });
}
