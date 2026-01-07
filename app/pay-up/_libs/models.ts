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
    id: number,
    title: string,
    amount: number,
    currency: string,
    paid_by: Member,
    paid_for: PaidFor[],
    time: string,
    // createdTime: string,
}

export type PaidFor = {
    member: Member,
    weight: number,
}

export type Member = {
    id: number,
    name: string,
    active: boolean,
}

export type Exchange = {
    project_id: string,
    currency: string,
    rate: number,
}
