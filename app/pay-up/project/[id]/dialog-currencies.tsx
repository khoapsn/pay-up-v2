import { useToast } from "@/app/_libs/contexts";
import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Icon, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useCurrencies, useExchanges, useProject } from "../../_libs/contexts";
import { patchProjectCurrency } from "../../_libs/data";

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
    const [exCurr, setExCurr] = useState<string | null>(null);
    const [rate, setRate] = useState(1);
    const currs = useCurrencies();
    const toast = useToast();

    const handleClick = async () => {
        try {
            await patchProjectCurrency(project.id, curr);
            await onChange();
            toast('Success', 'Base currency changed.');
        } catch (e) {
            toast('Error', String(e), 'error');
        }
    };

    const handleAddExchange = async () => {
        try {
            // TODO
            await onChangeExchanges();
            setExCurr(null);
            setRate(1);
            toast('Success', 'Exchange rate updated.');
        } catch (e) {
            toast('Error', String(e), 'error');
        }
    }

    return (
        <Dialog open onClose={onClose} fullWidth>
            <DialogTitle>Currencies</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} mb={3}>
                    <Autocomplete
                        value={curr}
                        onChange={(_, v) => { if (v) setCurr(v); }}
                        options={currs.map(e => e.currency)}
                        renderInput={params => <TextField {...params} label="Base currency" />}
                    />
                    <Button
                        onClick={handleClick}
                        disabled={curr === project.currency}
                        variant="contained"
                    >
                        Save
                    </Button>
                </Stack>
                <Divider />
                <Stack spacing={2} mt={3}>
                    <Autocomplete
                        value={exCurr}
                        onChange={(_, v) => setExCurr(v)}
                        options={currs.map(e => e.currency)}
                        renderInput={params => <TextField {...params} label="Exchange currency" />}
                    />
                    <TextField
                        label="Exchange rate"
                        type="number"
                        value={rate}
                        onChange={e => {
                            const value = Number(e.target.value);
                            if (value >= 0) setRate(value);
                        }}
                        slotProps={{ input: { endAdornment: 'token(s)' } }}
                    />
                    <Button
                        onClick={handleAddExchange}
                        disabled={!exCurr || !rate || (rate <= 0)}
                        variant="contained"
                    >
                        Add / Update
                    </Button>
                    <List disablePadding>
                        {exchanges.map(e =>
                            <ListItem
                                key={e.currency}
                                secondaryAction={<IconButton edge="end"><Icon>close</Icon></IconButton>}
                                disablePadding
                                disableGutters
                            >
                                <ListItemText
                                    primary={e.currency}
                                    secondary={`1 ${e.currency} = ${e.rate} token${e.rate > 1 ? 's' : ''}`}
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
