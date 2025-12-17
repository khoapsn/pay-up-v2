export type Profile = {
    id: string,
    name: string,
}

export type Mood = {
    profileId: string,
    date: Date,
    value: MoodValue,
}

export enum MoodValue {
    Happy = 'happy',
    Sad = 'sad',
    Angry = 'angry',
}
