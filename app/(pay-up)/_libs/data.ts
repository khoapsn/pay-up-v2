'use server';

import { Expense, Project } from "./models";
import { SampleMembers } from "./sample";

export const getProject = async (id: string): Promise<Project> => {
    return {
        id,
        title: 'Japan 2026',
        description: 'Some description here.',
        date: '2026-04-01',
        currencies: {
            base: 'VND',
            others: [
                { name: 'THB', rate: 800 },
                { name: 'JPY', rate: 170 },
            ],
        },
        members: SampleMembers,
        // createdTime: '2025-12-11 10:00:00',
    };
}

export const postProject = async () => {

}

export const patchProject = async (project: Project) => {

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
