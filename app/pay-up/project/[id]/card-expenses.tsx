import { Button, Card, CardContent, CardHeader, Icon } from "@mui/material";
import { DataGrid, GridColDef, GridSortModel } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useProject } from "../../_libs/contexts";
import { getExpenses } from "../../_libs/data";
import { Expense, Member, PaidFor } from "../../_libs/models";

const sortModel: GridSortModel = [{ field: 'time', sort: 'desc' }];

export default function CardExpenses() {
    const project = useProject();
    const [rows, setRows] = useState<Expense[]>();

    const refresh = async () => {
        try {
            setRows(await getExpenses(project.id));
        } catch (e) {

        }
    };

    useEffect(() => {
        refresh();
    }, []);

    const columns = useMemo((): GridColDef[] => [
        // {
        //     field: 'Actions',
        //     type: 'actions',
        //     getActions: () => [
        //         <GridActionsCellItem key="edit" label="Edit" icon={<Icon>edit</Icon>} />
        //     ],
        //     hideable: false,
        //     maxWidth: 50,
        // },
        {
            field: 'id',
            headerName: 'ID',
            type: 'number',
            filterable: false,
        },
        {
            field: 'time',
            headerName: 'Time',
            type: 'date',
            valueGetter: e => new Date(e),
            valueFormatter: e => dayjs(e).format('MM/DD/YYYY HH:mm'),
            minWidth: 140,
        },
        {
            field: 'title',
            headerName: 'Title',
            minWidth: 200,
        },
        {
            field: 'paidBy',
            headerName: 'Paid By',
            type: 'singleSelect',
            valueGetter: (e: Member) => e.name,
            valueOptions: project.members.map(e => e.name),
        },
        {
            field: 'paidFor',
            headerName: 'Paid For',
            valueGetter: (e: PaidFor[]) => e.map(f => f.member.name).join(', '),
            minWidth: 200,
        },
        {
            field: 'amount',
            headerName: 'Amount',
            type: 'number',
        },
        {
            field: 'currency',
            headerName: 'Currency',
        },
    ], [project]);

    return (
        <Card>
            <CardHeader
                action={<Button variant="contained" startIcon={<Icon>add</Icon>}>Add expense</Button>}
            />
            <CardContent>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={!rows}
                    initialState={{
                        sorting: { sortModel },
                        columns: { columnVisibilityModel: { id: false } },
                        density: 'compact',
                    }}
                    onRowClick={() => console.log('row clicked')}
                    showToolbar
                    autosizeOnMount
                    autoHeight
                />
            </CardContent>
        </Card>
    );
}
