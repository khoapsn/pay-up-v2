import { NextResponse } from "next/server";

const url = 'http://api.airvisual.com/v2/city?city=Hanoi&state=Hanoi&country=Vietnam&key=82350757-0540-49aa-82c9-48bf1594612e';

export async function GET() {
    const data = await fetch(url);
    const json = await data.json();
    const value = json.data.current.pollution.aqius;
    const content = `value\r\n${value}\r\n${value / 500 * 100}`;
    return new NextResponse(content, {
        headers: {
            'Content-Type': 'application/csv',
            'Content-Disposition': 'attachment; filename="aqi.csv"'
        },
    });
}
