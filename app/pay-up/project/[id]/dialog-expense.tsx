import { useToast } from "@/app/_libs/contexts";
import { Autocomplete, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControlLabel, FormGroup, List, ListItem, ListItemButton, ListItemText, ListSubheader, Menu, Stack, TextField, Typography } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useRef, useState } from "react";
import { v4 } from "uuid";
import { useCurrencies, useExchanges, useMembers, useProject } from "../../_libs/contexts";
import { deleteExpense, patchExpense, postExpense } from "../../_libs/data";
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
    const [openDel, setOpenDel] = useState(false);
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
                    {expense.is_excluded &&
                        <Typography textAlign={"end"} color="textSecondary">
                            <i>Excluded from total</i>
                        </Typography>
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit">Close</Button>
                    <Button onClick={() => setOpenDel(true)} color="error" variant="contained">Delete</Button>
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
            {openDel &&
                <DialogExpenseDelete
                    expense={expense}
                    onDel={onChange}
                    onClose={() => setOpenDel(false)}
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
    const currencies = useCurrencies();
    const exchanges = useExchanges();
    const [item, setItem] = useState<Expense>(expense ? { ...expense } : newExpense(project));
    const [loading, setLoading] = useState(false);
    const [anchor, setAnchor] = useState<HTMLElement>();
    const toast = useToast();

    const activeMembersArr = [...members.values()].filter(e => e.is_active);
    const newMembersRef = useRef(new Map<string, Member>());
    const allMembersMap = new Map([...members.entries(), ...newMembersRef.current.entries()]);
    const allMembersArr = [...members.values(), ...newMembersRef.current.values()];

    const handleClick = async () => {
        try {
            if (!allMembersMap.get(item.paid_by)?.name) {
                toast('Invalid', '<Paid by> is missing.', 'warning');
                return;
            }

            if (!item.paid_fors.length) {
                toast('Invalid', '<Paid for> is missing.', 'warning');
                return;
            }

            setLoading(true);

            if (!item.id)
                await postExpense(item, newMembersRef.current);
            else
                await patchExpense(item, newMembersRef.current);

            if (newMembersRef.current.size > 0)
                await onChangeMembers();

            await onSave();
            onClose();
            toast('Success', 'Expense saved.');
        } catch (e) {
            toast('Error', String(e), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChangeCurr = (currency: string) => {
        setItem({ ...item, currency });
        setAnchor(undefined);
    };

    const handleChangePaidBy = (_: any, value: string | null) => {
        let newPaidBy = '';
        const name = value?.trim() || '';

        const find = allMembersArr.find(e => e.name === name);

        if (find) {
            newPaidBy = find.id;
        } else {
            const id = v4();
            const newMember: Member = { id, name, is_active: true };
            newMembersRef.current.set(id, newMember);
            newPaidBy = id;
        }

        setItem({ ...item, paid_by: newPaidBy });
    };

    const handleChangePaidFors = (_: any, values: string[]) => {
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
        <>
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
                                            onClick={e => setAnchor(e.currentTarget)}
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
                            options={activeMembersArr.map(e => e.name)}
                            value={allMembersMap.get(item.paid_by)?.name ?? ''}
                            onInputChange={handleChangePaidBy}
                            renderInput={params => <TextField {...params} label="Paid by" />}
                            selectOnFocus clearOnBlur
                        />
                        <Button
                            onClick={() => setItem({ ...item, paid_fors: activeMembersArr.map(e => ({ member_id: e.id, weight: 1 })) })}
                            size="small" color="inherit" variant="contained" disableElevation
                            sx={{ justifyContent: 'flex-start', width: 'fit-content' }}
                        >
                            Paid for Everyone
                        </Button>
                        <Autocomplete
                            multiple freeSolo
                            options={activeMembersArr.map(e => e.name)}
                            value={item.paid_fors.map(e => allMembersMap.get(e.member_id)?.name ?? '')}
                            onChange={handleChangePaidFors}
                            renderInput={params => <TextField {...params} label="Paid for" />}
                            disableCloseOnSelect
                        />
                        <TextField
                            label="Description"
                            value={item.description ?? ''}
                            onChange={e => setItem({ ...item, description: e.target.value })}
                            multiline rows={3}
                        />
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={item.is_excluded}
                                        onChange={e => setItem({ ...item, is_excluded: e.target.checked })}
                                    />
                                }
                                label="Excluded from total"
                            />
                        </FormGroup>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit">Close</Button>
                    <Button onClick={handleClick} loading={loading} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
            <Menu open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(undefined)}>
                <List>
                    <ListSubheader>Base currency</ListSubheader>
                    <ListItemButton onClick={() => handleChangeCurr(project.currency)}>
                        {project.currency}
                    </ListItemButton>
                    <ListSubheader>Exchange currencies</ListSubheader>
                    {exchanges.filter(e => e.currency !== project.currency).map((e, i) =>
                        <ListItemButton key={i} onClick={() => handleChangeCurr(e.currency)}>
                            {e.currency}
                        </ListItemButton>
                    )}
                    <ListSubheader>All currencies</ListSubheader>
                    {currencies.map((e, i) =>
                        <ListItemButton key={i} onClick={() => handleChangeCurr(e.currency)}>
                            {e.currency}
                        </ListItemButton>
                    )}
                </List>
            </Menu>
        </>
    );
}

export function DialogExpenseDelete({
    expense,
    onDel,
    onClose,
}: {
    expense: Expense,
    onDel: () => Promise<void>,
    onClose: () => void,
}) {
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleClick = async () => {
        try {
            setLoading(true);
            await deleteExpense(expense.id);
            await onDel();
            onClose();
            toast('Success', 'Expense deleted.', 'success');
        } catch (e) {
            toast('Error', String(e), 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open onClose={onClose} fullWidth>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogContent dividers>
                <DialogContentText>
                    Are you sure?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Close</Button>
                <Button onClick={handleClick} loading={loading} variant="contained" color="error">Delete</Button>
            </DialogActions>
        </Dialog>
    );
}
