'use client';

import { Button, List, ListItem, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function Page() {
    const router = useRouter();
    const ids = ['abc123', 'def456'];

    return (
        <>
            <Typography>Recent Projects</Typography>
            <List>
                {ids.map((e, i) => (
                    <ListItem key={i}>
                        <Button onClick={() => router.push(`/project/${e}`)}>Project {i + 1}</Button>
                    </ListItem>
                ))}
            </List>
        </>
    );
}
