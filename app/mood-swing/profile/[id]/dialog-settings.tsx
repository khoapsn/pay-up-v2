import { Dialog, DialogContent, DialogTitle, FormControlLabel, FormGroup, Stack, Switch } from "@mui/material";
import { useSettingsState } from "../../_libs/contexts";

export default function DialogSettings({ onClose }: { onClose: () => void }) {
    const [settings, setSettings] = useSettingsState();

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Settings</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <FormGroup>
                        <FormControlLabel
                            label="Week start on Sunday"
                            control={
                                <Switch
                                    checked={settings.weekStartOnSunday}
                                    onChange={e => {
                                        const weekStartOnSunday = e.target.checked;
                                        setSettings({ ...settings, weekStartOnSunday });
                                        localStorage.setItem('weekStartOnSunday', String(weekStartOnSunday))
                                    }}
                                />}
                        />
                    </FormGroup>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
