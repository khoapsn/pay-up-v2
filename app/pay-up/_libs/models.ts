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

export enum DiscountType {
    Percent = 'percent',
    Amount = 'amount',
}

export type Expense = {
    id: string,
    projectId: string,
    title: string,
    description?: string,
    amount: number,
    currency: string,
    paidBy: string,
    paidFors: PaidFor[],
    time: Date,
    isExcluded: boolean,
    discountType: DiscountType,
    discountValue: number,
}

export const newExpense = (project: Project): Expense => ({
    id: '',
    projectId: project.id,
    title: '',
    amount: 0,
    currency: project.currency,
    paidBy: '',
    paidFors: [],
    time: new Date(),
    isExcluded: false,
    discountType: DiscountType.Percent,
    discountValue: 0,
})

export const newExcludedExpense = (project: Project, member: Member, amount: number): Expense => ({
    id: '',
    projectId: project.id,
    title: `${member.name} paid`,
    amount,
    currency: project.currency,
    paidBy: member.id,
    paidFors: [],
    time: new Date(),
    isExcluded: true,
    discountType: DiscountType.Percent,
    discountValue: 0,
})

export type PaidFor = {
    member_id: string,
    weight: number,
}

export type Member = {
    id: string,
    name: string,
    isActive: boolean,
}

export type Exchange = {
    projectId: string,
    currency: string,
    rate: number,
}
