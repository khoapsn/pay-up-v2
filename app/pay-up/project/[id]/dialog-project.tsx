import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Icon, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Tab, Tabs, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { PickerValue } from "@mui/x-date-pickers/internals";
import dayjs from "dayjs";
import { useState } from "react";
import { useProject } from "../../_libs/contexts";
import { patchProject } from "../../_libs/data";
import { Project } from "../../_libs/models";
import { useToast } from "@/app/_libs/contexts";

export default function DialogProject({
    onSave,
    onClose,
}: {
    onSave: () => Promise<void>;
    onClose: () => void,
}) {
    const project = useProject();
    const itemState = useState<Project>({ ...project });
    const [item] = itemState;
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleSave = async () => {
        try {
            setLoading(true);
            await patchProject(item);
            await onSave();
            onClose();
            toast();
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
                <Box borderBottom="1px solid" borderColor="divider" mb={3}>
                    <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)}>
                        <Tab label="General" />
                        <Tab label="Members" />
                        <Tab label="Currencies" />
                    </Tabs>
                </Box>
                {tabValue === 0 && <TabGeneral itemState={itemState} />}
                {tabValue === 1 && <TabMembers itemState={itemState} />}
                {tabValue === 2 && <TabCurrencies itemState={itemState} />}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                <Button onClick={handleSave} loading={loading} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    );
}

function TabGeneral({ itemState }: { itemState: [Project, (project: Project) => void] }) {
    const [item, setItem] = itemState;

    return (
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
                    fullWidth multiline rows={3}
                />
            </Grid>
            <Grid size={6}>
                <DatePicker
                    label="Date"
                    value={dayjs(item.date)}
                    onChange={(e: PickerValue) => setItem({ ...item, date: (e ?? dayjs()).toDate() })}
                    slotProps={{ textField: { fullWidth: true } }}
                />
            </Grid>
            <Grid size={6}>
                <TextField
                    label="Currency"
                    value={item.currencies.base}
                    onChange={e => setItem({ ...item, currencies: { ...item.currencies, base: e.target.value } })}
                    fullWidth
                />
            </Grid>
        </Grid>
    );
}

function TabMembers({ itemState }: { itemState: [Project, (project: Project) => void] }) {
    const [item, setItem] = itemState;

    return (
        <List>
            {item.members.map((e, i) => (
                <ListItem
                    key={e.id}
                    secondaryAction={<IconButton><Icon>more_vert</Icon></IconButton>}
                    divider={i !== item.members.length - 1}
                    disablePadding
                >
                    <ListItemButton>
                        <ListItemAvatar>
                            <Avatar>{e.name[0]}</Avatar>
                        </ListItemAvatar>
                        <ListItemText>{e.name}</ListItemText>
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );
}

function TabCurrencies({ itemState }: { itemState: [Project, (project: Project) => void] }) {
    const [item, setItem] = itemState;

    return (
        <Grid container spacing={2}>
            <Grid size={12}>
                <TextField
                    label="Base Currency"
                    value={item.currencies.base}
                    onChange={e => setItem({ ...item, currencies: { ...item.currencies, base: e.target.value } })}
                    fullWidth
                />
            </Grid>
        </Grid>
    );
}
