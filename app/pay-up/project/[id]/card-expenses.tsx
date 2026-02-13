import { useToast } from "@/app/_libs/contexts";
import { Alert, AlertTitle, Avatar, Card, CardContent, CardHeader, Icon, IconButton, List, ListItemAvatar, ListItemButton, ListItemText, ListSubheader, Stack, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import { Fragment, useEffect, useMemo, useState } from "react";
import { ExpensesContext, useExchanges, useExpenses, useMembers, useProject } from "../../_libs/contexts";
import { getExpenses } from "../../_libs/data";
import { Expense } from "../../_libs/models";
import { getAmountAfterDiscount, getTotalSpent } from "../../_libs/utils";
import DialogExpense from "./dialog-expense";
import { DialogExpenseEdit } from "./dialog-expense-edit";
import DialogStats from "./dialog-stats";

const now = dayjs();

export default function CardExpenses({ onChangeMembers }: { onChangeMembers: () => Promise<void>, }) {
    const project = useProject();
    const members = useMembers();
    const [expenses, setExpenses] = useState<Expense[]>();
    const [id, setId] = useState<string>();
    const [open, setOpen] = useState(false);
    const toast = useToast();

    const expense = useMemo(() => expenses?.find(e => e.id === id), [expenses, id]);
    const groups = new Map<string, Expense[]>();
    expenses?.forEach(e => {
        const key = dayjs(e.time).format('YYYY-MM-DD');
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)?.push(e);
    });

    const refresh = async () => {
        try {
            setExpenses(await getExpenses(project.id));
        } catch (e) {
            toast('Error', String(e), 'error');
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    return (
        <>
            {expenses &&
                <ExpensesContext.Provider value={expenses}>
                    <Stack spacing={2}>
                        <CardSummary onChange={refresh} />
                        <Card>
                            <CardHeader
                                title="Expenses"
                                slotProps={{ title: { color: 'primary' } }}
                                action={
                                    <Tooltip title="Add an expense">
                                        <IconButton onClick={() => setOpen(true)}><Icon>add</Icon></IconButton>
                                    </Tooltip>
                                }
                            />
                            {!expenses.length &&
                                <CardContent>
                                    <Alert severity="info">
                                        <AlertTitle>No data</AlertTitle>
                                        Start by adding your first expense!</Alert>
                                </CardContent>
                            }
                            <List dense>
                                {Array.from(groups).map(e => {
                                    const keyDay = dayjs(e[0]);
                                    const subheader =
                                        keyDay.isSame(now, 'day') ? 'Today' :
                                            keyDay.isSame(now.add(-1, 'day'), 'day') ? 'Yesterday' :
                                                dayjs(e[0]).format('ddd, DD/MM/YYYY');

                                    return (
                                        <Fragment key={e[0]}>
                                            <ListSubheader>{subheader}</ListSubheader>
                                            {e[1].map(f =>
                                                <ListItemButton
                                                    key={f.id}
                                                    onClick={() => setId(f.id)}
                                                >
                                                    <ListItemAvatar>
                                                        <Avatar sx={{ bgcolor: f.isExcluded ? undefined : 'primary.light' }}>
                                                            <Icon sx={{ fontSize: f.isExcluded ? 30 : 24 }}>{f.isExcluded ? 'swap_horiz' : 'receipt'}</Icon>
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        // slotProps={{ primary: { color: 'primary.light' } }}
                                                        secondary={`${members.get(f.paidBy)?.name} → ${f.paidFors.map(g => members.get(g.member_id)?.name).join(', ')}`}
                                                    >
                                                        {f.title}
                                                    </ListItemText>
                                                    <ListItemText
                                                        secondary={f.currency}
                                                        sx={{ textAlign: 'end', alignSelf: 'flex-start' }}
                                                    >
                                                        {getAmountAfterDiscount(f.amount, f.discountValue, f.discountType).toLocaleString()}
                                                    </ListItemText>
                                                </ListItemButton>
                                            )}
                                        </Fragment>
                                    )
                                })}
                            </List>
                        </Card>
                    </Stack>
                </ExpensesContext.Provider>
            }
            {expense &&
                <DialogExpense
                    expense={expense}
                    onChange={refresh}
                    onChangeMembers={onChangeMembers}
                    onClose={() => setId(undefined)}
                />
            }
            {open &&
                <DialogExpenseEdit
                    onSave={refresh}
                    onChangeMembers={onChangeMembers}
                    onClose={() => setOpen(false)}
                />
            }
        </>
    );
}

function CardSummary({ onChange }: { onChange: () => Promise<void> }) {
    const project = useProject();
    const expenses = useExpenses();
    const exchanges = useExchanges();
    const [open, setOpen] = useState(false);
    const total = getTotalSpent(expenses, project.currency, exchanges);

    return (
        <>
            <Card>
                <CardHeader
                    title="Summary"
                    slotProps={{ title: { color: 'primary' } }}
                    action={
                        <Tooltip title="Stats">
                            <IconButton onClick={() => setOpen(true)}>
                                <Icon>leaderboard</Icon>
                            </IconButton>
                        </Tooltip>
                    }
                />
                <CardContent>
                    <Typography color="textSecondary">Total expenses</Typography>
                    <Typography variant="h5">{total.toLocaleString()} {project.currency}</Typography>
                </CardContent>
            </Card>
            {open &&
                <DialogStats
                    onChange={onChange}
                    onClose={() => setOpen(false)}
                />
            }
        </>
    );
}
