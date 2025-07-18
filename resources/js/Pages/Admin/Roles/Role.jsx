import { Button } from "@/shadcn/ui/button";
import { Head, Link } from "@inertiajs/react";
import PageHeading from "@/Components/PageHeading";
import { useForm } from "@inertiajs/react";
import { Label } from "@/shadcn/ui/label";
import { Input } from "@/shadcn/ui/input";
import InputError from "@/Components/InputError";
import React, { useState, useMemo } from "react";
import TwoColumnLayout from "@/Layouts/admin/TwoColumnLayout";

import {
    MoreHorizontal,
    PencilLine,
    PlusCircle,
    User,
    Shield,
    Search,
    CheckSquare,
    Square,
    Filter,
    Users,
    Lock,
    Unlock,
} from "lucide-react";
import ShadcnCard from "@/Components/ShadcnCard";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import { Switch } from "@/shadcn/ui/switch";
import { Badge } from "@/shadcn/ui/badge";
import { Separator } from "@/shadcn/ui/separator";
import Can from "@/Components/Can";
import UserHoverCard from "@/Components/UserHoverCard";
import PermissionPolicyManager from "@/Pages/Admin/Permissions/Components/PermissionPolicyManager";

export default function Role({ role, groupedPermissions }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [policyManagerOpen, setPolicyManagerOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: role ? role.name : "",
        permission_ids: role ? role?.permissions.map((p) => p.id) : [],
    });

    // Filter permissions based on search term
    const filteredGroupedPermissions = useMemo(() => {
        if (!searchTerm) return groupedPermissions;

        const filtered = {};
        Object.entries(groupedPermissions).forEach(
            ([groupName, permissions]) => {
                const filteredPermissions = permissions.filter(
                    (permission) =>
                        permission.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                        groupName
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                );
                if (filteredPermissions.length > 0) {
                    filtered[groupName] = filteredPermissions;
                }
            }
        );
        return filtered;
    }, [groupedPermissions, searchTerm]);

    // Check if all permissions in a group are selected
    const isGroupFullySelected = (groupPermissions) => {
        return groupPermissions.every((p) =>
            data.permission_ids.includes(p.id)
        );
    };

    // Check if some permissions in a group are selected
    const isGroupPartiallySelected = (groupPermissions) => {
        return (
            groupPermissions.some((p) => data.permission_ids.includes(p.id)) &&
            !isGroupFullySelected(groupPermissions)
        );
    };

    // Toggle all permissions in a group
    const toggleGroupPermissions = (groupPermissions, selectAll) => {
        const groupPermissionIds = groupPermissions.map((p) => p.id);

        if (selectAll) {
            // Add all group permissions
            const newPermissionIds = [
                ...new Set([...data.permission_ids, ...groupPermissionIds]),
            ];
            setData("permission_ids", newPermissionIds);
        } else {
            // Remove all group permissions
            const newPermissionIds = data.permission_ids.filter(
                (id) => !groupPermissionIds.includes(id)
            );
            setData("permission_ids", newPermissionIds);
        }
    };

    const submit = (e) => {
        e.preventDefault();

        if (role) {
            post(route("admin.roles.update", { id: role.id }));
        } else {
            post(route("admin.roles.store"));
        }
    };

    const selectedPermissionsCount = data.permission_ids.length;
    const totalPermissionsCount =
        Object.values(groupedPermissions).flat().length;

    return (
        <TwoColumnLayout>
            <Head>
                <title>{`${
                    role ? "Edit Role - " + role.name : "Create New Role"
                }`}</title>
            </Head>
            <TwoColumnLayout.Heading>
                <PageHeading>
                    <PageHeading.Title>
                        {role ? (
                            <div className="flex gap-x-3 items-center">
                                <Shield className="h-6 w-6 text-blue-600" />
                                <span className="capitalize font-semibold">
                                    {role.name}
                                </span>
                                <Badge variant="outline" className="ml-2">
                                    {role.permissions?.length || 0} permissions
                                </Badge>
                            </div>
                        ) : (
                            <div className="flex gap-x-3 items-center">
                                <PlusCircle className="h-6 w-6 text-green-600" />
                                <span>Create New Role</span>
                            </div>
                        )}
                    </PageHeading.Title>
                    <PageHeading.Actions>
                        <Can permit="view permissions">
                            <Button
                                variant="outline"
                                onClick={() => setPolicyManagerOpen(true)}
                                disabled={!role}
                            >
                                <Lock className="h-4 w-4 mr-2" />
                                Policy Manager
                            </Button>
                        </Can>
                        <Button asChild variant="outline">
                            <Link href={route("admin.roles.index")}>
                                Cancel
                            </Link>
                        </Button>
                        <Can permit="create roles">
                            <Button asChild variant="outline">
                                <Link href={route("admin.roles.create")}>
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Create New
                                </Link>
                            </Button>
                        </Can>
                    </PageHeading.Actions>
                </PageHeading>
                <div className="flex justify-between items-center">
                    <div>
                        {role ? (
                            <span className="text-blue-600 italic text-sm">
                                {route("admin.roles.edit", role.id)}
                            </span>
                        ) : (
                            <span className="text-muted-foreground text-sm">
                                Define role permissions and access controls
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                            {selectedPermissionsCount} / {totalPermissionsCount}{" "}
                            selected
                        </Badge>
                    </div>
                </div>
            </TwoColumnLayout.Heading>

            <TwoColumnLayout.Content>
                <TwoColumnLayout.Main>
                    <form onSubmit={submit} className="space-y-6">
                        {/* Role Basic Information */}
                        <ShadcnCard
                            title={
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Role Information
                                </div>
                            }
                            description="Basic role details and identification"
                        >
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Role Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        autoFocus={!role}
                                        disabled={role ? true : false} // Disable editing role name for existing roles
                                        className="mt-1"
                                        placeholder="Enter role name (e.g., Admin, Manager, Staff)"
                                        onChange={(e) => {
                                            setData("name", e.target.value);
                                        }}
                                    />
                                    <InputError
                                        message={errors.name}
                                        className="mt-2"
                                    />
                                    {role && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Role name cannot be changed after
                                            creation
                                        </p>
                                    )}
                                </div>
                            </div>
                        </ShadcnCard>

                        {/* Permissions Management */}
                        <ShadcnCard
                            title={
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-5 w-5" />
                                        Permissions Management
                                    </div>
                                    <Badge variant="outline">
                                        {selectedPermissionsCount} selected
                                    </Badge>
                                </div>
                            }
                            description="Configure what actions this role can perform in the system"
                        >
                            <div className="space-y-6">
                                {/* Search Permissions */}
                                <div className="flex items-center space-x-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search permissions or groups..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            className="pl-10"
                                        />
                                    </div>
                                    {searchTerm && (
                                        <Button
                                            variant="outline"
                                            onClick={() => setSearchTerm("")}
                                            size="sm"
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>

                                {/* Permission Groups */}
                                <div className="space-y-6">
                                    {Object.entries(
                                        filteredGroupedPermissions
                                    ).map(
                                        (
                                            [groupName, groupPermissions],
                                            index
                                        ) => {
                                            const isFullySelected =
                                                isGroupFullySelected(
                                                    groupPermissions
                                                );
                                            const isPartiallySelected =
                                                isGroupPartiallySelected(
                                                    groupPermissions
                                                );

                                            return (
                                                <div
                                                    key={index}
                                                    className="border rounded-lg p-4 space-y-4 bg-card"
                                                >
                                                    {/* Group Header */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="text-lg font-semibold capitalize flex items-center gap-2">
                                                                {groupName ===
                                                                    "users" && (
                                                                    <Users className="h-5 w-5 text-blue-500" />
                                                                )}
                                                                {groupName ===
                                                                    "roles" && (
                                                                    <Shield className="h-5 w-5 text-purple-500" />
                                                                )}
                                                                {groupName ===
                                                                    "dashboard" && (
                                                                    <Filter className="h-5 w-5 text-green-500" />
                                                                )}
                                                                {![
                                                                    "users",
                                                                    "roles",
                                                                    "dashboard",
                                                                ].includes(
                                                                    groupName
                                                                ) && (
                                                                    <Lock className="h-5 w-5 text-orange-500" />
                                                                )}
                                                                {groupName}
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="text-xs"
                                                                >
                                                                    {
                                                                        groupPermissions.length
                                                                    }{" "}
                                                                    permissions
                                                                </Badge>
                                                            </h4>
                                                        </div>

                                                        {/* Group Select All Toggle */}
                                                        <div className="flex items-center gap-2">
                                                            <Label className="text-sm text-muted-foreground">
                                                                Select All
                                                            </Label>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                type="button"
                                                                onClick={() =>
                                                                    toggleGroupPermissions(
                                                                        groupPermissions,
                                                                        !isFullySelected
                                                                    )
                                                                }
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                {isFullySelected ? (
                                                                    <CheckSquare className="h-4 w-4 text-green-600" />
                                                                ) : isPartiallySelected ? (
                                                                    <div className="h-4 w-4 bg-primary/50 rounded-sm" />
                                                                ) : (
                                                                    <Square className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Permissions Grid */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {groupPermissions.map(
                                                            (permission) => (
                                                                <Label
                                                                    key={
                                                                        permission.id
                                                                    }
                                                                    className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all hover:bg-accent ${
                                                                        data.permission_ids.includes(
                                                                            permission.id
                                                                        )
                                                                            ? "bg-primary/10 border-primary/30 shadow-sm"
                                                                            : "bg-background hover:bg-accent/50"
                                                                    }`}
                                                                >
                                                                    <Switch
                                                                        checked={data.permission_ids.includes(
                                                                            permission.id
                                                                        )}
                                                                        onCheckedChange={(
                                                                            checked
                                                                        ) => {
                                                                            if (
                                                                                checked
                                                                            ) {
                                                                                setData(
                                                                                    "permission_ids",
                                                                                    [
                                                                                        ...data.permission_ids,
                                                                                        permission.id,
                                                                                    ]
                                                                                );
                                                                            } else {
                                                                                setData(
                                                                                    "permission_ids",
                                                                                    data.permission_ids.filter(
                                                                                        (
                                                                                            value
                                                                                        ) =>
                                                                                            value !==
                                                                                            permission.id
                                                                                    )
                                                                                );
                                                                            }
                                                                        }}
                                                                    />
                                                                    <div className="flex-1">
                                                                        <span className="text-sm font-medium capitalize">
                                                                            {
                                                                                permission.name
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </Label>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>

                                {Object.keys(filteredGroupedPermissions)
                                    .length === 0 &&
                                    searchTerm && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>
                                                No permissions found for "
                                                {searchTerm}"
                                            </p>
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setSearchTerm("")
                                                }
                                                className="mt-4"
                                            >
                                                Clear Search
                                            </Button>
                                        </div>
                                    )}
                            </div>
                        </ShadcnCard>

                        <TwoColumnLayout.Actions isSticky>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="text-sm text-muted-foreground">
                                    {selectedPermissionsCount} of{" "}
                                    {totalPermissionsCount} permissions selected
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full sm:w-[200px]"
                                    disabled={
                                        processing ||
                                        selectedPermissionsCount === 0
                                    }
                                >
                                    {processing
                                        ? "Saving..."
                                        : role
                                        ? "Update Role"
                                        : "Create Role"}
                                </Button>
                            </div>
                        </TwoColumnLayout.Actions>
                    </form>
                </TwoColumnLayout.Main>

                <TwoColumnLayout.Aside>
                    {role && (
                        <div className="space-y-6">
                            {/* Role Statistics */}
                            <ShadcnCard
                                title={
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Role Statistics
                                    </div>
                                }
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">
                                            Total Permissions
                                        </span>
                                        <Badge variant="secondary">
                                            {role.permissions?.length || 0}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">
                                            Users Assigned
                                        </span>
                                        <Badge variant="secondary">
                                            {role.users?.length || 0}
                                        </Badge>
                                    </div>
                                    <Separator />
                                    <div className="text-sm text-muted-foreground">
                                        <p>
                                            <strong>Created:</strong>{" "}
                                            {new Date(
                                                role.created_at
                                            ).toLocaleDateString()}
                                        </p>
                                        <p>
                                            <strong>Last Updated:</strong>{" "}
                                            {new Date(
                                                role.updated_at
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </ShadcnCard>

                            {/* Users with this Role */}
                            <ShadcnCard
                                title={
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Users with this Role (
                                        {role.users?.length || 0})
                                    </div>
                                }
                            >
                                {role.users && role.users.length > 0 ? (
                                    <div className="space-y-2">
                                        {role.users.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center gap-2 p-2 rounded-md border"
                                            >
                                                <UserHoverCard user={user} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground">
                                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">
                                            No users assigned to this role
                                        </p>
                                    </div>
                                )}
                            </ShadcnCard>

                            {/* Quick Actions */}
                            <ShadcnCard title="Quick Actions">
                                <div className="space-y-2">
                                    <Can permit="view users">
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="w-full justify-start"
                                        >
                                            <Link
                                                href={route(
                                                    "admin.users.index"
                                                )}
                                            >
                                                <Users className="h-4 w-4 mr-2" />
                                                Manage Users
                                            </Link>
                                        </Button>
                                    </Can>
                                    <Can permit="view roles">
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="w-full justify-start"
                                        >
                                            <Link
                                                href={route(
                                                    "admin.roles.index"
                                                )}
                                            >
                                                <Shield className="h-4 w-4 mr-2" />
                                                All Roles
                                            </Link>
                                        </Button>
                                    </Can>
                                </div>
                            </ShadcnCard>
                        </div>
                    )}

                    {!role && (
                        <ShadcnCard
                            title="Creating Role"
                            description="You're creating a new role in the system"
                        >
                            <div className="space-y-4 text-sm text-muted-foreground">
                                <div className="flex items-start gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                                    <p>
                                        Choose a descriptive name for the role
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                                    <p>
                                        Select appropriate permissions for the
                                        role's responsibilities
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                                    <p>
                                        Use group toggles to quickly select
                                        related permissions
                                    </p>
                                </div>
                            </div>
                        </ShadcnCard>
                    )}
                </TwoColumnLayout.Aside>
            </TwoColumnLayout.Content>
        </TwoColumnLayout>
    );
}
