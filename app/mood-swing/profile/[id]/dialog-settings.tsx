import { useToast } from "@/app/_libs/contexts";
import { Dialog, DialogContent, DialogTitle, FormControlLabel, FormGroup, Stack, Switch, TextField } from "@mui/material";
import { useState } from "react";
import { useProfile } from "../../_libs/contexts";
import { putProfile } from "../../_libs/data";
import { Profile } from "../../_libs/models";

export default function DialogSettings({
    onChange,
    onClose,
}: {
    onChange: (profile: Profile) => void,
    onClose: () => void,
}) {
    const profile = useProfile();
    const [item, setItem] = useState<Profile>({ ...profile });
    const toast = useToast();

    const handleClose = async () => {
        try {
            if (
                item.name === profile.name &&
                item.week_start_on_sunday === profile.week_start_on_sunday
            )
                return;
            else {
                await putProfile(item);
                onChange(item);
                toast('Success', 'Settings saved.');
            }
        } catch (e) {
            toast('Error', String(e), 'error');
        } finally {
            onClose();
        }
    };

    return (
        <Dialog open onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle>Settings</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <TextField
                        label="Your name"
                        value={item.name}
                        onChange={e => setItem({ ...item, name: e.target.value })}
                    />
                    <FormGroup>
                        <FormControlLabel
                            label="Week starts on Sunday"
                            control={
                                <Switch
                                    checked={item.week_start_on_sunday}
                                    onChange={e => setItem({ ...item, week_start_on_sunday: e.target.checked })}
                                />
                            }
                        />
                    </FormGroup>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
