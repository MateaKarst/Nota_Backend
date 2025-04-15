"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { formatDateTime } from "@/utils/Formatting";

type EditableTableProps = {
    data: Record<string, unknown>[];
    table: string;
    visibleColumns?: string[];
    columnLabels?: Record<string, string>;
    onCellUpdate?: (
        rowId: string | number,
        column: string,
        newValue: string
    ) => Promise<void>;
    onRowDelete?: (rowId: string | number) => Promise<void>; // Function to handle row deletion
    onRowEdit?: (rowId: string | number) => void; // Function to handle row edit (could be a modal or something)
};

const isISODateTime = (value: unknown): boolean => {
    if (typeof value !== "string") return false;

    const date = new Date(value);
    return !isNaN(date.getTime()) && value.includes("T");
};

const EditableTable: React.FC<EditableTableProps> = ({
    data,
    table,
    visibleColumns,
    columnLabels = {},
    onRowDelete,
    onRowEdit,
}) => {
    const [tableData, setTableData] = useState(data);

    useEffect(() => {
        setTableData(data);
    }, [data]);

    const columns =
        visibleColumns && visibleColumns.length > 0
            ? visibleColumns
            : data.length > 0
            ? Object.keys(data[0])
            : [];

    const handleEditClick = (rowId: string | number) => {
        if (onRowEdit) onRowEdit(rowId);
    };

    const handleDeleteClick = async (rowId: string | number) => {
        if (onRowDelete) {
            try {
                await onRowDelete(rowId);
                toast.success("Row deleted successfully");
            } catch (error) {
                toast.error("Failed to delete row");
                console.error(error);
            }
        }
    };

    return (
        <div className="container mt-5">
            <h4 className="center-align">{table.toUpperCase()} Table</h4>
            <div className="table-responsive">
                <table className="table highlight striped">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col}>{columnLabels[col] ?? col}</th>
                            ))}
                            <th>Actions</th> {/* New column for Actions */}
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((row, rowIndex) => (
                            <tr key={(row.id as string | number) ?? rowIndex}>
                                {columns.map((col) => (
                                    <td key={col}>
                                        {/* Display the value in the cell without the click-to-edit functionality */}
                                        {isISODateTime(row[col])
                                            ? formatDateTime(String(row[col]))
                                            : String(row[col] ?? "")}
                                    </td>
                                ))}
                                {/* New Actions Column */}
                                <td>
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => handleEditClick(row.id as string | number)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm ml-2"
                                        onClick={() => handleDeleteClick(row.id as string | number)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EditableTable;
