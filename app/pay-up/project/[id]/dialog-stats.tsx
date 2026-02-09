import { Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Icon, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Stack, Typography } from "@mui/material";
import { useExchanges, useExpenses, useMembers, useProject } from "../../_libs/contexts";
import { getBalanceOf, getTotalSpent, getTotalSpentOf } from "../../_libs/utils";
import { useState } from "react";
import DialogStatsDetail from "./dialog-stats-detail";

export default function DialogStats({ onClose }: { onClose: () => void }) {
    const project = useProject();
    const expenses = useExpenses();
    const exchanges = useExchanges();
    const members = useMembers();
    const total = getTotalSpent(expenses, project.currency, exchanges);
    const [memId, setMemId] = useState<string>();

    return (
        <>
            <Dialog open onClose={onClose} fullWidth>
                <DialogTitle>
                    Stats
                </DialogTitle>
                <DialogContent dividers sx={{ px: 0 }}>
                    <Box textAlign={"end"} px={3}>
                        <Typography color="textSecondary">Total expenses</Typography>
                        <Typography variant="h5" color="primary">{total.toLocaleString()} {project.currency}</Typography>
                    </Box>
                    <List>
                        {[...members.values()].map(e => {
                            const spent = getTotalSpentOf(e.id, expenses, project.currency, exchanges, true);
                            const balance = getBalanceOf(e.id, expenses, project.currency, exchanges);

                            return (
                                <ListItemButton
                                    key={e.id}
                                    onClick={() => setMemId(e.id)}
                                    sx={{
                                        py: 0, px: 3,
                                        // display: (e.isActive || balance !== 0) ? undefined : 'none',
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: `${balance > 0 ? 'success' : balance < 0 ? 'error' : 'primary'}.light` }}>
                                            <Icon>{balance > 0 ? 'add' : balance < 0 ? 'remove' : 'check'}</Icon>
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText>
                                        {e.name}
                                    </ListItemText>
                                    <ListItemText
                                        secondary={
                                            <Chip
                                                label={`Balance: ${balance > 0 ? '+' : ''}${(balance || '--').toLocaleString()}`}
                                                color={balance > 0 ? 'success' : balance < 0 ? 'error' : 'default'}
                                                size="small" variant="outlined" sx={{ height: 1 }}
                                                component={"span"}
                                            />
                                        }
                                        sx={{ textAlign: 'end', color: 'primary.main' }}
                                    >
                                        {spent.toLocaleString()}
                                    </ListItemText>
                                </ListItemButton>
                            );
                        })}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit">Close</Button>
                </DialogActions>
            </Dialog>
            {memId &&
                <DialogStatsDetail
                    memId={memId}
                    onClose={() => setMemId(undefined)}
                />
            }
        </>
    );
}
