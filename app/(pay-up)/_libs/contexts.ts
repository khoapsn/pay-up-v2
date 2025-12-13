import { createContext, useContext } from "react";
import { Project } from "./models";

export const ProjectContext = createContext<Project>({} as Project);

export const useProject = () => useContext(ProjectContext);
