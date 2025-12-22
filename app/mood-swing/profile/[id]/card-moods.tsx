import { useToast } from "@/app/_libs/contexts";
import { Box, Dialog, DialogContent, DialogTitle, Icon, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Stack } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { useProfile } from "../../_libs/contexts";
import { deleteMood, getMoods, putMood } from "../../_libs/data";
import { Mood, MoodValue, moodValueOptions } from "../../_libs/models";

export const today = dayjs().startOf('day');

export default function CardMoods({ viewDate }: { viewDate: Dayjs }) {
    const profile = useProfile();
    const [moods, setMoods] = useState<Mood[]>([]);
    const [pickedDate, setPickedDate] = useState<Dayjs>();
    const toast = useToast();

    const dots: (Dayjs | null)[] = [
        ...Array((profile.week_start_on_sunday ? viewDate.day() : (viewDate.day() || 7) - 1)).fill(null),
        ...[...Array(viewDate.daysInMonth())].map((e, i) => viewDate.date(i + 1)),
        ...Array(8).fill(null),
    ];

    const refresh = async () => {
        try {
            setMoods(await getMoods(profile.id, viewDate.year(), viewDate.month() + 1));
        } catch (e) {
            toast('Error', String(e), 'error');
        }
    };

    useEffect(() => {
        refresh();
    }, [viewDate]);

    return (
        <>
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
                                        <Icon
                                            sx={{
                                                color:
                                                    f?.isAfter(today) ? 'primary.light' :
                                                        (moodValueOptions.find(h => h.value === moods.find(g => dayjs(g.date).isSame(f, 'day'))?.value)?.color || 'primary.main')
                                            }}
                                            fontSize="large"
                                        >
                                            {f.isSame(today, 'day') ? 'radio_button_checked' : 'circle'}
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
            {pickedDate &&
                <DialogMoodPicker
                    date={pickedDate}
                    mood={moods.find(e => dayjs(e.date).isSame(pickedDate, 'day'))}
                    onChange={refresh}
                    onClose={() => setPickedDate(undefined)}
                />
            }
        </>
    );
}

function DialogMoodPicker({
    mood,
    date,
    onChange,
    onClose,
}: {
    mood?: Mood,
    date: Dayjs,
    onChange: () => Promise<void>,
    onClose: () => void,
}) {
    const profile = useProfile();
    const [value, setValue] = useState(mood?.value);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleClick = async (newValue: MoodValue) => {
        try {
            setLoading(true);
            setValue(newValue);

            if (newValue !== value)
                await putMood(profile.id, date.format('YYYY-MM-DD'), newValue);
            else
                await deleteMood(profile.id, date.format('YYYY-MM-DD'));

            await onChange();
            onClose();
        } catch (e) {
            toast('Error', String(e), 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Swing le mood</DialogTitle>
            <DialogContent dividers>
                <List>
                    {moodValueOptions.map(e =>
                        <ListItemButton
                            key={e.value}
                            onClick={() => handleClick(e.value)}
                            selected={e.value === value}
                            sx={{ borderRadius: 10, px: 1.25 }}
                            disabled={loading}
                        >
                            <ListItemIcon>
                                <Icon fontSize="large" sx={{ color: e.color }}>
                                    {e.value === value ? 'radio_button_checked' : 'circle'}
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
