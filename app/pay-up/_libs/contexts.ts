import { createContext, useContext } from "react";
import { Exchange, Expense, Member, Project } from "./models";

export const ProjectContext = createContext<Project>({} as Project);
export const MembersContext = createContext<Map<string, Member>>(new Map());
export const ExchangesContext = createContext<Exchange[]>([]);
export const ExpensesContext = createContext<Expense[]>([]);

export const useProject = () => useContext(ProjectContext);
export const useMembers = () => useContext(MembersContext);
export const useExchanges = () => useContext(ExchangesContext);
export const useExpenses = () => useContext(ExpensesContext);
