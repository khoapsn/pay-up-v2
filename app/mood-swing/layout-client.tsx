'use client';

import "./styles.css";

import { AppBar, Button, Container, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Icon, IconButton, List, ListItemButton, ListItemText, TextField, ThemeProvider, Toolbar, Typography } from "@mui/material";
import { grey as themeColor } from "@mui/material/colors";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useToast } from "../_libs/contexts";
import { postProfile } from "./_libs/data";
import { Profile } from "./_libs/models";
import { retrieveProfiles } from "./_libs/utils";

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

export default function LayoutClient({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider theme={theme}>
            <Header />
            <Container maxWidth="xs" sx={{ py: 10, px: 5 }}>
                {children}
            </Container>
        </ThemeProvider>
    );
}

function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const [openNew, setOpenNew] = useState(false);
    const [profiles, setProfiles] = useState<Profile[]>();

    useEffect(() => {
        if (pathname === '/mood-swing') {
            const ps = retrieveProfiles();

            if (ps.length)
                router.push(`/mood-swing/profile/${ps[0].id}`);
            else
                setOpenNew(true);
        }
    }, [pathname]);

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
                    <IconButton onClick={() => setProfiles(retrieveProfiles())} sx={{ color: 'primary.contrastText' }}>
                        <Icon>folder</Icon>
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Toolbar />
            {profiles &&
                <Dialog open onClose={() => setProfiles(undefined)} fullWidth maxWidth="xs">
                    <DialogTitle>Open profile</DialogTitle>
                    <DialogContent dividers>
                        <List>
                            {profiles.map(e =>
                                <ListItemButton
                                    key={e.id}
                                    onClick={() => {
                                        router.push(`/mood-swing/profile/${e.id}`);
                                        setProfiles(undefined);
                                    }}
                                    divider
                                >
                                    <ListItemText>{e.name}</ListItemText>
                                </ListItemButton>
                            )}
                        </List>
                    </DialogContent>
                </Dialog>
            }
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
