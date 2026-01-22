import { useToast } from "@/app/_libs/contexts";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useState } from "react";
import { deleteExpense } from "../../_libs/data";
import { Expense } from "../../_libs/models";

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
