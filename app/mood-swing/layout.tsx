'use client';

import { AppBar, Box, Container, createTheme, ThemeProvider, Toolbar, Typography } from "@mui/material";
import { grey as themeColor } from "@mui/material/colors";
import { ReactNode, useEffect, useState } from "react";
import { SettingsStateContext } from "./_libs/contexts";
import { Settings } from "./_libs/models";

const theme = createTheme({
    palette: {
        primary: {
            ...themeColor,
            "main": themeColor[800],
            "light": themeColor[300],
        },
    },
    components: {
        MuiIconButton: {
            defaultProps: {
                sx: {
                    color: themeColor[800],
                },
            },
        },
    },
});

export default function Layout({ children }: { children: ReactNode }) {
    const settingsState = useState<Settings>({});
    const [settings, setSettings] = settingsState;
    const ready = !!settings;

    useEffect(() => {
        setSettings({});
    }, []);

    return (
        <ThemeProvider theme={theme}>
            {ready &&
                <SettingsStateContext value={settingsState}>
                    <Box sx={{ bgcolor: themeColor[100], height: '100vh' }}>
                        <Header />
                        <Container maxWidth="xs" sx={{ py: 10, px: 5 }}>
                            {children}
                        </Container>
                    </Box>
                </SettingsStateContext>
            }
        </ThemeProvider>
    );
}

function Header() {
    return (
        <>
            <AppBar position="fixed" sx={{ zIndex: 1 }}>
                <Toolbar>
                    <Typography variant="h6" component="div" fontWeight={700} sx={{ flexGrow: 1 }}>
                        mood swing
                    </Typography>
                </Toolbar>
            </AppBar>
            <Toolbar />
        </>
    );
}
