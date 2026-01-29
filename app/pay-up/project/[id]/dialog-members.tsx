import { useToast } from "@/app/_libs/contexts";
import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogTitle, Icon, IconButton, List, ListItem, ListItemAvatar, ListItemText, Menu, MenuItem, TextField } from "@mui/material";
import { useState } from "react";
import { useMembers, useProject } from "../../_libs/contexts";
import { deleteMember, patchMemberIsActive, patchMemberName, postMember } from "../../_libs/data";
import { Member } from "../../_libs/models";

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
    const [member, setMember] = useState<Member>();
    const [anchor, setAnchor] = useState<HTMLElement>();
    const [open, setOpen] = useState(false);
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

    const handleRename = () => {
        setOpen(true);
        setAnchor(undefined);
    };

    const handleHide = async () => {
        try {
            if (!member) return;
            await patchMemberIsActive(member.id, !member.isActive);
            await onChange();
            toast('Success', 'Member updated.');
        } catch (e) {
            toast('Error', String(e), 'error');
        } finally {
            setAnchor(undefined);
        }
    };

    const handleDelete = async () => {
        try {
            if (!member) return;
            await deleteMember(member.id);
            await onChange();
            toast('Success', 'Member deleted.');
        } catch (e) {
            toast('Error', String(e), 'error');
        } finally {
            setAnchor(undefined);
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
                        {Array.from(members.values()).map(e =>
                            <ListItem
                                key={e.id}
                                secondaryAction={
                                    <IconButton
                                        onClick={f => {
                                            setMember(e);
                                            setAnchor(f.currentTarget);
                                        }}
                                        edge="end"
                                    >
                                        <Icon>more_vert</Icon>
                                    </IconButton>
                                }
                                disableGutters
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: e.isActive ? 'primary.light' : undefined }}>
                                        {e.name[0]}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText>{e.name}</ListItemText>
                            </ListItem>
                        )}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit">Close</Button>
                </DialogActions>
            </Dialog>
            {member && anchor &&
                <Menu open anchorEl={anchor} onClose={() => setAnchor(undefined)}>
                    <MenuItem onClick={handleRename}>Rename</MenuItem>
                    <MenuItem onClick={handleHide}>{member.isActive ? 'Hide' : 'Unhide'}</MenuItem>
                    <MenuItem onClick={handleDelete}>Delete</MenuItem>
                </Menu>
            }
            {member && open &&
                <DialogRename
                    member={member}
                    onSave={onChange}
                    onClose={() => setOpen(false)}
                />
            }
        </>
    );
}

function DialogRename({
    member,
    onSave,
    onClose,
}: {
    member: Member,
    onSave: () => Promise<void>,
    onClose: () => void,
}) {
    const [name, setName] = useState(member.name);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleClick = async () => {
        try {
            setLoading(true);
            await patchMemberName(member.id, name);
            await onSave();
            onClose();
            toast('Success', 'Member updated.');
        } catch (e) {
            toast('Error', String(e), 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open onClose={onClose}>
            <DialogTitle>Rename</DialogTitle>
            <DialogContent dividers>
                <TextField value={name} onChange={e => setName(e.target.value)} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Close</Button>
                <Button onClick={handleClick} loading={loading} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    )
}
