export type Profile = {
    id: string,
    name: string,
    week_start_on_sunday: boolean,
}

export type Mood = {
    profile_id: string,
    date: string,
    value: MoodValue,
}

export enum MoodValue {
    Energetic = 'energetic',
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
    { value: MoodValue.Energetic, color: 'orange' },
    { value: MoodValue.Joyful, color: '#ffcc00' },
    { value: MoodValue.Neutral, color: '#35c759' },
    { value: MoodValue.Sad, color: '#027aff' },
    { value: MoodValue.Tired, color: '#af52de' },
    { value: MoodValue.Angry, color: '#ff3b30' },
]

export type Settings = {
    test?: boolean,
}
