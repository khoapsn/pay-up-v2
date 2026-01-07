import { createContext, useContext } from "react";
import { Currency, Exchange, Member, Project } from "./models";

export const ProjectContext = createContext<Project>({} as Project);
export const MembersContext = createContext<Member[]>([]);
export const ExchangesContext = createContext<Exchange[]>([]);
export const CurrenciesContext = createContext<Currency[]>([]);

export const useProject = () => useContext(ProjectContext);
export const useMembers = () => useContext(MembersContext);
export const useExchanges = () => useContext(ExchangesContext);
export const useCurrencies = () => useContext(CurrenciesContext);
