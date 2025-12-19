'use server';

import { neon } from "@neondatabase/serverless";
import { Mood, MoodValue, Profile } from "./models";

const connectionString = process.env.DATABASE_URL ?? '';
const sql = neon(connectionString);

export const getProfile = async (id: string): Promise<Profile> => {
    const data = await sql`SELECT * FROM mood_swing.profiles WHERE id=${id}` as Profile[];
    return data[0];
}

export const postProfile = async (name: string): Promise<string> => {
    const data = await sql`INSERT INTO mood_swing.profiles (name) VALUES (${name}) RETURNING id` as { id: string }[];
    return data[0].id;
}

export const getMoods = async (profileId: string, month: number, year: number): Promise<Mood[]> => {
    const data = await sql`
        SELECT *
        FROM mood_swing.moods
        WHERE profile_id=${profileId}
        AND DATE_PART('month', date)=${month}
        AND DATE_PART('year', date)=${year}
    ` as Mood[];
    return data;
}

export const putMood = async (profileId: string, date: Date, value: MoodValue) => {
    await sql`
        INSERT INTO mood_swing.moods (profile_id, date, value)
        VALUES (${profileId},${date},${value})
        ON CONFLICT (profile_id, date)
        DO UPDATE SET value=${value}
    `;
}

export const deleteMood = async (profileId: string, date: Date) => {
    await sql`DELETE FROM mood_swing.moods WHERE profile_id=${profileId} AND date=${date}`;
}

