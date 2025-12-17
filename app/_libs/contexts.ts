import { AlertColor } from "@mui/material";
import { createContext, useContext } from "react";

export const ToastContext = createContext<(title?: string, message?: string, severity?: AlertColor) => void>(() => { });

export const useToast = () => useContext(ToastContext);
