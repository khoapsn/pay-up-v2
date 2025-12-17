'use client';

import { AppBar, Box, Container, Toolbar, Typography } from "@mui/material";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <Box sx={{ bgcolor: '#f5f5f5', height: '100vh' }}>
            <Header />
            <Container maxWidth="xs" sx={{ py: 10, px: 5 }}>
                {children}
            </Container>
        </Box>
    );
}

function Header() {
    return (
        <>
            <AppBar position="fixed" sx={{ zIndex: 1 }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        <i>MOOD SWING~</i>
                    </Typography>
                </Toolbar>
            </AppBar>
            <Toolbar />
        </>
    );
}
