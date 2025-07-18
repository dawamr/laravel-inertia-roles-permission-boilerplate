import * as React from "react";
import { mkConfig, generateCsv, download } from "export-to-csv";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shadcn/ui/table";
import {
    ArrowUpDown,
    ChevronDown,
    ChevronFirst,
    ChevronLast,
    ChevronLeft,
    ChevronRight,
    FileDown,
    MoreHorizontal,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/shadcn/ui/select";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { formatDate } from "date-fns";
import { Link, router } from "@inertiajs/react";
import { Label } from "@/shadcn/ui/label";

export default function RTable({
    data,
    columns,
    searchColumns,
    exportable = false,
    filename = "export",
    paginationLinks = null,
    meta = null,
}) {
    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [rowSelection, setRowSelection] = React.useState({});
    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        // getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    const csvConfig = mkConfig({
        fieldSeparator: ",",
        filename: formatDate(new Date(), "yyyyMMdd") + "_" + filename,
        decimalSeparator: ".",
        useKeysAsHeaders: true,
    });

    // export function
    const exportExcel = (rows) => {
        const rowData = rows.map((row) => row.original);
        const csv = generateCsv(csvConfig)(rowData);
        download(csvConfig)(csv);
    };

    return (
        <div className="">
            <div className="flex items-center gap-x-4 py-4">
                {searchColumns.map((c) => (
                    <Input
                        key={`searchColumn-${c}`}
                        placeholder={`Filter by ${c.replace("_", " ")}...`}
                        value={
                            table.getAllColumns().find((co) => co.id === c)
                                ? table.getColumn(c).getFilterValue()
                                : ""
                        }
                        onChange={(event) =>
                            table.getAllColumns().find((co) => co.id == c)
                                ? table
                                      .getColumn(c)
                                      ?.setFilterValue(event.target.value)
                                : null
                        }
                        className="max-w-sm"
                    />
                ))}
                {exportable === true && (
                    <Button
                        className="flex gap-x-2"
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                            exportExcel(table.getFilteredRowModel().rows)
                        }
                    >
                        <FileDown size={16} />
                        Export
                    </Button>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* Pagination - Always visible */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>

                {/* Meta info - Always shown with fallback values */}
                <div className="text-muted-foreground text-sm font-medium order-last sm:order-none">
                    Showing {meta?.from || 1} to {meta?.to || data.length} of{" "}
                    {meta?.total || data.length} entries
                </div>

                <div className="flex items-center space-x-2">
                    {/* Per Page Selector - Always visible */}
                    <div>
                        <Select
                            value={`${meta?.per_page || 10}`}
                            onValueChange={(p) => {
                                if (!p) return;

                                try {
                                    const params = new URLSearchParams(
                                        window.location.search
                                    );
                                    params.set("per_page", p);
                                    params.delete("page");

                                    router.get(
                                        window.location.pathname,
                                        Object.fromEntries(params),
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                        }
                                    );
                                } catch (error) {
                                    console.error(
                                        "Error handling per_page change:",
                                        error
                                    );
                                }
                            }}
                        >
                            <SelectTrigger className="w-full h-9">
                                <SelectValue placeholder="Per Page" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {[5, 10, 25, 50, 100, 150, 200].map((v) => (
                                        <SelectItem key={v} value={`${v}`}>
                                            Per Page {v}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Navigation Buttons - Always visible */}
                    <div className="flex space-x-1">
                        <Button
                            variant="outline"
                            size="sm"
                            title="First page"
                            disabled={
                                (meta?.current_page || 1) <= 1 ||
                                (meta?.total || 0) <= (meta?.per_page || 10)
                            }
                            onClick={() => {
                                if (paginationLinks?.first) {
                                    router.get(
                                        paginationLinks.first,
                                        {},
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                        }
                                    );
                                }
                            }}
                        >
                            <ChevronFirst className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            title="Previous page"
                            disabled={
                                (meta?.current_page || 1) <= 1 ||
                                (meta?.total || 0) <= (meta?.per_page || 10)
                            }
                            onClick={() => {
                                if (paginationLinks?.prev) {
                                    router.get(
                                        paginationLinks.prev,
                                        {},
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                        }
                                    );
                                }
                            }}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {/* Current Page Indicator */}
                        <div className="border rounded-md px-3 py-1 flex justify-center items-center text-sm font-medium bg-background">
                            {meta?.current_page || 1} of {meta?.last_page || 1}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            title="Next page"
                            disabled={
                                (meta?.current_page || 1) >=
                                    (meta?.last_page || 1) ||
                                (meta?.total || 0) <= (meta?.per_page || 10)
                            }
                            onClick={() => {
                                if (paginationLinks?.next) {
                                    router.get(
                                        paginationLinks.next,
                                        {},
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                        }
                                    );
                                }
                            }}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            title="Last page"
                            disabled={
                                (meta?.current_page || 1) >=
                                    (meta?.last_page || 1) ||
                                (meta?.total || 0) <= (meta?.per_page || 10)
                            }
                            onClick={() => {
                                if (paginationLinks?.last) {
                                    router.get(
                                        paginationLinks.last,
                                        {},
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                        }
                                    );
                                }
                            }}
                        >
                            <ChevronLast className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
