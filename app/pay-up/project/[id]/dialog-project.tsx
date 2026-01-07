import { useToast } from "@/app/_libs/contexts";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { PickerValue } from "@mui/x-date-pickers/internals";
import dayjs from "dayjs";
import { useState } from "react";
import { useProject } from "../../_libs/contexts";
import { patchProject } from "../../_libs/data";
import { Project } from "../../_libs/models";

export default function DialogProject({
    onSave,
    onClose,
}: {
    onSave: () => Promise<void>;
    onClose: () => void,
}) {
    const project = useProject();
    const [item, setItem] = useState<Project>({ ...project });
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleClick = async () => {
        try {
            setLoading(true);
            await patchProject(item);
            await onSave();
            onClose();
            toast('Success', 'Project settings saved.');
        } catch (e) {
            toast('Error', String(e), 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open onClose={onClose} fullWidth>
            <DialogTitle>Project Settings</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid size={12}>
                        <TextField
                            label="Title"
                            value={item.title}
                            onChange={e => setItem({ ...item, title: e.target.value })}
                            fullWidth
                        />
                    </Grid>
                    <Grid size={12}>
                        <TextField
                            label="Description"
                            value={item.description ?? ''}
                            onChange={e => setItem({ ...item, description: e.target.value })}
                            fullWidth multiline rows={5}
                        />
                    </Grid>
                    <Grid size={12}>
                        <DatePicker
                            label="Date"
                            value={dayjs(item.date)}
                            onChange={(e: PickerValue) => setItem({ ...item, date: (e ?? dayjs()).toDate() })}
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Close</Button>
                <Button
                    onClick={handleClick}
                    loading={loading}
                    variant="contained"
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}
