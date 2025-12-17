'use server';

import { neon } from "@neondatabase/serverless";
import { Expense, Member, Project, ProjectSummary } from "./models";
import { SampleMembers } from "./sample";

const connectionString = process.env.DATABASE_URL ?? '';
const sql = neon(connectionString);

export const getProjects = async (): Promise<ProjectSummary[]> => {
    // TODO: Get data from localStorage and order by lastOpened desc
    const data = await sql.query('SELECT * FROM pay_up.projects') as ProjectSummary[];
    return data;
}

export const getProject = async (id: string): Promise<Project> => {
    const data = await sql.query('SELECT * FROM pay_up.projects WHERE id=$1', [id]);
    const row = data[0];
    const members = await sql.query('SELECT * FROM pay_up.members WHERE project_id=$1', [id]) as Member[];

    return {
        id: row.id,
        title: row.title,
        description: row.description,
        date: row.date,
        currencies: {
            base: row.currency,
            others: [],
        },
        members,
    };
}

export const postProject = async (title: string): Promise<string> => {
    const data = await sql.query('INSERT INTO pay_up.projects (title) VALUES ($1) RETURNING id', [title]);
    return data[0].id;
}

export const patchProject = async (project: Project) => {
    await sql.query(`
        UPDATE pay_up.projects
        SET
            title=$1,
            description=$2,
            date=$3,
            currency=$4
        WHERE id=$5
    `, [
        project.title,
        project.description,
        project.date,
        project.currencies.base,
        project.id,
    ]);
}

export const getExpenses = async (id: string): Promise<Expense[]> => {
    return [
        {
            id: 1,
            title: 'Expense 01',
            amount: 100000,
            currency: 'VND',
            paidBy: SampleMembers[0],
            paidFor: [{ member: SampleMembers[1], weight: 1 }],
            time: '2025-12-11 10:00:00',
            // createdTime: '2025-12-11 10:00:00',
        },
        {
            id: 2,
            title: 'Expense 02',
            amount: 200,
            currency: 'JPY',
            paidBy: SampleMembers[1],
            paidFor: [
                {
                    member: SampleMembers[0],
                    weight: 1,
                },
                {
                    member: SampleMembers[1],
                    weight: 3,
                },
            ],
            time: '2025-12-11 15:50:00',
            // createdTime: '2025-12-11 15:50:00',
        },
    ];
}
