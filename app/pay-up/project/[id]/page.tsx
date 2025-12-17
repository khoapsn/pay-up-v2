'use client';

import { useToast } from "@/app/_libs/contexts";
import { Card, CardContent, CardHeader, Icon, IconButton, LinearProgress, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProjectContext } from "../../_libs/contexts";
import { getProject } from "../../_libs/data";
import { Project } from "../../_libs/models";
import CardExpenses from "./card-expenses";
import DialogProject from "./dialog-project";

export default function Page() {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project>();
    const [open, setOpen] = useState(false);
    const toast = useToast();

    const refresh = async () => {
        try {
            setProject(await getProject(id));
        } catch (e) {
            toast('Error', String(e), 'error');
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    return (
        <>
            {project ?
                <ProjectContext.Provider value={project}>
                    <Stack spacing={2}>
                        <Card>
                            <CardHeader
                                title={project.title}
                                slotProps={{ title: { color: 'primary' } }}
                                subheader={dayjs(project.date).format('MM/DD/YYYY')}
                                action={<IconButton onClick={() => setOpen(true)}><Icon>settings</Icon></IconButton>}
                            />
                            <CardContent>
                                <Typography whiteSpace="pre-line">{project.description}</Typography>
                            </CardContent>
                        </Card>
                        <CardExpenses />
                    </Stack>
                    {open && <DialogProject onSave={refresh} onClose={() => setOpen(false)} />}
                </ProjectContext.Provider>
                :
                <LinearProgress />
            }
        </>
    );
}
