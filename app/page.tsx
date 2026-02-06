
'use client';

import { AppBar, Button, Container, Stack, Toolbar, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function Page() {
    const router = useRouter();

    return (
        <>
            <AppBar position="fixed" sx={{ zIndex: 1 }}>
                <Toolbar>
                    <Typography variant="h6" component="div" fontWeight={700} sx={{ flexGrow: 1 }}>
                        pay up!
                    </Typography>
                </Toolbar>
            </AppBar>
            <Container maxWidth="xs" sx={{ py: 10, px: 5 }}>
                <Toolbar />
                <Stack spacing={2}>
                    <Button onClick={() => router.push('/pay-up')} variant="outlined" sx={{ height: '10vh' }}>Pay Up!</Button>
                    <Button onClick={() => router.push('/mood-swing')} variant="outlined" color="secondary" sx={{ height: '10vh' }}>Mood Swing</Button>
                </Stack>
            </Container>
        </>
    );
}
