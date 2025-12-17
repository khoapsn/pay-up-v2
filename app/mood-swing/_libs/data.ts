'use server';

import { neon } from "@neondatabase/serverless";
import { Mood, Profile } from "./models";

const connectionString = process.env.DATABASE_URL ?? '';
const sql = neon(connectionString);

export const getProfile = async (id: string): Promise<Profile> => {
    const data = await sql`SELECT * FROM mood_swing.profiles WHERE id=${id}` as Profile[];
    return data[0];
}

export const postProfile = async (name: string): Promise<string> => {
    return '';
}

export const getMoods = async (profileId: string, month: number): Promise<Mood[]> => {
    const data = await sql`
        SELECT *
        FROM mood_swing.moods
        WHERE profile_id=${profileId}
        AND DATE_PART('month', date)=${month}
    ` as Mood[];
    return data;
}
