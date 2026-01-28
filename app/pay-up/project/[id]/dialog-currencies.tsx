import { useToast } from "@/app/_libs/contexts";
import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Icon, IconButton, List, ListItem, ListItemText, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { useExchanges, useProject } from "../../_libs/contexts";
import { patchProjectCurrency } from "../../_libs/data";
import { NumberField } from "@/app/_libs/common";

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
            setExCurr('');
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
                    <TextField
                        label="Base currency"
                        value={curr}
                        onChange={e => setCurr(e.target.value)}
                    />
                    <Button
                        onClick={handleClick}
                        disabled={!curr || curr === project.currency}
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
                        onChange={e => setExCurr(e.target.value)}
                    />
                    <NumberField
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
