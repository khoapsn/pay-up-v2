
'use client';

import { Button, Container, Toolbar } from "@mui/material";
import { useRouter } from "next/navigation";

export default function Page() {
    const router = useRouter();

    return (
        <Container>
            <Toolbar />
            <Button onClick={() => router.push('/pay-up')}>Pay Up!</Button>
            <Button onClick={() => router.push('/mood-swing')}>Mood Swing~</Button>
        </Container>
    );
}
