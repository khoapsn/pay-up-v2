import { Button, Dialog, DialogActions, DialogContent, Divider, Icon, List, ListItem, ListItemText, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";
import { useExchanges, useMembers, useProject } from "../../_libs/contexts";
import { DiscountType, Expense } from "../../_libs/models";
import { convertAmount, getAmountAfterDiscount } from "../../_libs/utils";
import { DialogExpenseDelete } from "./dialog-expense-delete";
import { DialogExpenseEdit } from "./dialog-expense-edit";

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
    const totalWeights = expense.paidFors.reduce((p, c) => p + c.weight, 0);
    const amountAfterDiscount = getAmountAfterDiscount(expense.amount, expense.discountValue, expense.discountType);

    return (
        <>
            <Dialog open onClose={onClose} fullWidth>
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
                    <List>
                        {expense.paidFors.map(e => {
                            const amount = amountAfterDiscount * e.weight / totalWeights;

                            return (
                                <ListItem key={e.member_id} disableGutters alignItems="flex-start" sx={{ pt: 0 }}>
                                    <ListItemText>
                                        {members.get(e.member_id)?.name}
                                    </ListItemText>
                                    <ListItemText
                                        secondary={
                                            expense.currency !== project.currency &&
                                            `~ ${convertAmount(amount, expense.currency, project.currency, exchanges).toLocaleString()} ${project.currency}`
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
                                    expense.currency !== project.currency &&
                                    `~ ${convertAmount(amountAfterDiscount, expense.currency, project.currency, exchanges).toLocaleString()} ${project.currency}`
                                }
                                sx={{ textAlign: 'end' }}
                            >
                                {expense.discountValue > 0 &&
                                    <Typography sx={{ textDecoration: 'line-through' }} color="textDisabled">
                                        {expense.amount.toLocaleString()} {expense.currency}
                                    </Typography>
                                }
                                <b>{amountAfterDiscount.toLocaleString()} {expense.currency}</b>
                            </ListItemText>
                        </ListItem>
                    </List>
                    <Typography textAlign={"end"} color="textSecondary" alignItems={"center"}>
                        <i>Paid by {members.get(expense.paidBy)?.name}</i>
                    </Typography>
                    {expense.discountValue > 0 &&
                        <Typography textAlign={"end"} color="textSecondary">
                            <i>{expense.discountValue.toLocaleString()}{expense.discountType === DiscountType.Amount ? ` ${expense.currency}` : '%'} discount</i>
                        </Typography>
                    }
                    {expense.isExcluded &&
                        <Typography textAlign={"end"} color="textSecondary">
                            <i>Excluded from total</i>
                        </Typography>
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit">Close</Button>
                    <Button onClick={() => setOpenDel(true)} color="error">Delete</Button>
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


