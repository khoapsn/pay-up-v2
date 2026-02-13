import { NumberField } from "@/app/_libs/common";
import { useToast } from "@/app/_libs/contexts";
import { Autocomplete, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, FormGroup, Grid, List, ListItemButton, Menu, Stack, TextField, useMediaQuery, useTheme } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useRef, useState } from "react";
import { v4 } from "uuid";
import { useExchanges, useMembers, useProject } from "../../_libs/contexts";
import { patchExpense, postExpense } from "../../_libs/data";
import { DiscountType, Expense, Member, newExpense, PaidFor } from "../../_libs/models";

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
    const exchanges = useExchanges();
    const [item, setItem] = useState<Expense>(expense ? structuredClone(expense) : newExpense(project));
    const [loading, setLoading] = useState(false);
    const [anchor, setAnchor] = useState<HTMLElement>();
    const [anchor2, setAnchor2] = useState<HTMLElement>();
    const [tempPaidForIdx, setPaidForIdx] = useState(0);
    const paidForIdx = Math.min(tempPaidForIdx, item.paidFors.length - 1);
    const toast = useToast();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const activeMembersArr = [...members.values()].filter(e => e.isActive);
    const newMembersRef = useRef(new Map<string, Member>());
    const allMembersMap = new Map([...members.entries(), ...newMembersRef.current.entries()]);
    const allMembersArr = [...members.values(), ...newMembersRef.current.values()];

    const handleClick = async () => {
        try {
            if (!allMembersMap.get(item.paidBy)?.name) {
                toast('Invalid', '<Paid by> is missing.', 'warning');
                return;
            }

            if (!item.paidFors.length) {
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
            const newMember: Member = { id, name, isActive: true };
            newMembersRef.current.set(id, newMember);
            newPaidBy = id;
        }

        setItem({ ...item, paidBy: newPaidBy });
    };

    const handleChangePaidFors = (_: any, values: string[]) => {
        const newPaidFors: PaidFor[] = [];

        values.forEach(e => {
            const name = e.trim();
            const findWithinPaidFors = item.paidFors.find(f => allMembersMap.get(f.member_id)?.name === name);

            if (findWithinPaidFors)
                newPaidFors.push(findWithinPaidFors);
            else {
                const findWithinAllMembers = allMembersArr.find(f => f.name === name);

                if (findWithinAllMembers) {
                    newPaidFors.push({ member_id: findWithinAllMembers.id, weight: 1 });
                } else {
                    const id = v4();
                    const newMember: Member = { id, name, isActive: true };
                    newMembersRef.current.set(id, newMember);
                    newPaidFors.push({ member_id: id, weight: 1 });
                }
            }
        });

        setItem({ ...item, paidFors: newPaidFors });
    };

    return (
        <>
            <Dialog open onClose={onClose} fullWidth fullScreen={fullScreen}>
                <DialogTitle>Expense</DialogTitle>
                <DialogContent dividers sx={{ px: 2 }}>
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
                        <NumberField
                            label="Amount"
                            value={item.amount}
                            onChange={e => setItem({ ...item, amount: e ?? 0 })}
                            min={0}
                            slotProps={{
                                input: {
                                    endAdornment:
                                        <Button
                                            onClick={e => setAnchor(e.currentTarget)}
                                            variant="contained"
                                            color="inherit"
                                            sx={{ ml: 1 }}
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
                            value={allMembersMap.get(item.paidBy)?.name ?? ''}
                            onInputChange={handleChangePaidBy}
                            renderInput={params => <TextField {...params} label="Paid by" />}
                            selectOnFocus clearOnBlur
                        />
                        <Button
                            onClick={() => setItem({ ...item, paidFors: activeMembersArr.map(e => ({ member_id: e.id, weight: 1 })) })}
                            size="small" color="inherit" variant="contained" disableElevation
                            sx={{ justifyContent: 'flex-start', width: 'fit-content' }}
                        >
                            Paid for Everyone
                        </Button>
                        <Autocomplete
                            multiple freeSolo
                            options={activeMembersArr.map(e => e.name)}
                            value={item.paidFors.map(e => allMembersMap.get(e.member_id)?.name ?? '')}
                            onChange={handleChangePaidFors}
                            renderInput={params => <TextField {...params} label="Paid for" />}
                            disableCloseOnSelect
                        />
                        <Divider>Extra Info</Divider>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={item.isExcluded}
                                        onChange={e => setItem({ ...item, isExcluded: e.target.checked })}
                                        sx={{ py: 0 }}
                                    />
                                }
                                label="Excluded from total"
                            />
                        </FormGroup>
                        <TextField
                            label="Description"
                            value={item.description ?? ''}
                            onChange={e => setItem({ ...item, description: e.target.value })}
                            multiline rows={3}
                        />
                        <Grid container spacing={2}>
                            <Grid size={6}>
                                <NumberField
                                    label="Discount"
                                    value={item.discountValue}
                                    onChange={e => setItem({ ...item, discountValue: e ?? 0 })}
                                    min={0} max={item.discountType === DiscountType.Amount ? item.amount : 100}
                                    slotProps={{
                                        input: {
                                            endAdornment:
                                                <Button
                                                    onClick={() => setItem({ ...item, discountType: item.discountType === DiscountType.Amount ? DiscountType.Percent : DiscountType.Amount })}
                                                    variant="contained"
                                                    color="inherit"
                                                    sx={{ ml: 1 }}
                                                    disableElevation
                                                >
                                                    {item.discountType === DiscountType.Percent ? '%' : item.currency}
                                                </Button>
                                        },
                                    }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={6}>
                                {item.paidFors.length > 1 &&
                                    <NumberField
                                        id={String(paidForIdx)}
                                        label="Weight of"
                                        value={item.paidFors[paidForIdx].weight}
                                        onChange={e => {
                                            item.paidFors[paidForIdx].weight = (e ?? 0);
                                            setItem({ ...item });
                                        }}
                                        min={0}
                                        slotProps={{
                                            input: {
                                                startAdornment:
                                                    <Button
                                                        onClick={e => setAnchor2(e.currentTarget)}
                                                        variant="contained"
                                                        color="inherit"
                                                        sx={{ mr: 1 }}
                                                        disableElevation
                                                    >
                                                        {allMembersMap.get(item.paidFors[paidForIdx].member_id)?.name}
                                                    </Button>
                                            },
                                        }}
                                        fullWidth
                                    />
                                }
                            </Grid>
                        </Grid>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit">Close</Button>
                    <Button onClick={handleClick} loading={loading} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
            <Menu open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(undefined)}>
                <List>
                    <ListItemButton onClick={() => handleChangeCurr(project.currency)}>
                        {project.currency}
                    </ListItemButton>
                    <Divider variant="middle" />
                    {exchanges.filter(e => e.currency !== project.currency).map((e, i) =>
                        <ListItemButton key={i} onClick={() => handleChangeCurr(e.currency)}>
                            {e.currency}
                        </ListItemButton>
                    )}
                </List>
            </Menu>
            <Menu open={!!anchor2} anchorEl={anchor2} onClose={() => setAnchor2(undefined)}>
                <List>
                    {item.paidFors.map((e, i) =>
                        <ListItemButton
                            key={e.member_id}
                            onClick={() => { setPaidForIdx(i); setAnchor2(undefined) }}
                            selected={e.member_id === item.paidFors[paidForIdx].member_id}
                        >
                            {allMembersMap.get(e.member_id)?.name}
                        </ListItemButton>
                    )}
                </List>
            </Menu>
        </>
    );
}
