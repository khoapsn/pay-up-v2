import { Profile } from "./models";

export const storeProfile = (profile: Profile) => {
    const profiles = retrieveProfiles();
    const olders = profiles.filter(e => e.id !== profile.id);
    localStorage.setItem('profiles', JSON.stringify([profile, ...olders]));
};

export const retrieveProfiles = (): Profile[] => {
    return (JSON.parse(localStorage.getItem('profiles') ?? '[]'));
}