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
    { value: MoodValue.Joyful, color: '#ffeb3b' },
    { value: MoodValue.Neutral, color: '#8bc34a' },
    { value: MoodValue.Sad, color: '#2196f3' },
    { value: MoodValue.Tired, color: '#673ab7' },
    { value: MoodValue.Angry, color: '#f44336' },
]
