import { StandardTextFieldProps, TextField } from "@mui/material";
import { useEffect, useState } from "react";

export function NumberField(props: Omit<StandardTextFieldProps, 'value' | 'onChange'> & {
    value: number | null;
    min?: number,
    max?: number,
    onChange: (value: number | null) => void,
}) {
    const { id, value, onChange, min, max } = props;
    const [text, setText] = useState('');

    useEffect(() => {
        setText(value?.toLocaleString() ?? '');
    }, [id]);

    useEffect(() => {
        if (value && max) {
            const newValue = Math.min(value, max);
            setText(newValue.toLocaleString());
            onChange(newValue);
        }
    }, [max]);

    const handleChange = (newText: string) => {
        if (!newText) {
            setText('');
            onChange(null);
        } else {
            const numValue = Number(newText.replaceAll(',', ''));

            if (!isNaN(numValue)) {
                if (min != undefined && numValue < min) return;
                if (max != undefined && numValue > max) return;

                const dotIdx = newText.indexOf('.');
                const decimal = (dotIdx > 0) ? newText.slice(dotIdx) : '';
                const formatText = Math.floor(numValue).toLocaleString() + decimal;
                setText(formatText);
                onChange(numValue);
            }
        }
    }

    return (
        <TextField
            {...props}
            value={text}
            onChange={e => handleChange(e.target.value)}
        />
    );
}
