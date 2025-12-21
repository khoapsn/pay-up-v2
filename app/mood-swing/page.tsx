'use client';

import { Button, Stack, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "../_libs/contexts";
import { postProfile } from "./_libs/data";

export default function Page() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleClick = async () => {
        try {
            setLoading(true);
            const id = await postProfile(name);
            router.push(`/mood-swing/profile/${id}`);
        } catch (e) {
            toast('Error', String(e), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const id = localStorage.getItem('profileId');
        if (id)
            router.push(`/mood-swing/profile/${id}`);
        else
            setShow(true);
    }, []);

    return (
        <>
            {show &&
                <Stack spacing={2}>
                    <TextField
                        label="Your name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        fullWidth
                    />
                    <Button onClick={handleClick} loading={loading} variant="contained">Create profile</Button>
                </Stack>
            }
        </>
    );
}
