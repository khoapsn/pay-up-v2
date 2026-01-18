import { useToast } from "@/app/_libs/contexts";
import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, List, ListItem, ListItemText, Stack, TextField, Typography } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useRef, useState } from "react";
import { v4 } from "uuid";
import { useExchanges, useMembers, useProject } from "../../_libs/contexts";
import { patchExpense, postExpense } from "../../_libs/data";
import { Expense, Member, newExpense, PaidFor } from "../../_libs/models";
import { convertAmount } from "../../_libs/utils";

export default function DialogExpense({
    expense,
    onChange,
    onChangeMembers,
    onClose,
}: {
    expense: Expense,
    onChange: () => Promise<void>,
    onChangeMembers: () => Promise<void>,
    onClose: () => void,
}) {
    const project = useProject();
    const members = useMembers();
    const exchanges = useExchanges();
    const [open, setOpen] = useState(false);
    const totalWeights = expense.paid_fors.reduce((p, c) => p + c.weight, 0);

    return (
        <>
            <Dialog open onClose={onClose} fullWidth maxWidth="xs">
                <DialogContent dividers>
                    <Typography variant="h6">{expense.title}</Typography>
                    <Typography color="textSecondary">{dayjs(expense.time).format('DD/MM/YYYY HH:mm')}</Typography>
                    <br />
                    {!!expense.description &&
                        <>
                            <Typography color="textSecondary" whiteSpace="pre-line">{expense.description}</Typography>
                            <br />
                        </>
                    }
                    <Divider />
                    <List>
                        {expense.paid_fors.map(e => {
                            const amount = expense.amount * e.weight / totalWeights;

                            return (
                                <ListItem key={e.member_id} disableGutters alignItems="flex-start">
                                    <ListItemText>
                                        {members.get(e.member_id)?.name}
                                    </ListItemText>
                                    <ListItemText
                                        secondary={
                                            expense.currency !== project.currency && `~ ${convertAmount(amount, expense.currency, project.currency, exchanges).toLocaleString()} ${project.currency}`
                                        }
                                        sx={{ textAlign: 'end' }}
                                    >
                                        {amount.toLocaleString()} {expense.currency}
                                    </ListItemText>
                                </ListItem>
                            );
                        })}
                        <Divider />
                        <ListItem disableGutters alignItems="flex-start">
                            <ListItemText><b>Total</b></ListItemText>
                            <ListItemText
                                secondary={
                                    expense.currency !== project.currency && `~ ${convertAmount(expense.amount, expense.currency, project.currency, exchanges).toLocaleString()} ${project.currency}`
                                }
                                sx={{ textAlign: 'end' }}
                            >
                                <b>{expense.amount.toLocaleString()} {expense.currency}</b>
                            </ListItemText>
                        </ListItem>
                    </List>
                    <Typography textAlign={"end"} color="textSecondary">
                        <i>Paid by {members.get(expense.paid_by)?.name}</i>
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit">Close</Button>
                    <Button onClick={onClose} color="error" variant="contained">Delete</Button>
                    <Button onClick={() => setOpen(true)} color="primary" variant="contained">Edit</Button>
                </DialogActions>
            </Dialog>
            {open &&
                <DialogExpenseEdit
                    expense={expense}
                    onSave={onChange}
                    onChangeMembers={onChangeMembers}
                    onClose={() => setOpen(false)}
                />
            }
        </>
    );
}

export function DialogExpenseEdit({
    expense,
    onSave,
    onChangeMembers,
    onClose,
}: {
    expense?: Expense,
    onSave: () => Promise<void>,
    onChangeMembers: () => Promise<void>,
    onClose: () => void,
}) {
    const project = useProject();
    const members = useMembers();
    const [item, setItem] = useState<Expense>(expense ? { ...expense } : newExpense(project));
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const activeMemberNames = [...members.values()].filter(e => e.is_active).map(e => e.name);
    const newMembersRef = useRef(new Map<string, Member>());
    const allMembersMap = new Map([...members.entries(), ...newMembersRef.current.entries()]);
    const allMembersArr = [...members.values(), ...newMembersRef.current.values()];

    const handleClick = async () => {
        try {
            setLoading(true);
            if (!item.id) await postExpense(item);
            else await patchExpense(item, newMembersRef.current);
            await onSave();
            if (newMembersRef.current.size > 0) await onChangeMembers();
            onClose();
            toast('Success', 'Expense saved.');
        } catch (e) {
            toast('Error', String(e), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePaidByChange = (_: any, value: string | null) => {

    };

    const handlePaidForsChange = (_: any, values: string[]) => {
        const newPaidFors: PaidFor[] = [];

        values.forEach(e => {
            const name = e.trim();
            const findWithinPaidFors = item.paid_fors.find(f => allMembersMap.get(f.member_id)?.name === name);

            if (findWithinPaidFors)
                newPaidFors.push(findWithinPaidFors);
            else {
                const findWithinAllMembers = allMembersArr.find(f => f.name === name);

                if (findWithinAllMembers) {
                    newPaidFors.push({ member_id: findWithinAllMembers.id, weight: 1 });
                } else {
                    const id = v4();
                    const newMember: Member = { id, name, is_active: true };
                    newMembersRef.current.set(id, newMember);
                    newPaidFors.push({ member_id: id, weight: 1 });
                }
            }
        });

        setItem({ ...item, paid_fors: newPaidFors });
    };

    return (
        <Dialog open onClose={onClose} fullWidth>
            <DialogTitle>Expense</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <TextField
                        label="Title"
                        value={item.title}
                        onChange={e => setItem({ ...item, title: e.target.value })}
                    />
                    <DateTimePicker
                        label="Time"
                        value={dayjs(item.time)}
                        onChange={e => setItem({ ...item, time: (e ?? dayjs()).toDate() })}
                        ampm={false}
                    />
                    <TextField
                        label="Amount"
                        type="number"
                        value={item.amount}
                        onChange={e => {
                            const value = Number(e.target.value);
                            if (value >= 0) setItem({ ...item, amount: value });
                        }}
                        slotProps={{
                            input: {
                                endAdornment:
                                    <Button
                                        onClick={undefined}
                                        variant="contained"
                                        color="inherit"
                                        disableElevation
                                    >
                                        {item.currency}
                                    </Button>,
                            },
                        }}
                    />
                    <Autocomplete
                        freeSolo
                        options={activeMemberNames}
                        value={allMembersMap.get(item.paid_by)?.name ?? ''}
                        onChange={handlePaidByChange}
                        renderInput={params => <TextField {...params} label="Paid by" />}
                    />
                    <Autocomplete
                        multiple freeSolo
                        options={activeMemberNames}
                        value={item.paid_fors.map(e => allMembersMap.get(e.member_id)?.name ?? '')}
                        onChange={handlePaidForsChange}
                        renderInput={params => <TextField {...params} label="Paid for" />}
                        disableCloseOnSelect
                    />
                    <TextField
                        label="Description"
                        value={item.description ?? ''}
                        onChange={e => setItem({ ...item, description: e.target.value })}
                        multiline rows={3}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Close</Button>
                <Button onClick={handleClick} loading={loading} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    );
}
