import { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import { Badge } from "@/shadcn/ui/badge";
import { Button } from "@/shadcn/ui/button";
import { Checkbox } from "@/shadcn/ui/checkbox";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/shadcn/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shadcn/ui/table";
import { ScrollArea } from "@/shadcn/ui/scroll-area";
import { Separator } from "@/shadcn/ui/separator";
import {
    Shield,
    Users,
    Settings,
    Save,
    RotateCcw,
    Eye,
    CheckCircle,
    XCircle,
    Filter,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shadcn/ui/select";
import AuthenticatedLayout from "@/Layouts/admin/AuthenticatedLayout";
import PageHeading from "@/Components/PageHeading";
import { useToast } from "@/shadcn/ui/use-toast";

export default function PermissionMatrix({
    roles,
    permissions,
    rolePermissions,
}) {
    const { toast } = useToast();
    const [matrix, setMatrix] = useState({});
    const [selectedGroup, setSelectedGroup] = useState("all");
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);

    // Group permissions by group_name
    const groupedPermissions = permissions.reduce((acc, permission) => {
        const group = permission.group_name || "other";
        if (!acc[group]) acc[group] = [];
        acc[group].push(permission);
        return acc;
    }, {});

    const permissionGroups = Object.keys(groupedPermissions);

    // Initialize matrix from rolePermissions
    useEffect(() => {
        const initialMatrix = {};
        roles.forEach((role) => {
            initialMatrix[role.id] = {};
            permissions.forEach((permission) => {
                const hasPermission = rolePermissions.some(
                    (rp) =>
                        rp.role_id === role.id &&
                        rp.permission_id === permission.id
                );
                initialMatrix[role.id][permission.id] = hasPermission;
            });
        });
        setMatrix(initialMatrix);
    }, [roles, permissions, rolePermissions]);

    const togglePermission = (roleId, permissionId) => {
        setMatrix((prev) => ({
            ...prev,
            [roleId]: {
                ...prev[roleId],
                [permissionId]: !prev[roleId]?.[permissionId],
            },
        }));
        setHasChanges(true);
    };

    const toggleAllPermissionsForRole = (roleId, checked) => {
        const permissionsToShow =
            selectedGroup === "all"
                ? permissions
                : groupedPermissions[selectedGroup];

        setMatrix((prev) => ({
            ...prev,
            [roleId]: {
                ...prev[roleId],
                ...Object.fromEntries(
                    permissionsToShow.map((p) => [p.id, checked])
                ),
            },
        }));
        setHasChanges(true);
    };

    const toggleAllRolesForPermission = (permissionId, checked) => {
        setMatrix((prev) => {
            const newMatrix = { ...prev };
            roles.forEach((role) => {
                newMatrix[role.id] = {
                    ...newMatrix[role.id],
                    [permissionId]: checked,
                };
            });
            return newMatrix;
        });
        setHasChanges(true);
    };

    const saveChanges = async () => {
        setSaving(true);
        try {
            await router.post(
                route("admin.roles.update-permissions-matrix"),
                {
                    matrix: matrix,
                },
                {
                    onSuccess: () => {
                        toast({
                            title: "Berhasil",
                            description: "Permission matrix berhasil disimpan",
                        });
                        setHasChanges(false);
                    },
                    onError: () => {
                        toast({
                            title: "Error",
                            description: "Gagal menyimpan permission matrix",
                            variant: "destructive",
                        });
                    },
                }
            );
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const resetChanges = () => {
        window.location.reload();
    };

    const permissionsToShow =
        selectedGroup === "all"
            ? permissions
            : groupedPermissions[selectedGroup] || [];

    const getRolePermissionCount = (roleId) => {
        return permissions.filter((p) => matrix[roleId]?.[p.id]).length;
    };

    const getPermissionRoleCount = (permissionId) => {
        return roles.filter((r) => matrix[r.id]?.[permissionId]).length;
    };

    return (
        <AuthenticatedLayout>
            <Head>
                <title>Permission Matrix</title>
            </Head>
            <ScrollArea className="h-full">
                <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                    <PageHeading>
                        <PageHeading.Title>
                            <div className="flex items-center gap-3">
                                <Shield className="h-8 w-8" />
                                Permission Matrix
                            </div>
                        </PageHeading.Title>
                        <PageHeading.Actions>
                            <div className="flex items-center gap-2">
                                {hasChanges && (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={resetChanges}
                                            className="gap-2"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                            Reset
                                        </Button>
                                        <Button
                                            onClick={saveChanges}
                                            disabled={saving}
                                            className="gap-2"
                                        >
                                            <Save className="h-4 w-4" />
                                            {saving
                                                ? "Menyimpan..."
                                                : "Simpan Perubahan"}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </PageHeading.Actions>
                    </PageHeading>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Roles
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {roles.length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Permissions
                                </CardTitle>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {permissions.length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Permission Groups
                                </CardTitle>
                                <Settings className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {permissionGroups.length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Changes
                                </CardTitle>
                                {hasChanges ? (
                                    <XCircle className="h-4 w-4 text-amber-600" />
                                ) : (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={`text-2xl font-bold ${
                                        hasChanges
                                            ? "text-amber-600"
                                            : "text-green-600"
                                    }`}
                                >
                                    {hasChanges ? "Unsaved" : "Saved"}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filter */}
                    <div className="flex items-center gap-4">
                        <Select
                            value={selectedGroup}
                            onValueChange={setSelectedGroup}
                        >
                            <SelectTrigger className="w-[200px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filter Group" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Groups</SelectItem>
                                {permissionGroups.map((group) => (
                                    <SelectItem
                                        key={group}
                                        value={group}
                                        className="capitalize"
                                    >
                                        {group} (
                                        {groupedPermissions[group].length})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="text-sm text-muted-foreground">
                            Showing {permissionsToShow.length} permissions
                        </div>
                    </div>

                    {/* Permission Matrix Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Role vs Permission Matrix</CardTitle>
                            <CardDescription>
                                Kelola permissions untuk setiap role. Centang
                                untuk memberikan akses, hapus centang untuk
                                mencabut akses.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[200px] sticky left-0 bg-background">
                                                Permission
                                            </TableHead>
                                            {roles.map((role) => (
                                                <TableHead
                                                    key={role.id}
                                                    className="text-center min-w-[120px]"
                                                >
                                                    <div className="space-y-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="capitalize"
                                                        >
                                                            {role.display_name ||
                                                                role.name}
                                                        </Badge>
                                                        <div className="text-xs text-muted-foreground">
                                                            {getRolePermissionCount(
                                                                role.id
                                                            )}
                                                            /
                                                            {permissions.length}
                                                        </div>
                                                        <Checkbox
                                                            checked={permissionsToShow.every(
                                                                (p) =>
                                                                    matrix[
                                                                        role.id
                                                                    ]?.[p.id]
                                                            )}
                                                            onCheckedChange={(
                                                                checked
                                                            ) =>
                                                                toggleAllPermissionsForRole(
                                                                    role.id,
                                                                    checked
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </TableHead>
                                            ))}
                                            <TableHead className="text-center">
                                                <div className="text-xs text-muted-foreground">
                                                    All Roles
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {permissionsToShow.map((permission) => (
                                            <TableRow key={permission.id}>
                                                <TableCell className="sticky left-0 bg-background">
                                                    <div>
                                                        <div className="font-medium">
                                                            {permission.display_name ||
                                                                permission.name}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {permission.name}
                                                        </div>
                                                        <Badge
                                                            variant="secondary"
                                                            className="mt-1"
                                                        >
                                                            {
                                                                permission.group_name
                                                            }
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                {roles.map((role) => (
                                                    <TableCell
                                                        key={role.id}
                                                        className="text-center"
                                                    >
                                                        <Checkbox
                                                            checked={
                                                                matrix[
                                                                    role.id
                                                                ]?.[
                                                                    permission
                                                                        .id
                                                                ] || false
                                                            }
                                                            onCheckedChange={() =>
                                                                togglePermission(
                                                                    role.id,
                                                                    permission.id
                                                                )
                                                            }
                                                        />
                                                    </TableCell>
                                                ))}
                                                <TableCell className="text-center">
                                                    <div className="space-y-1">
                                                        <div className="text-xs text-muted-foreground">
                                                            {getPermissionRoleCount(
                                                                permission.id
                                                            )}
                                                            /{roles.length}
                                                        </div>
                                                        <Checkbox
                                                            checked={roles.every(
                                                                (r) =>
                                                                    matrix[
                                                                        r.id
                                                                    ]?.[
                                                                        permission
                                                                            .id
                                                                    ]
                                                            )}
                                                            onCheckedChange={(
                                                                checked
                                                            ) =>
                                                                toggleAllRolesForPermission(
                                                                    permission.id,
                                                                    checked
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </ScrollArea>
        </AuthenticatedLayout>
    );
}
