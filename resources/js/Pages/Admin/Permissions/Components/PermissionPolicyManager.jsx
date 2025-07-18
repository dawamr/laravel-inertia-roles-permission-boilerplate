import { Button } from "@/shadcn/ui/button";
import { Badge } from "@/shadcn/ui/badge";
import { Input } from "@/shadcn/ui/input";
import { Label } from "@/shadcn/ui/label";
import { Separator } from "@/shadcn/ui/separator";
import { Switch } from "@/shadcn/ui/switch";
import { Checkbox } from "@/shadcn/ui/checkbox";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/shadcn/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shadcn/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shadcn/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import {
    Shield,
    Users,
    Lock,
    Search,
    Filter,
    Settings,
    Eye,
    EyeOff,
    AlertTriangle,
    CheckCircle,
    RefreshCw,
    ArrowRight,
    Plus,
    Minus,
} from "lucide-react";
import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import Can from "@/Components/Can";

export default function PermissionPolicyManager({
    open,
    onOpenChange,
    permissions = [],
    roles = [],
    selectedRole = null,
    onPermissionUpdate,
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("all");
    const [showSystemPermissions, setShowSystemPermissions] = useState(true);
    const [permissionsByGroup, setPermissionsByGroup] = useState({});
    const [rolePermissions, setRolePermissions] = useState(new Set());
    const [bulkSelection, setBulkSelection] = useState(new Set());
    const [isLoading, setIsLoading] = useState(false);

    // Group permissions by their group_name
    useEffect(() => {
        const grouped = permissions.reduce((acc, permission) => {
            const group = permission.group_name || "general";
            if (!acc[group]) {
                acc[group] = [];
            }
            acc[group].push(permission);
            return acc;
        }, {});
        setPermissionsByGroup(grouped);
    }, [permissions]);

    // Set role permissions when role changes
    useEffect(() => {
        if (selectedRole && selectedRole.permissions) {
            const permissionIds = selectedRole.permissions.map((p) => p.id);
            setRolePermissions(new Set(permissionIds));
        } else {
            setRolePermissions(new Set());
        }
    }, [selectedRole]);

    // Filter permissions based on search and filters
    const getFilteredPermissions = (groupPermissions) => {
        return groupPermissions.filter((permission) => {
            // Search filter
            if (
                searchTerm &&
                !permission.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) &&
                !permission.display_name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase())
            ) {
                return false;
            }

            // System permissions filter
            if (!showSystemPermissions && permission.is_system) {
                return false;
            }

            return true;
        });
    };

    // Handle individual permission toggle
    const handlePermissionToggle = (permissionId, checked) => {
        const newPermissions = new Set(rolePermissions);
        if (checked) {
            newPermissions.add(permissionId);
        } else {
            newPermissions.delete(permissionId);
        }
        setRolePermissions(newPermissions);
    };

    // Handle group selection
    const handleGroupToggle = (groupPermissions, checked) => {
        const newPermissions = new Set(rolePermissions);
        groupPermissions.forEach((permission) => {
            if (checked) {
                newPermissions.add(permission.id);
            } else {
                newPermissions.delete(permission.id);
            }
        });
        setRolePermissions(newPermissions);
    };

    // Check if group is fully/partially selected
    const getGroupState = (groupPermissions) => {
        const filteredPermissions = getFilteredPermissions(groupPermissions);
        const selectedCount = filteredPermissions.filter((p) =>
            rolePermissions.has(p.id)
        ).length;

        if (selectedCount === 0) return "none";
        if (selectedCount === filteredPermissions.length) return "all";
        return "partial";
    };

    // Handle bulk operations
    const handleBulkOperation = (operation) => {
        const newPermissions = new Set(rolePermissions);

        switch (operation) {
            case "select_all":
                permissions.forEach((permission) => {
                    if (showSystemPermissions || !permission.is_system) {
                        newPermissions.add(permission.id);
                    }
                });
                break;
            case "deselect_all":
                newPermissions.clear();
                break;
            case "select_filtered":
                Object.values(permissionsByGroup)
                    .flat()
                    .filter(
                        (permission) =>
                            getFilteredPermissions([permission]).length > 0
                    )
                    .forEach((permission) => newPermissions.add(permission.id));
                break;
        }

        setRolePermissions(newPermissions);
    };

    // Save permissions
    const handleSave = async () => {
        if (!selectedRole) return;

        setIsLoading(true);
        try {
            const permissionIds = Array.from(rolePermissions);

            await router.post(
                route("admin.roles.sync-permissions", selectedRole.id),
                {
                    permissions: permissionIds,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        onPermissionUpdate && onPermissionUpdate(permissionIds);
                    },
                }
            );
        } catch (error) {
            console.error("Error saving permissions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const groups = Object.keys(permissionsByGroup);
    const totalSelected = rolePermissions.size;
    const totalAvailable = permissions.filter(
        (p) => showSystemPermissions || !p.is_system
    ).length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Manajemen Permission Policy
                        {selectedRole && (
                            <Badge variant="outline" className="ml-2">
                                {selectedRole.name}
                            </Badge>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        Kelola permission policy untuk role dan kontrol akses
                        sistem
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="assign" className="flex-1 flex flex-col">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="assign">
                            Assign Permissions
                        </TabsTrigger>
                        <TabsTrigger value="analyze">
                            Analyze Policy
                        </TabsTrigger>
                        <TabsTrigger value="compare">Compare Roles</TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value="assign"
                        className="flex-1 flex flex-col space-y-4"
                    >
                        {/* Controls */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search permissions..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="system-permissions"
                                    checked={showSystemPermissions}
                                    onCheckedChange={setShowSystemPermissions}
                                />
                                <Label
                                    htmlFor="system-permissions"
                                    className="text-sm"
                                >
                                    Show System
                                </Label>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-4">
                                <Badge variant="outline">
                                    {totalSelected} / {totalAvailable}{" "}
                                    permissions selected
                                </Badge>
                                {totalSelected > 0 && (
                                    <div className="text-sm text-muted-foreground">
                                        {Math.round(
                                            (totalSelected / totalAvailable) *
                                                100
                                        )}
                                        % coverage
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handleBulkOperation("select_all")
                                    }
                                >
                                    Select All
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handleBulkOperation("deselect_all")
                                    }
                                >
                                    Clear All
                                </Button>
                            </div>
                        </div>

                        {/* Permission Groups */}
                        <div className="flex-1 overflow-y-auto space-y-4">
                            {groups.map((groupName) => {
                                const groupPermissions =
                                    permissionsByGroup[groupName];
                                const filteredPermissions =
                                    getFilteredPermissions(groupPermissions);

                                if (filteredPermissions.length === 0)
                                    return null;

                                const groupState =
                                    getGroupState(groupPermissions);

                                return (
                                    <Card key={groupName}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        checked={
                                                            groupState === "all"
                                                        }
                                                        ref={(ref) => {
                                                            if (ref)
                                                                ref.indeterminate =
                                                                    groupState ===
                                                                    "partial";
                                                        }}
                                                        onCheckedChange={(
                                                            checked
                                                        ) =>
                                                            handleGroupToggle(
                                                                filteredPermissions,
                                                                checked
                                                            )
                                                        }
                                                    />
                                                    <CardTitle className="text-lg capitalize">
                                                        {groupName.replace(
                                                            "_",
                                                            " "
                                                        )}
                                                    </CardTitle>
                                                    <Badge variant="secondary">
                                                        {
                                                            filteredPermissions.filter(
                                                                (p) =>
                                                                    rolePermissions.has(
                                                                        p.id
                                                                    )
                                                            ).length
                                                        }{" "}
                                                        /{" "}
                                                        {
                                                            filteredPermissions.length
                                                        }
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {filteredPermissions.map(
                                                    (permission) => {
                                                        const isSelected =
                                                            rolePermissions.has(
                                                                permission.id
                                                            );
                                                        return (
                                                            <div
                                                                key={
                                                                    permission.id
                                                                }
                                                                className={`p-3 border rounded-lg transition-all ${
                                                                    isSelected
                                                                        ? "border-primary bg-primary/5"
                                                                        : "border-border"
                                                                }`}
                                                            >
                                                                <div className="flex items-start space-x-3">
                                                                    <Checkbox
                                                                        checked={
                                                                            isSelected
                                                                        }
                                                                        onCheckedChange={(
                                                                            checked
                                                                        ) =>
                                                                            handlePermissionToggle(
                                                                                permission.id,
                                                                                checked
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            permission.is_system &&
                                                                            !showSystemPermissions
                                                                        }
                                                                    />
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <h4 className="font-medium text-sm truncate">
                                                                                {
                                                                                    permission.name
                                                                                }
                                                                            </h4>
                                                                            {permission.is_system && (
                                                                                <Badge
                                                                                    variant="destructive"
                                                                                    className="text-xs"
                                                                                >
                                                                                    System
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        {permission.display_name && (
                                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                                {
                                                                                    permission.display_name
                                                                                }
                                                                            </p>
                                                                        )}
                                                                        {permission.description && (
                                                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                                                {
                                                                                    permission.description
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </TabsContent>

                    <TabsContent value="analyze" className="flex-1">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">
                                Permission Analysis
                            </h3>
                            {/* Analysis content would go here */}
                            <div className="text-center text-muted-foreground py-8">
                                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Permission analysis tools coming soon</p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="compare" className="flex-1">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">
                                Role Comparison
                            </h3>
                            {/* Comparison content would go here */}
                            <div className="text-center text-muted-foreground py-8">
                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Role comparison tools coming soon</p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="border-t pt-4">
                    <div className="flex justify-between items-center w-full">
                        <div className="text-sm text-muted-foreground">
                            {selectedRole
                                ? `Configuring permissions for ${selectedRole.name}`
                                : "No role selected"}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Batal
                            </Button>
                            <Can permit="edit roles">
                                <Button
                                    onClick={handleSave}
                                    disabled={!selectedRole || isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Simpan Permissions
                                        </>
                                    )}
                                </Button>
                            </Can>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
