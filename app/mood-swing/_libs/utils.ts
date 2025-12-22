import { Profile } from "./models";

export const storeProfile = (profile: Profile) => {
    const profiles: Profile[] = JSON.parse(localStorage.getItem('profiles') ?? '[]');
    const olders = profiles.filter(e => e.id !== profile.id);
    localStorage.setItem('profiles', JSON.stringify([profile, ...olders]));
};
