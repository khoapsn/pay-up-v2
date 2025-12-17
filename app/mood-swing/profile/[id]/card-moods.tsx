import { useToast } from "@/app/_libs/contexts";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useProfile } from "../../_libs/contexts";
import { Mood } from "../../_libs/models";
import { getMoods } from "../../_libs/data";
import { Box, Button, Icon, IconButton, Stack, Typography } from "@mui/material";

const now = dayjs().startOf('day');

export default function CardMoods() {
    const profile = useProfile();
    const [currentDate, setCurentDate] = useState(dayjs().startOf('month'));
    const [moods, setMoods] = useState<Mood[]>();
    const toast = useToast();

    const dots: number[] = Array(currentDate.day()).fill(0);
    for (let i = 0; i < currentDate.daysInMonth(); i++)
        dots.push(i + 1);
    dots.push(...Array(7).fill(0));

    const refresh = async () => {
        try {
            setMoods(await getMoods(profile.id, currentDate.month() + 1));
        } catch (e) {
            toast('Error', String(e), 'error');
        }
    };

    useEffect(() => {
        refresh();
    }, [currentDate]);

    return (
        <>
            <Stack spacing={3}>
                <Stack direction={"row"} justifyContent={"space-between"}>
                    <Typography variant="h4" color="primary"><b>{currentDate.format('MMMM')}</b></Typography>
                    <Typography variant="h4" color="primary.light">{currentDate.year()}</Typography>
                </Stack>
                <Box>
                    <Stack spacing={2.5}>
                        {Array(6).fill(0).map((_, i) => (
                            <Stack key={i} direction={"row"} justifyContent={"space-between"}>
                                {dots.slice(7 * i, 7 * (i + 1)).map((f, j) =>
                                    <IconButton
                                        key={j}
                                        sx={{ p: 0, opacity: f }}
                                        disabled={currentDate.date(f).isAfter(now)}
                                    >
                                        <Icon fontSize="large">{currentDate.date(f).startOf('day').diff(now, 'day') === 0 ? 'stars' : 'circle'}</Icon>
                                    </IconButton>
                                )}
                            </Stack>
                        ))}
                    </Stack>
                </Box>
                <Stack direction={"row"} justifyContent={"space-between"}>
                    <Button
                        onClick={() => setCurentDate(currentDate.add(-1, 'month'))}
                        startIcon={<Icon>arrow_back</Icon>}
                    >
                        Last month
                    </Button>
                    <Button
                        onClick={() => setCurentDate(currentDate.add(1, 'month'))}
                        endIcon={<Icon>arrow_forward</Icon>}
                    >
                        Next month
                    </Button>
                </Stack>
            </Stack>
        </>
    );
}
