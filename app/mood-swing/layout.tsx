'use client';

import { AppBar, Box, Button, Container, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Icon, IconButton, List, ListItemButton, ListItemText, TextField, ThemeProvider, Toolbar, Typography } from "@mui/material";
import { grey as themeColor } from "@mui/material/colors";
import { ReactNode, useEffect, useState } from "react";
import { SettingsStateContext } from "./_libs/contexts";
import { Profile, Settings } from "./_libs/models";
import { usePathname, useRouter } from "next/navigation";
import { retrieveProfiles } from "./_libs/utils";
import { postProfile } from "./_libs/data";
import { useToast } from "../_libs/contexts";

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
    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ bgcolor: themeColor[100] }}>
                <Header />
                <Container maxWidth="xs" sx={{ py: 10, px: 5 }}>
                    {children}
                </Container>
            </Box>
        </ThemeProvider>
    );
}

function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [openNew, setOpenNew] = useState(false);
    const [profiles, setProfiles] = useState<Profile[]>([]);

    useEffect(() => {
        if (pathname === '/mood-swing') {
            const ps = retrieveProfiles();

            if (ps.length)
                router.push(`/mood-swing/profile/${ps[0].id}`);
            else
                setOpenNew(true);
        }
    }, [pathname]);

    useEffect(() => {
        if (open) setProfiles(retrieveProfiles());
    }, [open]);

    return (
        <>
            <AppBar position="fixed" sx={{ zIndex: 1 }}>
                <Toolbar>
                    <Typography variant="h6" component="div" fontWeight={700} sx={{ flexGrow: 1 }}>
                        mood swing
                    </Typography>
                    <IconButton onClick={() => setOpenNew(true)} sx={{ color: 'primary.contrastText' }}>
                        <Icon>add</Icon>
                    </IconButton>
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
            {openNew &&
                <DialogNew onClose={() => setOpenNew(false)} />
            }
        </>
    );
}

function DialogNew({ onClose }: { onClose: () => void }) {
    const router = useRouter();
    const pathname = usePathname();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleClick = async () => {
        try {
            setLoading(true);
            const id = await postProfile(name);
            router.push(`/mood-swing/profile/${id}`);
            onClose();
        } catch (e) {
            toast('Error', String(e), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (pathname === '/mood-swing') return;
        onClose();
    };

    return (
        <Dialog open onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle>Create a profile</DialogTitle>
            <DialogContent dividers>
                <TextField
                    label="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleClick}
                    loading={loading}
                    disabled={!name.trim()}
                    variant="contained"
                >
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    )
}
