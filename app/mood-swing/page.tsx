'use client';

import { Button, Stack, TextField } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useToast } from "../_libs/contexts";
import { postProfile } from "./_libs/data";
import { retrieveProfiles } from "./_libs/utils";

export default function Page() {
    return (
        <Suspense>
            <Content />
        </Suspense>
    );
}

function Content() {
    const params = useSearchParams();
    const router = useRouter();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const toast = useToast();

    useEffect(() => {
        if (params.get('create') !== '1') {
            const id = retrieveProfiles()[0]?.id;
            if (id) {
                router.push(`/mood-swing/profile/${id}`);
                return;
            }
        }

        setShow(true);
    }, []);

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
