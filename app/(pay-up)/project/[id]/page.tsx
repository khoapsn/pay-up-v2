'use client';

import { Card, CardContent, CardHeader, Icon, IconButton, Skeleton, Stack, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Project } from "../../_libs/models";
import CardExpenses from "./card-expenses";
import { getProject } from "../../_libs/data";
import { ProjectContext } from "../../_libs/contexts";
import dayjs from "dayjs";
import DialogProject from "./dialog-project";

export default function Page() {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project>();
    const [open, setOpen] = useState(false);

    const refresh = async () => {
        try {
            setProject(await getProject(id));
        } catch (e) {

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
                                slotProps={{ title: { color: 'primary', variant: 'h4' } }}
                                subheader={dayjs(project.date).format('MM/DD/YYYY')}
                                action={<IconButton onClick={() => setOpen(true)}><Icon>settings</Icon></IconButton>}
                            />
                            <CardContent>
                                <Typography>{project.description}</Typography>
                            </CardContent>
                        </Card>
                        <CardExpenses />
                    </Stack>
                    {open && <DialogProject onClose={() => setOpen(false)} />}
                </ProjectContext.Provider>
                :
                <Skeleton />
            }
        </>
    );
}
