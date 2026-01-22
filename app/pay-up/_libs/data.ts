'use server';

import { neon } from "@neondatabase/serverless";
import { Currency, Exchange, Expense, Member, Project } from "./models";

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

export const getMembers = async (project_id: string): Promise<Map<string, Member>> => {
    const data = await sql`
        SELECT *
        FROM pay_up.members
        WHERE project_id=${project_id}
        ORDER BY name
    `;

    const result = new Map<string, Member>();
    data.forEach(e => result.set(e.id, e as Member));

    return result;
}

export const postMember = async (project_id: string, name: string) => {
    await sql`INSERT INTO pay_up.members (project_id, name) VALUES (${project_id}, ${name.trim()})`;
}

export const patchMemberName = async (member_id: string, name: string) => {
    await sql`UPDATE pay_up.members SET name=${name} WHERE id=${member_id}`;
}

export const patchMemberIsActive = async (member_id: string, is_active: boolean) => {
    await sql`UPDATE pay_up.members SET is_active=${is_active} WHERE id=${member_id}`;
}

export const deleteMember = async (member_id: string) => {
    await sql`DELETE FROM pay_up.members WHERE id=${member_id}`;
}

export const getExpenses = async (project_id: string): Promise<Expense[]> => {
    const data = await sql`
        SELECT
            a.*,
            COALESCE(
                json_agg(
                    json_build_object('member_id', b.member_id, 'weight', b.weight)
                ) FILTER (WHERE b.member_id IS NOT NULL),
                '[]'
            ) AS paid_fors
        FROM pay_up.expenses a
        LEFT JOIN pay_up.paid_fors b ON a.id=b.expense_id
        WHERE a.project_id=${project_id}
        GROUP BY a.id
        ORDER BY a.time DESC
    `;

    return data.map(e => {
        const expense: Expense = {
            id: e.id,
            project_id: e.project_id,
            title: e.title,
            description: e.description,
            amount: Number(e.amount),
            currency: e.currency,
            paid_by: e.paid_by,
            paid_fors: e.paid_fors,
            time: e.time,
            is_excluded: e.is_excluded,
            discount_type: e.discount_type,
            discount_value: Number(e.discount_value),
        };

        return expense;
    })
}

export const postExpense = async (expense: Expense, newMembers: Map<string, Member>) => {
    const expenseMembers = [
        ...expense.paid_fors.map(f => f.member_id),
        expense.paid_by,
    ];
    const newMembersArr = [...newMembers.values()].filter(e => expenseMembers.includes(e.id));
    for (let i = 0; i < newMembersArr.length; i++) {
        const newNember = newMembersArr[i];
        await sql`
            INSERT INTO pay_up.members (id, project_id, name) 
            VALUES (${newNember.id}, ${expense.project_id}, ${newNember.name})
        `;
    };

    const returning = await sql`
        INSERT INTO pay_up.expenses (project_id, title, amount, currency, paid_by, time, is_excluded, description, discount_value, discount_type)
        VALUES (
            ${expense.project_id},
            ${expense.title || 'Untitled'},
            ${expense.amount},
            ${expense.currency},
            ${expense.paid_by},
            ${expense.time},
            ${expense.is_excluded},
            ${expense.description},
            ${expense.discount_value},
            ${expense.discount_type}
        )
        RETURNING id
    `;

    const paidForsArr = expense.paid_fors;
    for (let i = 0; i < paidForsArr.length; i++) {
        const paidFor = paidForsArr[i];
        await sql`
            INSERT INTO pay_up.paid_fors (expense_id, member_id, weight)
            VALUES (${returning[0].id}, ${paidFor.member_id}, ${paidFor.weight})
        `;
    };
}

export const patchExpense = async (expense: Expense, newMembers: Map<string, Member>) => {
    const expenseMembers = [
        ...expense.paid_fors.map(f => f.member_id),
        expense.paid_by,
    ];
    const newMembersArr = [...newMembers.values()].filter(e => expenseMembers.includes(e.id));
    for (let i = 0; i < newMembersArr.length; i++) {
        const newNember = newMembersArr[i];
        await sql`
            INSERT INTO pay_up.members (id, project_id, name) 
            VALUES (${newNember.id}, ${expense.project_id}, ${newNember.name})
        `;
    };

    await sql`
        UPDATE pay_up.expenses
        SET
            title=${expense.title || 'Untitled'},
            amount=${expense.amount},
            currency=${expense.currency},
            paid_by=${expense.paid_by},
            time=${expense.time},
            is_excluded=${expense.is_excluded},
            description=${expense.description},
            discount_value=${expense.discount_value},
            discount_type=${expense.discount_type}
        WHERE id=${expense.id}
    `;

    await sql`DELETE FROM pay_up.paid_fors WHERE expense_id=${expense.id}`;

    const paidForsArr = expense.paid_fors;
    for (let i = 0; i < paidForsArr.length; i++) {
        const paidFor = paidForsArr[i];
        await sql`
            INSERT INTO pay_up.paid_fors (expense_id, member_id, weight)
            VALUES (${expense.id}, ${paidFor.member_id}, ${paidFor.weight})
        `;
    };
}

export const deleteExpense = async (expense_id: string) => {
    await sql`DELETE FROM pay_up.expenses WHERE id=${expense_id}`;
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
