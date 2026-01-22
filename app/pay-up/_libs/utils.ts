import { DiscountType, Exchange, Project } from "./models";

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
