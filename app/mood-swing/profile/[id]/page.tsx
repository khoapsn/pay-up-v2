'use client';

import { useToast } from "@/app/_libs/contexts";
import { Button, Dialog, DialogActions, Icon, IconButton, Stack, Typography } from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileContext } from "../../_libs/contexts";
import { getProfile } from "../../_libs/data";
import { Profile } from "../../_libs/models";
import { storeProfile } from "../../_libs/utils";
import CardMoods from "./card-moods";
import DialogOverview from "./dialog-overview";
import DialogSettings from "./dialog-settings";

const defaultViewDate = dayjs().startOf('month');

export default function Page() {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<Profile>();
    const [viewDate, setViewDate] = useState(defaultViewDate);
    const toast = useToast();

    useEffect(() => {
        const init = async () => {
            try {
                const data = await getProfile(id);
                setProfile(data);
                storeProfile(data);
                toast(`Welcome back, ${data.name}`, 'How are we feeling today?')
            } catch (e) {
                toast('Error', String(e), 'error');
            }
        };

        init();
    }, []);

    return (
        <>
            {profile &&
                <ProfileContext.Provider value={profile}>
                    <Stack spacing={3}>
                        <CardMonth
                            viewDate={viewDate}
                            onChange={e => setViewDate(e)}
                        />
                        <CardMoods
                            viewDate={viewDate}
                        />
                        <CardActions
                            viewDate={viewDate}
                            onViewDateChange={e => setViewDate(e)}
                            onSettingsChange={e => setProfile(e)}
                        />
                    </Stack>
                </ProfileContext.Provider>
            }
        </>
    );
}

function CardMonth({
    viewDate,
    onChange,
}: {
    viewDate: Dayjs,
    onChange: (value: Dayjs) => void,
}) {
    return (
        <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
            <IconButton onClick={() => onChange(viewDate.add(-1, 'month'))}>
                <Icon>navigate_before</Icon>
            </IconButton>
            <Typography variant="h5" color="primary" textTransform={"uppercase"}>
                <b>{viewDate.format('MMMM')}</b> {viewDate.year()}
            </Typography>
            <IconButton onClick={() => onChange(viewDate.add(1, 'month'))}>
                <Icon>navigate_next</Icon>
            </IconButton>
        </Stack>
    );
}

function CardActions({
    viewDate,
    onViewDateChange,
    onSettingsChange,
}: {
    viewDate: Dayjs,
    onViewDateChange: (value: Dayjs) => void,
    onSettingsChange: (profile: Profile) => void,
}) {
    const [openCalendar, setOpenCalendar] = useState(false);
    const [openOverview, setOpenOverview] = useState(false);
    const [openSettings, setOpenSettings] = useState(false);

    const handleCalendarChange = (value?: Dayjs | null) => {
        onViewDateChange(value ?? defaultViewDate);
        setOpenCalendar(false);
    };

    return (
        <>
            <Stack direction={"row"} justifyContent={"space-between"}>
                <IconButton onClick={() => setOpenCalendar(true)}>
                    <Icon>today</Icon>
                </IconButton>
                <IconButton onClick={() => setOpenOverview(true)}>
                    <Icon>leaderboard</Icon>
                </IconButton>
                <IconButton onClick={() => setOpenSettings(true)}>
                    <Icon>settings</Icon>
                </IconButton>
            </Stack>
            <Dialog open={openCalendar} onClose={() => setOpenCalendar(false)}>
                <DateCalendar
                    value={viewDate}
                    openTo="month"
                    views={['year', 'month']}
                    onChange={(value, state) => {
                        if (state === 'finish') handleCalendarChange(value);
                    }}
                />
                <DialogActions>
                    <Button onClick={() => handleCalendarChange()} variant="outlined">Today</Button>
                </DialogActions>
            </Dialog>
            {openOverview &&
                <DialogOverview
                    viewDate={viewDate}
                    onChange={e => onViewDateChange(e)}
                    onClose={() => setOpenOverview(false)}
                />
            }
            {openSettings &&
                <DialogSettings
                    onChange={e => onSettingsChange(e)}
                    onClose={() => setOpenSettings(false)}
                />
            }
        </>
    );
}
