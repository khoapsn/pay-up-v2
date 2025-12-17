'use client';

import { useToast } from "@/app/_libs/contexts";
import { LinearProgress } from "@mui/material";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileContext } from "../../_libs/contexts";
import { getProfile } from "../../_libs/data";
import { Profile } from "../../_libs/models";
import CardMoods from "./card-moods";

const today = dayjs();

export default function Page() {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<Profile>();
    const [moods, setMoods] = useState<string[]>((new Array(dayjs(today).daysInMonth())).fill('happy'));
    const toast = useToast();

    const refresh = async () => {
        try {
            setProfile(await getProfile(id));
        } catch (e) {
            toast('Error', String(e), 'error');
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    return (
        <>
            {profile ?
                <ProfileContext.Provider value={profile}>
                    <CardMoods />
                </ProfileContext.Provider>
                :
                <LinearProgress />
            }
        </>
    );
}
