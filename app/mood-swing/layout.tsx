'use client';

import { AppBar, Box, Container, createTheme, Dialog, DialogContent, DialogTitle, Icon, IconButton, List, ListItemButton, ListItemText, ThemeProvider, Toolbar, Typography } from "@mui/material";
import { grey as themeColor } from "@mui/material/colors";
import { ReactNode, useEffect, useState } from "react";
import { SettingsStateContext } from "./_libs/contexts";
import { Profile, Settings } from "./_libs/models";
import { usePathname, useRouter } from "next/navigation";

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
                    <Box sx={{ bgcolor: themeColor[100] }}>
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
    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [profiles, setProfiles] = useState<Profile[]>([]);

    useEffect(() => {
        if (open) setProfiles(JSON.parse(localStorage.getItem('profiles') ?? '[]'));
    }, [open]);

    return (
        <>
            <AppBar position="fixed" sx={{ zIndex: 1 }}>
                <Toolbar>
                    <Typography variant="h6" component="div" fontWeight={700} sx={{ flexGrow: 1 }}>
                        mood swing
                    </Typography>
                    {pathname !== '/mood-swing' && <IconButton onClick={() => router.push('/mood-swing')} sx={{ color: 'primary.contrastText' }}>
                        <Icon>add</Icon>
                    </IconButton>}
                    <IconButton onClick={() => setOpen(true)} sx={{ color: 'primary.contrastText' }}>
                        <Icon>folder</Icon>
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Toolbar />
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Who are you, really?</DialogTitle>
                <DialogContent dividers>
                    <List>
                        {profiles.map(e =>
                            <ListItemButton
                                key={e.id}
                                onClick={() => {
                                    router.push(`/mood-swing/profile/${e.id}`);
                                    setOpen(false);
                                }}
                                divider
                            >
                                <ListItemText>{e.name}</ListItemText>
                            </ListItemButton>
                        )}
                    </List>
                </DialogContent>
            </Dialog>
        </>
    );
}
