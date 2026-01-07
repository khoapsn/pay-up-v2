import { useToast } from "@/app/_libs/contexts";
import { Avatar, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Icon, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, TextField } from "@mui/material";
import { useState } from "react";
import { useMembers, useProject } from "../../_libs/contexts";
import { postMember } from "../../_libs/data";

export default function DialogMembers({
    onChange,
    onClose,
}: {
    onChange: () => Promise<void>,
    onClose: () => void,
}) {
    const project = useProject();
    const members = useMembers();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleClick = async () => {
        try {
            setLoading(true);
            await postMember(project.id, name);
            await onChange();
            setName('');
            toast('Success', 'New member added.');
        } catch (e) {
            toast('Error', String(e), 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog open onClose={onClose} fullWidth>
                <DialogTitle>Members</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        label="New member"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        slotProps={{
                            input: {
                                endAdornment:
                                    <IconButton
                                        onClick={handleClick}
                                        disabled={!name.trim()}
                                        loading={loading}
                                        edge="end"
                                    >
                                        <Icon>add</Icon>
                                    </IconButton>
                            },
                        }}
                        fullWidth
                    />
                    <List>
                        {members.map(e =>
                            <ListItem
                                key={e.id}
                                secondaryAction={<IconButton edge="end"><Icon>more_vert</Icon></IconButton>}
                                disableGutters
                            >
                                <ListItemAvatar><Avatar sx={{ bgcolor: e.active ? 'primary.light' : undefined }}>{e.name[0]}</Avatar></ListItemAvatar>
                                <ListItemText>{e.name}</ListItemText>
                            </ListItem>
                        )}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit">Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
