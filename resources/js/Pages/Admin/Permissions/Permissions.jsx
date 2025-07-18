import { Button } from "@/shadcn/ui/button";
import { ScrollArea } from "@/shadcn/ui/scroll-area";
import { Head, Link, router } from "@inertiajs/react";
import {
    ArrowUpDown,
    MoreHorizontal,
    Pencil,
    PlusCircle,
    Shield,
    Trash2,
    Eye,
    Filter,
    Download,
    Lock,
    Users,
    AlertTriangle,
} from "lucide-react";
import { Checkbox } from "@/shadcn/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import { Badge } from "@/shadcn/ui/badge";
import { Input } from "@/shadcn/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shadcn/ui/dialog";
import RTable from "@/Components/RTable";
import AuthenticatedLayout from "@/Layouts/admin/AuthenticatedLayout";
import PageHeading from "@/Components/PageHeading";
import Can from "@/Components/Can";
import { useState } from "react";

export const columns = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                    className="h-8 px-2"
                >
                    Permission Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const permission = row.original;
            return (
                <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                        <span className="font-medium">
                            {row.getValue("name")}
                        </span>
                        {permission.display_name && (
                            <span className="text-xs text-muted-foreground">
                                {permission.display_name}
                            </span>
                        )}
                    </div>
                    {permission.is_system && (
                        <Badge variant="destructive" className="text-xs">
                            System
                        </Badge>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "group_name",
        header: "Group",
        cell: ({ row }) => {
            const group = row.getValue("group_name");
            const getGroupIcon = (groupName) => {
                switch (groupName) {
                    case "users":
                        return <Users className="h-4 w-4 text-blue-500" />;
                    case "roles":
                        return <Shield className="h-4 w-4 text-purple-500" />;
                    case "dashboard":
                        return <Filter className="h-4 w-4 text-green-500" />;
                    case "permissions":
                        return <Lock className="h-4 w-4 text-red-500" />;
                    default:
                        return <Lock className="h-4 w-4 text-orange-500" />;
                }
            };

            return (
                <div className="flex items-center gap-2">
                    {getGroupIcon(group)}
                    <Badge variant="outline" className="capitalize">
                        {group}
                    </Badge>
                </div>
            );
        },
    },
    {
        accessorKey: "guard_name",
        header: "Guard",
        cell: ({ row }) => (
            <Badge variant="secondary">{row.getValue("guard_name")}</Badge>
        ),
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
            const description = row.getValue("description");
            return description ? (
                <span
                    className="text-sm text-muted-foreground max-w-md truncate"
                    title={description}
                >
                    {description}
                </span>
            ) : (
                <span className="text-xs text-muted-foreground italic">
                    No description
                </span>
            );
        },
    },
    {
        accessorKey: "roles_count",
        header: "Used in Roles",
        cell: ({ row }) => {
            const count = row.getValue("roles_count") || 0;
            return (
                <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>{count}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "users_count",
        header: "Direct Users",
        cell: ({ row }) => {
            const count = row.getValue("users_count") || 0;
            return (
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{count}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => {
            const date = new Date(row.getValue("created_at"));
            return (
                <span className="text-sm text-muted-foreground">
                    {date.toLocaleDateString()}
                </span>
            );
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        enableHiding: false,
        cell: ({ row }) => {
            const permission = row.original;

            return (
                <div className="text-right">
                    <Can permit="edit permissions">
                        <Button asChild variant="outline" size="sm">
                            <Link
                                href={route(
                                    "admin.permissions.edit",
                                    permission.id
                                )}
                            >
                                <Pencil className="h-4 w-4" />
                            </Link>
                        </Button>
                    </Can>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 ml-1"
                            >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() =>
                                    navigator.clipboard.writeText(
                                        permission.name
                                    )
                                }
                            >
                                Copy Permission Name
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <Can permit="view permissions">
                                <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                </DropdownMenuItem>
                            </Can>
                            <Can permit="view roles">
                                <DropdownMenuItem
                                    onClick={() =>
                                        router.visit(
                                            route("admin.roles.index", {
                                                permission: permission.id,
                                            })
                                        )
                                    }
                                >
                                    <Shield className="h-4 w-4 mr-2" />
                                    View Roles Using This
                                </DropdownMenuItem>
                            </Can>
                            <DropdownMenuSeparator />
                            <Can permit="delete permissions">
                                <DropdownMenuItem
                                    className="text-red-600"
                                    disabled={permission.is_system}
                                    onClick={() => {
                                        if (
                                            confirm(
                                                "Are you sure you want to delete this permission?"
                                            )
                                        ) {
                                            router.delete(
                                                route(
                                                    "admin.permissions.destroy",
                                                    permission.id
                                                )
                                            );
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Permission
                                    {permission.is_system && (
                                        <AlertTriangle className="h-4 w-4 ml-2" />
                                    )}
                                </DropdownMenuItem>
                            </Can>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];

export default function Permissions({ permissions, groups, stats }) {
    const [showGroupManager, setShowGroupManager] = useState(false);

    const GroupManager = () => {
        const [newGroupName, setNewGroupName] = useState("");

        const handleCreateGroup = () => {
            if (newGroupName.trim()) {
                // Here you would call API to create group
                console.log("Creating group:", newGroupName);
                setNewGroupName("");
            }
        };

        const handleDeleteGroup = (groupName) => {
            if (
                confirm(
                    `Apakah Anda yakin ingin menghapus grup "${groupName}"?`
                )
            ) {
                // Here you would call API to delete group
                console.log("Deleting group:", groupName);
            }
        };

        const getGroupStats = (groupName) => {
            const count =
                permissions?.data?.filter((p) => p.group_name === groupName)
                    .length || 0;
            return count;
        };

        return (
            <div className="space-y-4">
                {/* Add New Group */}
                <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Tambah Grup Baru</h4>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Nama grup baru..."
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleCreateGroup();
                                }
                            }}
                        />
                        <Button
                            onClick={handleCreateGroup}
                            disabled={!newGroupName.trim()}
                        >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Tambah
                        </Button>
                    </div>
                </div>

                {/* Existing Groups */}
                <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Grup Yang Ada</h4>
                    <div className="space-y-2">
                        {groups &&
                            groups.map((group) => (
                                <div
                                    key={group}
                                    className="flex items-center justify-between p-3 border rounded-md"
                                >
                                    <div className="flex items-center gap-3">
                                        <Filter className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <span className="font-medium capitalize">
                                                {group}
                                            </span>
                                            <p className="text-sm text-muted-foreground">
                                                {getGroupStats(group)}{" "}
                                                permissions
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setShowGroupManager(false);
                                                // Table filter akan handle filtering group
                                            }}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            Lihat
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                handleDeleteGroup(group)
                                            }
                                            disabled={getGroupStats(group) > 0}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head>
                <title>Manajemen Permission</title>
            </Head>
            <ScrollArea className="h-full">
                <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                    <PageHeading>
                        <PageHeading.Title>
                            <div className="flex items-center gap-3">
                                <Lock className="h-6 w-6 text-primary" />
                                Manajemen Permission (
                                {permissions?.meta?.total || 0})
                            </div>
                        </PageHeading.Title>
                        <PageHeading.Actions>
                            <Can permit="export permissions">
                                <Button variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </Can>
                            <Can permit="create permissions">
                                <Button asChild>
                                    <Link
                                        href={route("admin.permissions.create")}
                                    >
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Buat Permission
                                    </Link>
                                </Button>
                            </Can>
                        </PageHeading.Actions>
                    </PageHeading>

                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="rounded-lg border p-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Total Permissions
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {stats.total_permissions}
                                        </p>
                                    </div>
                                    <Lock className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="rounded-lg border p-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Permission Groups
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {stats.total_groups}
                                        </p>
                                    </div>
                                    <Filter className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="rounded-lg border p-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Roles Using
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {stats.roles_count}
                                        </p>
                                    </div>
                                    <Shield className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="rounded-lg border p-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Direct Users
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {stats.users_count}
                                        </p>
                                    </div>
                                    <Users className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Links */}
                    <div className="flex gap-2 flex-wrap">
                        <Can permit="view roles">
                            <Button asChild variant="outline" size="sm">
                                <Link href={route("admin.roles.index")}>
                                    <Shield className="h-4 w-4 mr-2" />
                                    Kelola Roles
                                </Link>
                            </Button>
                        </Can>
                        <Can permit="view users">
                            <Button asChild variant="outline" size="sm">
                                <Link href={route("admin.users.index")}>
                                    <Users className="h-4 w-4 mr-2" />
                                    Kelola Users
                                </Link>
                            </Button>
                        </Can>
                        <Can permit="manage permissions">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowGroupManager(true)}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Kelola Group
                            </Button>
                        </Can>
                    </div>

                    {/* Table */}
                    <div className="grid gap-4 grid-cols-1">
                        <RTable
                            data={permissions?.data || []}
                            columns={columns}
                            searchColumns={["name", "group_name"]}
                            filename="permissions"
                            paginationLinks={permissions?.links}
                            meta={permissions?.meta}
                        />
                    </div>
                </div>
            </ScrollArea>

            {/* Group Manager Modal */}
            <Dialog open={showGroupManager} onOpenChange={setShowGroupManager}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Kelola Grup Permission
                        </DialogTitle>
                        <DialogDescription>
                            Kelola grup permission untuk mengorganisir
                            permission berdasarkan kategori
                        </DialogDescription>
                    </DialogHeader>
                    <GroupManager />
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
