import { useToast } from "@/app/_libs/contexts";
import { Avatar, Card, CardContent, CardHeader, Icon, IconButton, List, ListItemAvatar, ListItemButton, ListItemText, ListSubheader, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useExchanges, useMembers, useProject } from "../../_libs/contexts";
import { getExpenses } from "../../_libs/data";
import { Expense } from "../../_libs/models";
import { convertAmount, getAmountAfterDiscount } from "../../_libs/utils";
import DialogExpense from "./dialog-expense";
import { DialogExpenseEdit } from "./dialog-expense-edit";

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
                <Stack spacing={2}>
                    <CardSummary expenses={expenses} />
                    <Card>
                        <CardHeader
                            title="Expenses"
                            slotProps={{ title: { color: 'primary' } }}
                            action={<IconButton onClick={() => setOpen(true)}><Icon>add</Icon></IconButton>}
                        />
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
                                                    <Avatar sx={{ bgcolor: f.is_excluded ? undefined : 'primary.light' }}>
                                                        <Icon>receipt</Icon>
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    // slotProps={{ primary: { color: 'primary.light' } }}
                                                    secondary={`${members.get(f.paid_by)?.name} → ${f.paid_fors.map(g => members.get(g.member_id)?.name).join(', ')}`}
                                                >
                                                    {f.title}
                                                </ListItemText>
                                                <ListItemText
                                                    secondary={f.currency}
                                                    sx={{ textAlign: 'end' }}
                                                >
                                                    {getAmountAfterDiscount(f.amount, f.discount_value, f.discount_type).toLocaleString()}
                                                </ListItemText>
                                            </ListItemButton>
                                        )}
                                    </Fragment>
                                )
                            })}
                        </List>
                    </Card>
                </Stack >
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

function CardSummary({ expenses }: { expenses: Expense[] }) {
    const project = useProject();
    const exchanges = useExchanges();
    const total =
        expenses
            .filter(e => !e.is_excluded)
            .reduce((p, c) =>
                p + convertAmount(getAmountAfterDiscount(c.amount, c.discount_value, c.discount_type), c.currency, project.currency, exchanges),
                0
            );

    return (
        <Card>
            <CardHeader
                title="Summary"
                slotProps={{ title: { color: 'primary' } }}
                action={<IconButton><Icon>leaderboard</Icon></IconButton>}
            />
            <CardContent>
                <Typography>Total expenses</Typography>
                <Typography variant="h5">{total.toLocaleString()} {project.currency}</Typography>
            </CardContent>
        </Card>
    );
}
