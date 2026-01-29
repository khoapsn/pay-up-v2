import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, List, ListItem, ListItemText, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useExchanges, useExpenses, useMembers, useProject } from "../../_libs/contexts";
import dayjs from "dayjs";
import { convertAmount, getAmountAfterDiscount, getSpentOf, getTotalPaidOf, getTotalSpentOf } from "../../_libs/utils";
import { Expense } from "../../_libs/models";

export default function DialogStatsDetail({
    memId,
    onClose,
}: {
    memId: string,
    onClose: () => void,
}) {
    const project = useProject();
    const expenses = useExpenses();
    const members = useMembers();
    const exchanges = useExchanges();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const member = members.get(memId);
    const rows = expenses.filter(e =>
        e.paidBy === memId ||
        e.paidFors.map(f => f.member_id).includes(memId)
    );
    const total = getTotalSpentOf(memId, expenses, project.currency, exchanges, true);
    const paid = getTotalPaidOf(memId, expenses, project.currency, exchanges);
    const spent = -getTotalSpentOf(memId, expenses, project.currency, exchanges);
    const balance = paid + spent;

    const columns: GridColDef[] = [
        {
            field: 'time',
            headerName: 'Time',
            type: 'dateTime',
            valueFormatter: e => dayjs(e).format('DD/MM'),
            width: 60,
        },
        {
            field: 'title',
            headerName: 'Title',
            flex: 1,
        },
        {
            field: 'paid',
            headerName: 'Paid',
            type: 'number',
            valueGetter: (_, row: Expense) =>
                row.paidBy === memId ? convertAmount(getAmountAfterDiscount(row.amount, row.discountValue, row.discountType), row.currency, project.currency, exchanges) : undefined,
            renderCell: (e: GridRenderCellParams) =>
                <span style={{ color: theme.palette.success.light }}>{e.value?.toLocaleString()}</span>,
        },
        {
            field: 'spent',
            headerName: 'Spent',
            type: 'number',
            valueGetter: (_, row: Expense) =>
                getSpentOf(memId, row, project.currency, exchanges) || undefined,
            renderCell: (e: GridRenderCellParams<Expense>) =>
                <span style={{ color: theme.palette.error.light, fontStyle: e.row.isExcluded ? 'italic' : 'normal' }}>{e.value?.toLocaleString()}</span>,
        },
    ];

    return (
        <>
            {member &&
                <Dialog open onClose={onClose} fullWidth fullScreen={fullScreen}>
                    <DialogTitle>Expenses of {member.name}</DialogTitle>
                    <DialogContent dividers>
                        <Box textAlign={"end"}>
                            <Typography color="textSecondary">Total expenses</Typography>
                            <Typography variant="h5" color="primary">{total.toLocaleString()} {project.currency}</Typography>
                        </Box>
                        <List dense disablePadding sx={{ mb: 2 }}>
                            <ListItem disableGutters disablePadding>
                                <ListItemText>Paid</ListItemText>
                                <ListItemText sx={{ color: 'success.light', textAlign: 'end' }}>{paid.toLocaleString()}</ListItemText>
                            </ListItem>
                            <ListItem disableGutters disablePadding>
                                <ListItemText>Spent</ListItemText>
                                <ListItemText sx={{ color: 'error.light', textAlign: 'end' }}>{spent.toLocaleString()}</ListItemText>
                            </ListItem>
                            <Divider />
                            <ListItem disableGutters disablePadding>
                                <ListItemText>Balance</ListItemText>
                                <ListItemText sx={{ color: balance > 0 ? 'success.light' : balance < 0 ? 'error.light' : 'primary.light', textAlign: 'end' }}>
                                    {balance.toLocaleString()}
                                </ListItemText>
                            </ListItem>
                        </List>
                        <DataGrid
                            columns={columns}
                            rows={rows}
                            showToolbar
                            density="compact"
                            autoHeight
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose} color="inherit">Close</Button>
                    </DialogActions>
                </Dialog>
            }
        </>
    );
}
