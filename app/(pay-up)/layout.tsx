'use client';

import { AppBar, Box, Container, Icon, IconButton, Toolbar, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import 'dayjs/locale/vi';
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
            <Container maxWidth="xl">
                <Header />
                {children}
            </Container>
        </LocalizationProvider>
    );
}

function Header() {
    const router = useRouter();

    return (
        <Box flexGrow={1} mb={2}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton onClick={() => router.push('/')} color="inherit"><Icon>home</Icon></IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Pay Up!
                    </Typography>
                    <IconButton color="inherit"><Icon>note_add</Icon></IconButton>
                    <IconButton color="inherit"><Icon>folder</Icon></IconButton>
                </Toolbar>
            </AppBar>
        </Box>
    );
}
