'use server';

import { neon } from "@neondatabase/serverless";
import { Currency, Exchange, Expense, Member, PaidFor, Project } from "./models";

const connectionString = process.env.DATABASE_URL ?? '';
const sql = neon(connectionString);

export const getProject = async (project_id: string): Promise<Project> => {
    const data = await sql`SELECT * FROM pay_up.projects WHERE id=${project_id}`;
    const row = data[0];

    return {
        id: row.id,
        title: row.title,
        description: row.description,
        date: row.date,
        currency: row.currency,
    };
}

export const postProject = async (title: string): Promise<string> => {
    const data = await sql`INSERT INTO pay_up.projects (title) VALUES (${title}) RETURNING id`;
    return data[0].id;
}

export const patchProject = async (project: Project) => {
    await sql`
        UPDATE pay_up.projects
        SET
            title=${project.title},
            description=${project.description},
            date=${project.date}
        WHERE id=${project.id}
    `;
}

export const patchProjectCurrency = async (project_id: string, currency: string) => {
    await sql`UPDATE pay_up.projects SET currency=${currency} WHERE id=${project_id}`;
}

export const getMembers = async (project_id: string): Promise<Member[]> => {
    return await sql`
        SELECT *
        FROM pay_up.members
        WHERE project_id=${project_id}
        ORDER BY name
    ` as Member[];
}

export const postMember = async (project_id: string, name: string) => {
    await sql`
        INSERT INTO pay_up.members (project_id, name)
        VALUES (${project_id}, ${name})
    `;
}

export const getExpenses = async (project_id: string): Promise<Expense[]> => {
    const expenses = await sql`
        SELECT a.*, b.name AS paid_by_name
        FROM pay_up.expenses a
        LEFT JOIN pay_up.members b ON a.paid_by=b.id
        WHERE a.project_id=${project_id}
    `;

    const paidFors = await sql`
        SELECT a.*, b.name AS paid_for_name
        FROM pay_up.paid_fors a
        LEFT JOIN pay_up.members b ON a.member_id=b.id
        WHERE expense_id IN (
            SELECT id FROM pay_up.expenses WHERE project_id=${project_id}
        );
    `;

    return expenses.map(e => ({
        id: e.id,
        title: e.title,
        amount: Number(e.amount),
        currency: e.currency,
        paid_by: {
            id: e.paid_by,
            name: e.paid_by_name,
        } as Member,
        paid_for:
            paidFors
                .filter(f => f.expense_id === e.id)
                .map(f => ({
                    member: {
                        id: f.member_id,
                        name: f.paid_for_name,
                    },
                    weight: f.weight,
                }) as PaidFor),
        time: e.time,
    }) as Expense);
}

export const getExchanges = async (project_id: string): Promise<Exchange[]> => {
    return [
        {
            project_id,
            currency: 'JPY',
            rate: 170,
        },
        {
            project_id,
            currency: 'VND',
            rate: 1,
        },
    ];
}

export const getCurrencies = async (): Promise<Currency[]> => {
    return await sql`
        SELECT *
        FROM pay_up.currencies
        ORDER BY currency
    ` as Currency[];
}
