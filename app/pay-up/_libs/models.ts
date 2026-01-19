
export type Project = {
    id: string,
    title: string,
    description?: string,
    date: Date,
    currency: string,
}

export type Currency = {
    currency: string,
}

export type Expense = {
    id: string,
    project_id: string,
    title: string,
    description?: string,
    amount: number,
    currency: string,
    paid_by: string,
    paid_fors: PaidFor[],
    time: Date,
    is_excluded: boolean,
}

export const newExpense = (project: Project): Expense => ({
    id: '',
    project_id: project.id,
    title: '',
    amount: 0,
    currency: project.currency,
    paid_by: '',
    paid_fors: [],
    time: new Date(),
    is_excluded: false,
})

export type PaidFor = {
    member_id: string,
    weight: number,
}

export type Member = {
    id: string,
    name: string,
    is_active: boolean,
}

export type Exchange = {
    project_id: string,
    currency: string,
    rate: number,
}
