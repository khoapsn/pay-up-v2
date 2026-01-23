import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Icon, List, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material";
import { useExchanges, useExpenses, useMembers, useProject } from "../../_libs/contexts";
import { getBalanceOf, getTotalSpent, getTotalSpentOf } from "../../_libs/utils";

export default function DialogStats({ onClose }: { onClose: () => void }) {
    const project = useProject();
    const expenses = useExpenses();
    const exchanges = useExchanges();
    const members = useMembers();
    const total = getTotalSpent(expenses, project.currency, exchanges);

    return (
        <Dialog open onClose={onClose} fullWidth>
            <DialogTitle>
                Stats
            </DialogTitle>
            <DialogContent dividers>
                <Box textAlign={"end"}>
                    <Typography variant="h5">{total.toLocaleString()} {project.currency}</Typography>
                    <Typography color="textSecondary">Total expenses</Typography>
                </Box>
                <List>
                    {[...members.values()].map(e => {
                        const spent = getTotalSpentOf(e.id, expenses, project.currency, exchanges, true);
                        const balance = getBalanceOf(e.id, expenses, project.currency, exchanges);

                        return (
                            <ListItem
                                key={e.id}
                                sx={{
                                    p: 0,
                                    // display: (e.isActive || balance !== 0) ? undefined : 'none',
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: `${balance > 0 ? 'success' : balance < 0 ? 'error' : 'primary'}.light` }}>
                                        <Icon>
                                            {balance > 0 ? 'add' : balance < 0 ? 'remove' : 'check'}
                                        </Icon>
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText>
                                    {e.name}
                                </ListItemText>
                                <ListItemText
                                    secondary={
                                        <Typography variant="body2" color={balance > 0 ? 'success' : balance < 0 ? 'error' : 'primary'}>
                                            {balance > 0 && '+'}{(balance || '--').toLocaleString()}
                                        </Typography>
                                    }
                                    sx={{ textAlign: 'end' }}
                                >
                                    {spent.toLocaleString()}
                                </ListItemText>
                            </ListItem>
                        );
                    })}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Close</Button>
            </DialogActions>
        </Dialog>
    );
}
