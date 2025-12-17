'use client';

import { AppBar, Box, Button, Container, CssBaseline, Dialog, DialogActions, DialogContent, DialogTitle, Drawer, Icon, List, ListItemButton, ListItemIcon, ListItemText, TextField, Toolbar, Typography } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { getProjects, postProject } from "./_libs/data";
import { ProjectSummary } from "./_libs/models";
import { useToast } from "../_libs/contexts";

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <Box display="flex" sx={{ bgcolor: '#f5f5f5', height: '100vh' }}>
            <CssBaseline />
            <Header />
            <SideNav />
            <Container>
                <Toolbar sx={{ mb: 2 }} />
                {children}
            </Container>
        </Box>
    );
}

function Header() {
    return (
        <AppBar position="fixed" sx={{ zIndex: 1 }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    <b>PAY UP!</b>
                </Typography>
            </Toolbar>
        </AppBar>
    );
}

function SideNav() {
    const router = useRouter();
    const pathname = usePathname();
    const [projects, setProjects] = useState<ProjectSummary[]>();
    const [open, setOpen] = useState(false);

    const refresh = async () => {
        setProjects(await getProjects());
    };

    useEffect(() => {
        refresh();
    }, []);

    useEffect(() => {
        if (projects?.length === 0) setOpen(true);
    }, [projects]);

    return (
        <>
            <Drawer
                variant="permanent"
                sx={{
                    width: 240,
                    zIndex: 0,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
                }}>
                <Toolbar />
                <Box overflow="auto">
                    {projects &&
                        <List dense>
                            <ListItemButton onClick={() => setOpen(true)}>
                                <ListItemIcon><Icon>control_point</Icon></ListItemIcon>
                                <ListItemText>Create new project</ListItemText>
                            </ListItemButton>
                            {projects.map(e => (
                                <ListItemButton
                                    key={e.id}
                                    onClick={() => router.push(`/pay-up/project/${e.id}`)}
                                    selected={pathname.startsWith(`/pay-up/project/${e.id}`)}
                                >
                                    <ListItemText>
                                        {e.title}
                                    </ListItemText>
                                </ListItemButton>
                            ))}
                        </List>
                    }
                </Box>
            </Drawer>
            {open && <DialogCreate onClose={() => setOpen(false)} />}
        </>
    );
}

function DialogCreate({ onClose }: { onClose: () => void }) {
    const router = useRouter();
    const toast = useToast();
    const [title, setTitle] = useState('');

    const handleSave = async () => {
        try {
            const id = await postProject(title);
            router.push(`/pay-up/project/${id}`);
            onClose();
            toast();
        } catch (e) {
            toast('Error', String(e), 'error');
        }
    };

    return (
        <Dialog open onClose={onClose} fullWidth>
            <DialogTitle>New Project</DialogTitle>
            <DialogContent dividers>
                <TextField
                    label="Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                <Button onClick={handleSave} variant="contained" disabled={!title.trim()}>Save</Button>
            </DialogActions>
        </Dialog>
    );
}
