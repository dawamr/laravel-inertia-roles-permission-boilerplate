import { Button } from "@/shadcn/ui/button";
import { ScrollArea } from "@/shadcn/ui/scroll-area";
import { Head, Link, router } from "@inertiajs/react";
import {
    ArrowUpDown,
    ChevronDown,
    MoreHorizontal,
    Pencil,
    PlusCircle,
    Users as UsersIcon,
    UserCheck,
    UserX,
    Shield,
    Mail,
    Calendar,
    Search,
    Filter,
    Download,
    Trash2,
    Eye,
    Settings,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/ui/avatar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/shadcn/ui/card";
import { Input } from "@/shadcn/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shadcn/ui/select";
import RTable from "@/Components/RTable";
import AuthenticatedLayout from "@/Layouts/admin/AuthenticatedLayout";
import PageHeading from "@/Components/PageHeading";
import Can from "@/Components/Can";
import { useState } from "react";

// Helper function to get user initials
const getUserInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${
        lastName?.charAt(0) || ""
    }`.toUpperCase();
};

// Helper function to get role color
const getRoleColor = (roleName) => {
    const colors = {
        admin: "destructive",
        manager: "default",
        user: "secondary",
        editor: "outline",
        viewer: "secondary",
    };
    return colors[roleName?.toLowerCase()] || "outline";
};

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
        accessorKey: "full_name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                    className="h-8 px-2"
                >
                    Pengguna
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const user = row.original;
            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.full_name} />
                        <AvatarFallback className="text-xs font-medium">
                            {getUserInitials(user.first_name, user.last_name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium">{user.full_name}</span>
                        <span className="text-xs text-muted-foreground">
                            {user.first_name} {user.last_name}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => {
            const email = row.getValue("email");
            return (
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm">{email}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "roles",
        header: "Role",
        cell: ({ row }) => {
            const roles = row.original.roles;
            return (
                <div className="flex flex-wrap gap-1">
                    {roles.map((role, index) => (
                        <Badge
                            key={index}
                            variant={getRoleColor(role.name)}
                            className="capitalize"
                        >
                            <Shield className="h-3 w-3 mr-1" />
                            {role.display_name || role.name}
                        </Badge>
                    ))}
                </div>
            );
        },
    },
    {
        accessorKey: "email_verified_at",
        header: "Status",
        cell: ({ row }) => {
            const isVerified = row.getValue("email_verified_at");
            return (
                <div className="flex items-center gap-2">
                    {isVerified ? (
                        <>
                            <UserCheck className="h-4 w-4 text-green-500" />
                            <Badge
                                variant="outline"
                                className="text-green-600 border-green-200"
                            >
                                Verified
                            </Badge>
                        </>
                    ) : (
                        <>
                            <UserX className="h-4 w-4 text-amber-500" />
                            <Badge
                                variant="outline"
                                className="text-amber-600 border-amber-200"
                            >
                                Unverified
                            </Badge>
                        </>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: "Bergabung",
        cell: ({ row }) => {
            const date = new Date(row.getValue("created_at"));
            return (
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                        {date.toLocaleDateString("id-ID")}
                    </span>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right">Aksi</div>,
        enableHiding: false,
        cell: ({ row }) => {
            const user = row.original;

            return (
                <div className="flex items-center justify-end gap-2">
                    <Can permit="view users">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Can>
                    <Can permit="edit users">
                        <Button
                            asChild
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                        >
                            <Link href={route("admin.users.edit", user.id)}>
                                <Pencil className="h-4 w-4" />
                            </Link>
                        </Button>
                    </Can>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() =>
                                    navigator.clipboard.writeText(user.id)
                                }
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    navigator.clipboard.writeText(user.email)
                                }
                            >
                                <Mail className="mr-2 h-4 w-4" />
                                Salin Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <Can permit="edit users">
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={route(
                                            "admin.users.edit",
                                            user.id
                                        )}
                                    >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit Pengguna
                                    </Link>
                                </DropdownMenuItem>
                            </Can>
                            <Can permit="delete users">
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hapus Pengguna
                                </DropdownMenuItem>
                            </Can>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];

export default function Users({ users, stats = null }) {
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("all");

    // Calculate stats if not provided from backend
    const userStats = stats || {
        total_users: users.meta.total,
        verified_users: users.data.filter((u) => u.email_verified_at).length,
        unverified_users: users.data.filter((u) => !u.email_verified_at).length,
        roles_distribution: users.data.reduce((acc, user) => {
            user.roles.forEach((role) => {
                acc[role.name] = (acc[role.name] || 0) + 1;
            });
            return acc;
        }, {}),
    };

    const handleBulkAction = (action, selectedRows) => {
        const selectedIds = selectedRows.map((row) => row.original.id);

        switch (action) {
            case "delete":
                if (
                    confirm(
                        `Apakah Anda yakin ingin menghapus ${selectedIds.length} pengguna?`
                    )
                ) {
                    router.delete(route("admin.users.bulk-delete"), {
                        data: { user_ids: selectedIds },
                    });
                }
                break;
            case "export":
                router.post(route("admin.users.export"), {
                    user_ids: selectedIds,
                    format: "csv",
                });
                break;
            default:
                break;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head>
                <title>Manajemen Pengguna</title>
            </Head>
            <ScrollArea className="h-full">
                <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                    <PageHeading>
                        <PageHeading.Title>
                            <div className="flex items-center gap-3">
                                <UsersIcon className="h-8 w-8" />
                                Manajemen Pengguna
                            </div>
                        </PageHeading.Title>
                        <PageHeading.Actions>
                            <div className="flex items-center gap-2">
                                <Can permit="export users">
                                    <Button variant="outline" className="gap-2">
                                        <Download className="h-4 w-4" />
                                        Export
                                    </Button>
                                </Can>
                                <Can permit="create users">
                                    <Button asChild className="gap-2">
                                        <Link
                                            href={route("admin.users.create")}
                                        >
                                            <PlusCircle className="h-4 w-4" />
                                            Tambah Pengguna
                                        </Link>
                                    </Button>
                                </Can>
                            </div>
                        </PageHeading.Actions>
                    </PageHeading>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Pengguna
                                </CardTitle>
                                <UsersIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {userStats.total_users}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Seluruh pengguna sistem
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Pengguna Verified
                                </CardTitle>
                                <UserCheck className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {userStats.verified_users}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Email terverifikasi
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Menunggu Verifikasi
                                </CardTitle>
                                <UserX className="h-4 w-4 text-amber-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-amber-600">
                                    {userStats.unverified_users}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Belum verifikasi email
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Role Terbanyak
                                </CardTitle>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {Object.keys(
                                        userStats.roles_distribution
                                    )[0] || "N/A"}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {Object.values(
                                        userStats.roles_distribution
                                    )[0] || 0}{" "}
                                    pengguna
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari pengguna berdasarkan nama atau email..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select
                            value={selectedRole}
                            onValueChange={setSelectedRole}
                        >
                            <SelectTrigger className="w-[200px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filter by Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Role</SelectItem>
                                {Object.keys(userStats.roles_distribution).map(
                                    (role) => (
                                        <SelectItem
                                            key={role}
                                            value={role}
                                            className="capitalize"
                                        >
                                            {role} (
                                            {userStats.roles_distribution[role]}
                                            )
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Users Table */}
                    <div className="rounded-md border">
                        <RTable
                            data={users.data}
                            columns={columns}
                            searchColumns={["full_name", "email"]}
                            exportable={true}
                            filename="users"
                        />
                    </div>
                </div>
            </ScrollArea>
        </AuthenticatedLayout>
    );
}
