import { NumberField } from "@/app/_libs/common";
import { useToast } from "@/app/_libs/contexts";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Icon, IconButton, List, ListItem, ListItemText, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { useExchanges, useProject } from "../../_libs/contexts";
import { deleteExchange, patchProjectCurrency, postExchange } from "../../_libs/data";

export default function DialogCurrencies({
    onChange,
    onChangeExchanges,
    onClose,
}: {
    onChange: () => Promise<void>,
    onChangeExchanges: () => Promise<void>,
    onClose: () => void,
}) {
    const project = useProject();
    const exchanges = useExchanges();
    const [curr, setCurr] = useState(project.currency);
    const [exCurr, setExCurr] = useState('');
    const [rate, setRate] = useState<number | null>(1);
    const [loading, setLoading] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const toast = useToast();

    const handleClick = async () => {
        try {
            setLoading(true);
            await patchProjectCurrency(project.id, curr);
            await onChange();
            toast('Success', 'Base currency changed.');
        } catch (e) {
            toast('Error', String(e), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddExchange = async () => {
        try {
            setLoading2(true);
            await postExchange(project.id, exCurr, rate ?? 1);
            await onChangeExchanges();
            setExCurr('');
            setRate(1);
            toast('Success', 'Exchange rate added.');
        } catch (e) {
            toast('Error', String(e), 'error');
        } finally {
            setLoading2(false);
        }
    }

    const handleDelExchange = async (currency: string) => {
        try {
            await deleteExchange(project.id, currency);
            await onChangeExchanges();
            toast('Success', 'Exchange rate deleted.');
        } catch (e) {
            toast('Error', String(e), 'error');
        }
    }

    return (
        <Dialog open onClose={onClose} fullWidth>
            <DialogTitle>Currencies</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} mb={3}>
                    <TextField
                        label="Base currency"
                        value={curr}
                        onChange={e => setCurr(e.target.value.toUpperCase().trim())}
                    />
                    <Button
                        onClick={handleClick}
                        disabled={!curr || curr === project.currency}
                        loading={loading}
                        variant="contained"
                    >
                        Save
                    </Button>
                </Stack>
                <Divider />
                <Stack spacing={2} mt={3}>
                    <TextField
                        label="Exchange currency"
                        value={exCurr}
                        onChange={e => setExCurr(e.target.value.toUpperCase().trim())}
                    />
                    <NumberField
                        id={exchanges.length.toString()}
                        label="Exchange rate"
                        value={rate}
                        onChange={e => setRate(e)}
                        min={0} max={999999}
                        slotProps={{
                            input: {
                                endAdornment:
                                    <span style={{ marginLeft: 8 }}>token(s)</span>,
                            },
                        }}
                    />
                    <Button
                        onClick={handleAddExchange}
                        disabled={!exCurr || !rate || (rate <= 0)}
                        loading={loading2}
                        variant="contained"
                    >
                        Add
                    </Button>
                    <List disablePadding>
                        {exchanges.map(e =>
                            <ListItem
                                key={e.currency}
                                secondaryAction={
                                    <IconButton
                                        onClick={f => handleDelExchange(e.currency)}
                                        edge="end"
                                    >
                                        <Icon>close</Icon>
                                    </IconButton>
                                }
                                disablePadding
                                disableGutters
                            >
                                <ListItemText
                                    primary={e.currency}
                                    secondary={`1 ${e.currency} = ${e.rate.toLocaleString()} token${e.rate > 1 ? 's' : ''}`}
                                />
                            </ListItem>
                        )}
                    </List>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Close</Button>
            </DialogActions>
        </Dialog>
    );
}
