import { useToast } from "@/app/_libs/contexts";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Icon, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { useProfile } from "../../_libs/contexts";
import { getMoods } from "../../_libs/data";
import { Mood, moodValueOptions } from "../../_libs/models";

const today = dayjs().startOf('day');
const defaultViewDate = dayjs().startOf('month');

export default function CardMoods() {
    const profile = useProfile();
    const [viewDate, setViewDate] = useState(defaultViewDate);
    const [moods, setMoods] = useState<Mood[]>([]);
    const [openCalendar, setOpenCalendar] = useState(false);
    const [pickedDate, setPickedDate] = useState<Dayjs>();
    const toast = useToast();

    const dots: (Dayjs | null)[] = [
        ...Array(viewDate.day()).fill(null),
        ...[...Array(viewDate.daysInMonth())].map((e, i) => viewDate.date(i + 1)),
        ...Array(8).fill(null),
    ];

    const refresh = async () => {
        try {
            setMoods(await getMoods(profile.id, viewDate.month() + 1, viewDate.year()));
        } catch (e) {
            toast('Error', String(e), 'error');
        }
    };

    useEffect(() => {
        refresh();
    }, [viewDate]);

    const changeViewDate = (value?: Dayjs | null) => {
        setViewDate(value ?? defaultViewDate);
        setOpenCalendar(false);
        setMoods([]);
    };

    return (
        <>
            <Stack spacing={3}>
                <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
                    <IconButton onClick={() => changeViewDate(viewDate.add(-1, 'month'))}>
                        <Icon>navigate_before</Icon>
                    </IconButton>
                    <Typography variant="h5" color="primary" textTransform={"uppercase"}>
                        <b>{viewDate.format('MMMM')}</b> {viewDate.year()}
                    </Typography>
                    <IconButton onClick={() => changeViewDate(viewDate.add(1, 'month'))}>
                        <Icon>navigate_next</Icon>
                    </IconButton>
                </Stack>
                <Stack spacing={2.5}>
                    {Array(6).fill(0).map((_, i) => (
                        <Stack key={i} direction={"row"} justifyContent={"space-between"}>
                            {dots.slice(7 * i, 7 * (i + 1)).map((f, j) =>
                                <Box key={j}>
                                    {f ?
                                        <IconButton
                                            onClick={() => setPickedDate(f)}
                                            sx={{ p: 0, opacity: f ? 1 : 0 }}
                                            disabled={f?.isAfter(today)}
                                        >
                                            <p>{f?.isAfter(today) ? 'primary.light' :
                                                (moodValueOptions.find(h => h.value === moods.find(g => dayjs(g.date).isSame(f))?.value)?.color || 'primary.main')}
                                            </p>
                                            <p>
                                                {`${moodValueOptions.find(h => h.value === moods.find(g => dayjs(g.date).isSame(f))?.value)?.color}`}
                                            </p>
                                            <p>{`${moods.find(g => dayjs(g.date).isSame(f))?.value}`}</p>
                                            <Icon
                                                sx={{
                                                    color:
                                                        f?.isAfter(today) ? 'primary.light' :
                                                            (moodValueOptions.find(h => h.value === moods.find(g => dayjs(g.date).isSame(f))?.value)?.color || 'primary.main')
                                                }}
                                                fontSize="large"
                                            >
                                                {f.isSame(today, 'day') ? 'stars' : 'circle'}
                                            </Icon>
                                        </IconButton>
                                        :
                                        <IconButton sx={{ p: 0 }} disabled><Icon fontSize="large"></Icon></IconButton>
                                    }
                                </Box>
                            )}
                        </Stack>
                    ))}
                </Stack>
                <Stack direction={"row"} justifyContent={"space-between"}>
                    <IconButton onClick={() => setOpenCalendar(true)}>
                        <Icon>event</Icon>
                    </IconButton>
                    <IconButton><Icon>leaderboard</Icon></IconButton>
                    <IconButton><Icon>settings</Icon></IconButton>
                </Stack>
            </Stack>
            <Dialog open={openCalendar} onClose={() => setOpenCalendar(false)}>
                <DateCalendar
                    value={viewDate}
                    views={['year', 'month']}
                    onChange={(value, state) => {
                        if (state === 'finish') changeViewDate(value);
                    }}
                />
                <DialogActions>
                    <Button onClick={() => changeViewDate()} variant="outlined">Today</Button>
                </DialogActions>
            </Dialog>
            {pickedDate &&
                <DialogMoodPicker
                    pickedDate={pickedDate}
                    mood={moods.find(e => dayjs(e.date).isSame(pickedDate, 'day'))}
                    onClose={() => setPickedDate(undefined)}
                />
            }
        </>
    );
}

function DialogMoodPicker({
    mood,
    pickedDate,
    onClose,
}: {
    mood?: Mood,
    pickedDate: Dayjs,
    onClose: () => void,
}) {
    return (
        <Dialog open onClose={onClose} fullWidth>
            <DialogTitle>Set the mood</DialogTitle>
            <DialogContent dividers>
                <List>
                    {moodValueOptions.map(e =>
                        <ListItemButton key={e.value}>
                            <ListItemIcon>
                                <Icon fontSize="large" sx={{ color: e.color }}>
                                    {e.value === mood?.value ? 'check_circle' : 'circle'}
                                </Icon>
                            </ListItemIcon>
                            <ListItemText sx={{ textTransform: 'capitalize' }}>{e.value}</ListItemText>
                        </ListItemButton>
                    )}
                </List>
            </DialogContent>
        </Dialog>
    );
}
