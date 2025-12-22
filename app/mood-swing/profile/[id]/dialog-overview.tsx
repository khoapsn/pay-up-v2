import { useToast } from "@/app/_libs/contexts";
import { Dialog, DialogContent, DialogTitle, Icon, IconButton, Stack, Typography } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { useProfile } from "../../_libs/contexts";
import { getMoods } from "../../_libs/data";
import { Mood, moodValueOptions } from "../../_libs/models";
import { today } from "./card-moods";

export default function DialogOverview({
    viewDate,
    onChange,
    onClose,
}: {
    viewDate: Dayjs,
    onChange: (date: Dayjs) => void,
    onClose: () => void,
}) {
    const profile = useProfile();
    const [moods, setMoods] = useState<Mood[]>([]);
    const toast = useToast();

    const refresh = async () => {
        try {
            setMoods(await getMoods(profile.id, viewDate.year()));
        } catch (e) {
            toast('Error', String(e), 'error');
        }
    };

    useEffect(() => {
        refresh();
    }, [viewDate]);

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Overview </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} alignItems={"center"}>
                    <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} sx={{ width: 1 }}>
                        <IconButton onClick={() => onChange(viewDate.add(-1, 'year'))}>
                            <Icon>navigate_before</Icon>
                        </IconButton>
                        <Typography variant="h5" color="primary">
                            {viewDate.year()}
                        </Typography>
                        <IconButton onClick={() => onChange(viewDate.add(1, 'year'))}>
                            <Icon>navigate_next</Icon>
                        </IconButton>
                    </Stack>
                    <Stack spacing={0.3}>
                        {[...Array(12).keys()].map(m =>
                            <Stack key={m} direction={"row"} spacing={0.3}>
                                {[...Array(viewDate.month(m).daysInMonth()).keys()].map(d =>
                                    <Dot
                                        key={d}
                                        date={viewDate.month(m).date(d + 1)}
                                        moods={moods}
                                    />
                                )}
                            </Stack>
                        )}
                    </Stack>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}

function Dot({ date, moods }: { date: Dayjs, moods: Mood[] }) {
    const mood = moods.find(e => dayjs(e.date).isSame(date, 'day'));
    const color = date.isAfter(today) ? 'primary.light' :
        (moodValueOptions.find(e => e.value === mood?.value)?.color || 'primary.light');

    return (<Icon sx={{ fontSize: 10, color }}>circle</Icon>);
}
