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

export const putProfile = async (profile: Profile) => {
    await sql`
        UPDATE mood_swing.profiles
        SET name=${profile.name}, week_start_on_sunday=${profile.week_start_on_sunday}
        WHERE id=${profile.id}
    `;
}

export const getMoods = async (profileId: string, year: number, month?: number): Promise<Mood[]> => {
    const data = await sql`
        SELECT *
        FROM mood_swing.moods
        WHERE
            profile_id=${profileId}
            AND date LIKE ${month ? `${year}-${month.toString().padStart(2, '0')}-%` : `${year}-%`}
    ` as Mood[];
    return data;
}

export const putMood = async (profileId: string, date: string, value: MoodValue) => {
    await sql`
        INSERT INTO mood_swing.moods (profile_id, date, value)
        VALUES (${profileId},${date},${value})
        ON CONFLICT (profile_id, date)
        DO UPDATE SET value=${value}
    `;
}

export const deleteMood = async (profileId: string, date: string) => {
    await sql`DELETE FROM mood_swing.moods WHERE profile_id=${profileId} AND date=${date}`;
}

