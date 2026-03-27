import { DiscountType, Exchange, Expense, Project } from "./models";

export const storeProject = (project: Project) => {
    const projects = retrieveProjects();
    const olders = projects.filter(e => e.id !== project.id);
    localStorage.setItem('projects', JSON.stringify([{
        id: project.id,
        title: project.title,
    }, ...olders]));
}

export const retrieveProjects = (): Project[] => {
    return (JSON.parse(localStorage.getItem('projects') ?? '[]'));
}

export const convertAmount = (amount: number, from: string, to: string, exchanges: Exchange[]): number => {
    if (from === to) return amount;
    const fromRate = exchanges.find(e => e.currency === from)?.rate || 1;
    const toRate = exchanges.find(e => e.currency === to)?.rate || 1;
    return amount * fromRate / toRate;
}

export const getAmountAfterDiscount = (amount: number, discountValue: number, discountType: DiscountType): number => {
    if (discountType === DiscountType.Amount)
        return amount - discountValue;
    else if (discountType === DiscountType.Percent)
        return amount * (100 - discountValue) / 100;
    else
        return amount;
}

export const getTotalSpent = (expenses: Expense[], baseCurrency: string, exchanges: Exchange[]): number => {
    return expenses
        .filter(e => !e.isExcluded)
        .reduce((p, c) => p + convertAmount(getAmountAfterDiscount(c.amount, c.discountValue, c.discountType), c.currency, baseCurrency, exchanges), 0);
}

export const getTotalPaidOf = (memberId: string, expenses: Expense[], baseCurrency: string, exchanges: Exchange[]): number => {
    return expenses
        .filter(e => e.paidBy === memberId)
        .reduce((p, c) => p + convertAmount(getAmountAfterDiscount(c.amount, c.discountValue, c.discountType), c.currency, baseCurrency, exchanges), 0);
}

export const getTotalSpentOf = (memberId: string, expenses: Expense[], baseCurrency: string, exchanges: Exchange[], isFiltered: boolean = false): number => {
    return expenses
        .filter(e => !(isFiltered && e.isExcluded))
        .reduce((p, c) => p + getSpentOf(memberId, c, baseCurrency, exchanges), 0);
}

export const getSpentOf = (memberId: string, expense: Expense, toCurrency: string, exchanges: Exchange[] = []): number => {
    const totalWeight = expense.paidFors.reduce((p, c) => p + c.weight, 0);
    const ratio = (expense.paidFors.find(e => e.member_id === memberId)?.weight ?? 0) / totalWeight;
    const amountOf = getAmountAfterDiscount(expense.amount, expense.discountValue, expense.discountType) * ratio;
    return convertAmount(amountOf, expense.currency, toCurrency, exchanges);
}

export const getBalanceOf = (memberId: string, expenses: Expense[], baseCurrency: string, exchanges: Exchange[]): number => {
    const value = getTotalPaidOf(memberId, expenses, baseCurrency, exchanges) - getTotalSpentOf(memberId, expenses, baseCurrency, exchanges);
    return Math.abs(value) >= 0.1 ? value : 0;
}
