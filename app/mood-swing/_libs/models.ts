export type Profile = {
    id: string,
    name: string,
}

export type Mood = {
    profileId: string,
    date: string,
    value: MoodValue,
}

export enum MoodValue {
    Joyful = 'joyful',
    Neutral = 'neutral',
    Sad = 'sad',
    Tired = 'tired',
    Angry = 'angry',
}

export type MoodValueOption = {
    value: MoodValue,
    color: string,
}

export const moodValueOptions: MoodValueOption[] = [
    { value: MoodValue.Joyful, color: '#ffcc00' },
    { value: MoodValue.Neutral, color: '#35c759' },
    { value: MoodValue.Sad, color: '#027aff' },
    { value: MoodValue.Tired, color: '#af52de' },
    { value: MoodValue.Angry, color: '#ff3b30' },
]

export type Settings = {
    weekStartOnSunday: boolean,
}
