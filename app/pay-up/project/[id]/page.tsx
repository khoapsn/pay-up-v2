'use client';

import { useToast } from "@/app/_libs/contexts";
import { Card, CardContent, CardHeader, Icon, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ExchangesContext, MembersContext, ProjectContext, useProject } from "../../_libs/contexts";
import { getExchanges, getMembers, getProject } from "../../_libs/data";
import { Exchange, Member, Project } from "../../_libs/models";
import { storeProject } from "../../_libs/utils";
import CardExpenses from "./card-expenses";
import DialogCurrencies from "./dialog-currencies";
import DialogMembers from "./dialog-members";
import DialogSettings from "./dialog-settings";

export default function Page() {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project>();
    const [members, setMembers] = useState<Map<string, Member>>();
    const [exchanges, setExchanges] = useState<Exchange[]>();
    const toast = useToast();

    const refresh = async () => {
        try {
            const data = await getProject(id);
            setProject(data);
            storeProject(data);
        } catch (e) {
            toast('Error', String(e), 'error');
        }
    };

    const refreshMembers = async () => {
        try {
            setMembers(await getMembers(id));
        } catch (e) {
            toast('Error', String(e), 'error');
        }
    };

    const refreshExchanges = async () => {
        try {
            setExchanges(await getExchanges(id));
        } catch (e) {
            toast('Error', String(e), 'error');
        }
    };

    useEffect(() => {
        refresh();
        refreshMembers();
        refreshExchanges();
    }, []);

    return (
        <>
            {project && members && exchanges &&
                <ProjectContext.Provider value={project}>
                    <MembersContext.Provider value={members}>
                        <ExchangesContext.Provider value={exchanges}>
                            <Stack spacing={2}>
                                <CardProject
                                    onChangeProject={refresh}
                                    onChangeMembers={refreshMembers}
                                    onChangeExchanges={refreshExchanges}
                                />
                                <CardExpenses
                                    onChangeMembers={refreshMembers}
                                />
                            </Stack>
                        </ExchangesContext.Provider>
                    </MembersContext.Provider>
                </ProjectContext.Provider>
            }
        </>
    );
}

function CardProject({
    onChangeProject,
    onChangeMembers,
    onChangeExchanges,
}: {
    onChangeProject: () => Promise<void>,
    onChangeMembers: () => Promise<void>,
    onChangeExchanges: () => Promise<void>,
}) {
    const project = useProject();
    const [open, setOpen] = useState(false);
    const [openMembers, setOpenMembers] = useState(false);
    const [openCurrs, setOpenCurrs] = useState(false);

    return (
        <>
            <Card>
                <CardHeader
                    title={project.title}
                    subheader={dayjs(project.date).format('DD/MM/YYYY')}
                    slotProps={{ title: { color: 'primary' } }}
                    action={
                        <Stack direction={"row"}>
                            <Tooltip title="Currencies">
                                <IconButton onClick={() => setOpenCurrs(true)}><Icon>paid</Icon></IconButton>
                            </Tooltip>
                            <Tooltip title="Members">
                                <IconButton onClick={() => setOpenMembers(true)}><Icon>people_alt</Icon></IconButton>
                            </Tooltip>
                            <Tooltip title="Settings">
                                <IconButton onClick={() => setOpen(true)}><Icon>settings</Icon></IconButton>
                            </Tooltip>
                        </Stack>
                    }
                />
                <CardContent>
                    <Typography whiteSpace="pre-line">{project.description}</Typography>
                </CardContent>
            </Card>
            {open &&
                <DialogSettings
                    onSave={onChangeProject}
                    onClose={() => setOpen(false)}
                />
            }
            {openMembers &&
                <DialogMembers
                    onChange={onChangeMembers}
                    onClose={() => setOpenMembers(false)}
                />
            }
            {openCurrs &&
                <DialogCurrencies
                    onChange={onChangeProject}
                    onChangeExchanges={onChangeExchanges}
                    onClose={() => setOpenCurrs(false)}
                />
            }
        </>
    );
}
