'use client';

import { AppBar, Box, Container, CssBaseline, Divider, Drawer, Icon, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Toolbar, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { getProjects } from "./_libs/data";
import { ProjectSummary } from "./_libs/models";

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
            <Box display="flex" sx={{ bgcolor: '#f5f5f5', height: '100vh' }}>
                <CssBaseline />
                <Header />
                <SideNav />
                <Container>
                    <Toolbar sx={{ mb: 2 }} />
                    {children}
                </Container>
            </Box>
        </LocalizationProvider>
    );
}

function Header() {
    return (
        <AppBar position="fixed" sx={{ zIndex: 1 }}>
            <Toolbar>
                {/* <IconButton onClick={() => router.push('/')} color="inherit"><Icon>home</Icon></IconButton> */}
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    <b>PAY UP!</b>
                </Typography>
                {/* <IconButton color="inherit"><Icon>note_add</Icon></IconButton>
                <IconButton color="inherit"><Icon>folder</Icon></IconButton> */}
            </Toolbar>
        </AppBar>
    );
}

function SideNav() {
    const router = useRouter();
    const pathname = usePathname();
    const [projects, setProjects] = useState<ProjectSummary[]>();

    const refresh = async () => {
        setProjects(await getProjects());
    };

    useEffect(() => {
        refresh();
    }, []);

    return (
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
                        {/* <ListItemButton>
                            <ListItemIcon><Icon>settings</Icon></ListItemIcon>
                            <ListItemText>Settings</ListItemText>
                        </ListItemButton> */}
                        {/* <ListSubheader>Your projects</ListSubheader> */}
                        {/* <Divider /> */}
                        <ListItemButton>
                            <ListItemIcon><Icon>control_point</Icon></ListItemIcon>
                            <ListItemText>Create new project</ListItemText>
                        </ListItemButton>
                        {projects.map(e => (
                            <ListItemButton
                                key={e.id}
                                onClick={() => router.push(`/project/${e.id}`)}
                                selected={pathname.startsWith(`/project/${e.id}`)}
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
    );
}
