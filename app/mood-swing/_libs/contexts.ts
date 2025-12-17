import { createContext, useContext } from "react";
import { Profile } from "./models";

export const ProfileContext = createContext<Profile>({} as Profile);

export const useProfile = () => useContext(ProfileContext);
