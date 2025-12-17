export type ProjectSummary = {
    id: string,
    title: string,
    lastOpened: string,
}

export type Project = {
    id: string,
    title: string,
    description?: string,
    date: Date,
    currencies: {
        base: string,
        others: Currency[],
    },
    members: Member[]
    // createdTime: string,
}

export type Currency = {
    name: string,
    rate: number,
}

export type Expense = {
    id: number,
    title: string,
    amount: number,
    currency: string,
    paidBy: Member,
    paidFor: PaidFor[],
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
}
