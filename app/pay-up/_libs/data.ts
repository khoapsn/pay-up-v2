'use server';

import { neon } from "@neondatabase/serverless";
import { Currency, Exchange, Expense, Member, Project } from "./models";

const connectionString = process.env.DATABASE_URL ?? '';
const sql = neon(connectionString);

export const getProject = async (projectId: string): Promise<Project> => {
    const data = await sql`SELECT * FROM pay_up.projects WHERE id=${projectId}`;
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

export const patchProjectCurrency = async (projectId: string, currency: string) => {
    await sql`UPDATE pay_up.projects SET currency=${currency} WHERE id=${projectId}`;
}

export const getMembers = async (projectId: string): Promise<Map<string, Member>> => {
    const data = await sql`
        SELECT *
        FROM pay_up.members
        WHERE project_id=${projectId}
        ORDER BY name
    `;

    const result = new Map<string, Member>();
    data.forEach(e => result.set(e.id, {
        id: e.id,
        name: e.name,
        isActive: e.is_active,
    }));

    return result;
}

export const postMember = async (projectId: string, name: string) => {
    await sql`INSERT INTO pay_up.members (project_id, name) VALUES (${projectId}, ${name.trim()})`;
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

export const getExpenses = async (projectId: string): Promise<Expense[]> => {
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
        WHERE a.project_id=${projectId}
        GROUP BY a.id
        ORDER BY a.time DESC
    `;

    return data.map(e => ({
        id: e.id,
        projectId: e.project_id,
        title: e.title,
        description: e.description,
        amount: Number(e.amount),
        currency: e.currency,
        paidBy: e.paid_by,
        paidFors: e.paid_fors,
        time: e.time,
        isExcluded: e.is_excluded,
        discountType: e.discount_type,
        discountValue: Number(e.discount_value),
    }));
}

export const postExpense = async (expense: Expense, newMembers: Map<string, Member>) => {
    const expenseMembers = [
        ...expense.paidFors.map(f => f.member_id),
        expense.paidBy,
    ];
    const newMembersArr = [...newMembers.values()].filter(e => expenseMembers.includes(e.id));
    for (let i = 0; i < newMembersArr.length; i++) {
        const newNember = newMembersArr[i];
        await sql`
            INSERT INTO pay_up.members (id, project_id, name) 
            VALUES (${newNember.id}, ${expense.projectId}, ${newNember.name})
        `;
    };

    const returning = await sql`
        INSERT INTO pay_up.expenses (project_id, title, amount, currency, paid_by, time, is_excluded, description, discount_value, discount_type)
        VALUES (
            ${expense.projectId},
            ${expense.title || 'Untitled'},
            ${expense.amount},
            ${expense.currency},
            ${expense.paidBy},
            ${expense.time},
            ${expense.isExcluded},
            ${expense.description},
            ${expense.discountValue},
            ${expense.discountType}
        )
        RETURNING id
    `;

    const paidForsArr = expense.paidFors;
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
        ...expense.paidFors.map(f => f.member_id),
        expense.paidBy,
    ];
    const newMembersArr = [...newMembers.values()].filter(e => expenseMembers.includes(e.id));
    for (let i = 0; i < newMembersArr.length; i++) {
        const newNember = newMembersArr[i];
        await sql`
            INSERT INTO pay_up.members (id, project_id, name) 
            VALUES (${newNember.id}, ${expense.projectId}, ${newNember.name})
        `;
    };

    await sql`
        UPDATE pay_up.expenses
        SET
            title=${expense.title || 'Untitled'},
            amount=${expense.amount},
            currency=${expense.currency},
            paid_by=${expense.paidBy},
            time=${expense.time},
            is_excluded=${expense.isExcluded},
            description=${expense.description},
            discount_value=${expense.discountValue},
            discount_type=${expense.discountType}
        WHERE id=${expense.id}
    `;

    await sql`DELETE FROM pay_up.paid_fors WHERE expense_id=${expense.id}`;

    const paidForsArr = expense.paidFors;
    for (let i = 0; i < paidForsArr.length; i++) {
        const paidFor = paidForsArr[i];
        await sql`
            INSERT INTO pay_up.paid_fors (expense_id, member_id, weight)
            VALUES (${expense.id}, ${paidFor.member_id}, ${paidFor.weight})
        `;
    };
}

export const deleteExpense = async (expenseId: string) => {
    await sql`DELETE FROM pay_up.expenses WHERE id=${expenseId}`;
}

export const getExchanges = async (projectId: string): Promise<Exchange[]> => {
    const data = await sql`SELECT * FROM pay_up.exchanges WHERE project_id=${projectId}`;

    return data.map(e => ({
        projectId: e.project_id,
        currency: e.currency,
        rate: Number(e.rate),
    }));
}

export const postExchange = async (projectId: string, currency: string, rate: number) => {
    await sql`INSERT INTO pay_up.exchanges (project_id, currency, rate) VALUES (${projectId}, ${currency}, ${rate})`;
}

export const deleteExchange = async (projectId: string, currency: string) => {
    await sql`DELETE FROM pay_up.exchanges WHERE project_id=${projectId} AND currency=${currency}`;
}

export const getCurrencies = async (): Promise<Currency[]> => {
    return await sql`
        SELECT *
        FROM pay_up.currencies
        ORDER BY currency
    ` as Currency[];
}
