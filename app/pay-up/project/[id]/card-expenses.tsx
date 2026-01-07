import { useToast } from "@/app/_libs/contexts";
import { Avatar, Card, CardContent, CardHeader, Icon, IconButton, List, ListItemAvatar, ListItemButton, ListItemText, ListSubheader, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useExchanges, useProject } from "../../_libs/contexts";
import { getExpenses } from "../../_libs/data";
import { Expense } from "../../_libs/models";
import { convertAmount } from "../../_libs/utils";

export default function CardExpenses() {
    const project = useProject();
    const [expenses, setExpenses] = useState<Expense[]>();
    const toast = useToast();

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
                            action={<IconButton color="primary"><Icon>add</Icon></IconButton>}
                        />
                        <List dense>
                            <ListSubheader component={"div"} color="primary">Today</ListSubheader>
                            {expenses.map(e =>
                                <ListItemButton key={e.id}>
                                    {/* <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'primary.light' }}><Icon>receipt</Icon></Avatar>
                                    </ListItemAvatar> */}
                                    <ListItemText
                                        slotProps={{ primary: { color: 'secondary' } }}
                                        secondary={`${e.paid_by.name} → ${e.paid_for.map(f => f.member.name).join(', ')}`}
                                    >
                                        {e.title}
                                    </ListItemText>
                                    <ListItemText
                                        secondary={e.currency}
                                        sx={{ textAlign: 'end' }}
                                    >
                                        <b>{e.amount.toLocaleString('en')}</b>
                                    </ListItemText>
                                </ListItemButton>
                            )}
                            {expenses.map(e =>
                                <ListItemButton key={e.id}>
                                    <ListItemText
                                        secondary={`${e.paid_by.name} → ${e.paid_for.map(f => f.member.name).join(', ')}`}
                                    >
                                        {e.title}
                                    </ListItemText>
                                    <ListItemText
                                        secondary={e.currency}
                                        sx={{ textAlign: 'end' }}
                                    >
                                        <b>{e.amount.toLocaleString('en')}</b>
                                    </ListItemText>
                                </ListItemButton>
                            )}
                        </List>
                    </Card>
                </Stack >
            }
        </>
    );
}

function CardSummary({ expenses }: { expenses: Expense[] }) {
    const project = useProject();
    const exchanges = useExchanges();
    const total = expenses.reduce((p, c) => p + convertAmount(c.amount, c.currency, project.currency, exchanges), 0);

    return (
        <Card>
            <CardHeader
                title="Summary"
                slotProps={{ title: { color: 'primary' } }}
                action={<IconButton><Icon>leaderboard</Icon></IconButton>}
            />
            <CardContent>
                <Typography>Total expenses</Typography>
                <Typography variant="h5">{total.toLocaleString('en')} {project.currency}</Typography>
            </CardContent>
        </Card>
    );
}
