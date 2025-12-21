'use client';

import { useToast } from "@/app/_libs/contexts";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileContext } from "../../_libs/contexts";
import { getProfile } from "../../_libs/data";
import { Profile } from "../../_libs/models";
import CardMoods from "./card-moods";
import DialogSettings from "./dialog-settings";

export default function Page() {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<Profile>();
    const [openSettings, setOpenSettings] = useState(false);
    const toast = useToast();

    const refresh = async () => {
        try {
            setProfile(await getProfile(id));
        } catch (e) {
            toast('Error', String(e), 'error');
        }
    };

    useEffect(() => {
        localStorage.setItem('profileId', id);
    }, []);

    useEffect(() => {
        refresh();
    }, []);

    return (
        <>
            {profile &&
                <ProfileContext.Provider value={profile}>
                    <CardMoods onOpenSettings={() => setOpenSettings(true)} />
                    {openSettings &&
                        <DialogSettings onClose={() => setOpenSettings(false)} />
                    }
                </ProfileContext.Provider>
            }
        </>
    );
}
