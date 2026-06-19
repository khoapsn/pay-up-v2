import { LunarCalendar } from '@forvn/vn-lunar-calendar';
import { NextResponse } from 'next/server';
import { toCardinal } from 'n2words/ja-JP';

export function GET() {
    const lunar = LunarCalendar.today().lunarDate;
    const body = { value: `${toCardinal(lunar.month)}月${toCardinal(lunar.day)}日` };
    return new NextResponse(JSON.stringify(body), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}   
