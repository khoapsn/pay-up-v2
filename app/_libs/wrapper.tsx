'use client';

import { Alert, AlertColor, AlertTitle, Box, Snackbar, SnackbarCloseReason } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { memo, ReactNode, useCallback, useState } from "react";
import { ToastContext } from "./contexts";

export default function Wrapper({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);
    const [severity, setSeverity] = useState<AlertColor>('success');
    const [title, setTitle] = useState<string>();
    const [message, setMessage] = useState<string>();

    const toast = useCallback((title: string = 'Success', message?: string, severity: AlertColor = 'success') => {
        setTitle(title);
        setMessage(message);
        setSeverity(severity);
        setOpen(true);
    }, []);

    const handleClose = (_: any, reason?: SnackbarCloseReason) => {
        if (reason !== 'clickaway') setOpen(false);
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <ToastContext.Provider value={toast}>
                <Content>
                    {children}
                </Content>
            </ToastContext.Provider>
            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
            >
                <Alert onClose={handleClose} severity={severity}>
                    <AlertTitle>{title}</AlertTitle>
                    <span>{message}</span>
                </Alert>
            </Snackbar>
        </LocalizationProvider>
    );
}

const Content = memo(function Content({ children }: { children: ReactNode }) {
    return (
        <Box>
            {children}
        </Box>
    );
});
