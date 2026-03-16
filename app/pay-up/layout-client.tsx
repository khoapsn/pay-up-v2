'use client';

import { AppBar, Button, Container, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Icon, IconButton, List, ListItemButton, ListItemText, TextField, ThemeProvider, Toolbar, Typography } from "@mui/material";
import { teal as primary } from "@mui/material/colors";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useToast } from "../_libs/contexts";
import { postProject } from "./_libs/data";
import { Project } from "./_libs/models";
import { retrieveProjects } from "./_libs/utils";
import Image from "next/image";

const theme = createTheme({
    palette: {
        primary,
    },
});

export default function LayoutClient({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider theme={theme}>
            <Header />
            <Container maxWidth="md" sx={{ p: 2 }}>
                {children}
            </Container>
        </ThemeProvider>
    );
}

function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const [openNew, setOpenNew] = useState(false);
    const [projects, setProjects] = useState<Project[]>();

    useEffect(() => {
        if (pathname === '/pay-up') {
            const ps = retrieveProjects();

            if (ps.length)
                router.push(`/pay-up/project/${ps[0].id}`);
            else
                setOpenNew(true);
        }
    }, [pathname]);

    return (
        <>
            <AppBar position="fixed" sx={{ zIndex: 2 }}>
                <Toolbar>
                    <Image src={"/images/pay-up.png"} alt="icon" width={50} height={50} />
                    <Typography variant="h6" component="div" fontWeight={700} sx={{ flexGrow: 1, ml: 1 }}>
                        pay up!
                    </Typography>
                    <IconButton onClick={() => setOpenNew(true)} sx={{ color: 'primary.contrastText' }}>
                        <Icon>add</Icon>
                    </IconButton>
                    <IconButton onClick={() => setProjects(retrieveProjects())} sx={{ color: 'primary.contrastText' }}>
                        <Icon>folder</Icon>
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Toolbar />
            {projects &&
                <Dialog open onClose={() => setProjects(undefined)} fullWidth maxWidth="xs">
                    <DialogTitle>Open Project</DialogTitle>
                    <DialogContent dividers>
                        <List>
                            {projects.map((e, i) =>
                                <ListItemButton
                                    key={e.id}
                                    onClick={() => {
                                        router.push(`/pay-up/project/${e.id}`);
                                        setProjects(undefined);
                                    }}
                                    divider={i !== projects.length - 1}
                                >
                                    <ListItemText>{e.title}</ListItemText>
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
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleClick = async () => {
        try {
            setLoading(true);
            const id = await postProject(title);
            router.push(`/pay-up/project/${id}`);
            onClose();
        } catch (e) {
            toast('Error', String(e), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (pathname === '/pay-up') return;
        onClose();
    };

    return (
        <Dialog open onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle>New project</DialogTitle>
            <DialogContent dividers>
                <TextField
                    label="Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleClick}
                    loading={loading}
                    disabled={!title.trim()}
                    variant="contained"
                >
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
}
