import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { Profile, Settings } from "./models";

export const ProfileContext = createContext<Profile>({} as Profile);
export const SettingsStateContext = createContext<[Settings, Dispatch<SetStateAction<Settings>>]>([] as any);

export const useProfile = () => useContext(ProfileContext);
export const useSettingsState = () => useContext(SettingsStateContext);
