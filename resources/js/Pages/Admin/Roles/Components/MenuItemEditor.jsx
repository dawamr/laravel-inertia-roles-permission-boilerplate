import { useState, useEffect } from "react";
import { Badge } from "@/shadcn/ui/badge";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Label } from "@/shadcn/ui/label";
import { Textarea } from "@/shadcn/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shadcn/ui/select";
import { Checkbox } from "@/shadcn/ui/checkbox";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/shadcn/ui/card";
import { Separator } from "@/shadcn/ui/separator";
import {
    Menu,
    Shield,
    Save,
    X,
    Plus,
    Trash2,
    ExternalLink,
    Info,
} from "lucide-react";

const iconOptions = [
    "dashboard",
    "users",
    "shield",
    "fileText",
    "calendar",
    "settings",
    "menu",
    "list",
    "plus",
    "edit",
    "trash",
    "eye",
    "lock",
    "unlock",
    "home",
    "folder",
    "file",
    "image",
    "video",
    "music",
    "download",
];

export default function MenuItemEditor({
    item,
    permissions,
    onSave,
    onCancel,
}) {
    const [formData, setFormData] = useState({
        title: "",
        href: "",
        icon: "menu",
        label: "",
        permit: "",
        children: [],
    });

    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [permissionGroups, setPermissionGroups] = useState({});

    useEffect(() => {
        if (item) {
            setFormData({
                title: item.title || "",
                href: item.href || "",
                icon: item.icon || "menu",
                label: item.label || "",
                permit: item.permit || "",
                children: item.children || [],
            });

            // Parse existing permissions
            if (item.permit) {
                const perms = item.permit
                    .split("|")
                    .map((p) => p.trim())
                    .filter(Boolean);
                setSelectedPermissions(perms);
            } else {
                setSelectedPermissions([]);
            }
        }
    }, [item]);

    useEffect(() => {
        // Group permissions by group_name
        const grouped = permissions.reduce((acc, permission) => {
            const group = permission.group_name || "other";
            if (!acc[group]) acc[group] = [];
            acc[group].push(permission);
            return acc;
        }, {});
        setPermissionGroups(grouped);
    }, [permissions]);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Auto-fill label if it's empty
        if (field === "title" && !formData.label) {
            setFormData((prev) => ({
                ...prev,
                label: value,
            }));
        }
    };

    const handlePermissionToggle = (permissionName) => {
        setSelectedPermissions((prev) => {
            if (prev.includes(permissionName)) {
                return prev.filter((p) => p !== permissionName);
            } else {
                return [...prev, permissionName];
            }
        });
    };

    const handleSave = () => {
        const permitString =
            selectedPermissions.length > 0
                ? selectedPermissions.join("|")
                : null;

        const savedItem = {
            ...formData,
            permit: permitString,
        };

        onSave(savedItem);
    };

    const getPermissionByName = (name) => {
        return permissions.find((p) => p.name === name);
    };

    return (
        <div className="space-y-6">
            {/* Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Menu className="h-5 w-5" />
                        Basic Information
                    </CardTitle>
                    <CardDescription>
                        Configure the basic properties of the menu item.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) =>
                                    handleInputChange("title", e.target.value)
                                }
                                placeholder="Menu item title"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="label">Label</Label>
                            <Input
                                id="label"
                                value={formData.label}
                                onChange={(e) =>
                                    handleInputChange("label", e.target.value)
                                }
                                placeholder="Accessibility label"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="href">Route/URL</Label>
                            <Input
                                id="href"
                                value={formData.href}
                                onChange={(e) =>
                                    handleInputChange("href", e.target.value)
                                }
                                placeholder="route('admin.users.index') or #"
                            />
                            <p className="text-xs text-muted-foreground">
                                Use "#" for parent items or route() helper for
                                Laravel routes
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="icon">Icon</Label>
                            <Select
                                value={formData.icon}
                                onValueChange={(value) =>
                                    handleInputChange("icon", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select icon" />
                                </SelectTrigger>
                                <SelectContent>
                                    {iconOptions.map((icon) => (
                                        <SelectItem
                                            key={icon}
                                            value={icon}
                                            className="capitalize"
                                        >
                                            {icon}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Permission Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Permission Requirements
                    </CardTitle>
                    <CardDescription>
                        Select permissions required to access this menu item.
                        User needs ANY of the selected permissions (OR logic).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Selected Permissions Preview */}
                        {selectedPermissions.length > 0 && (
                            <div className="space-y-2">
                                <Label>
                                    Selected Permissions (
                                    {selectedPermissions.length})
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedPermissions.map((permName) => {
                                        const permission =
                                            getPermissionByName(permName);
                                        return (
                                            <Badge
                                                key={permName}
                                                variant={
                                                    permission
                                                        ? "default"
                                                        : "destructive"
                                                }
                                                className="gap-1"
                                            >
                                                <Shield className="h-3 w-3" />
                                                {permission
                                                    ? permission.display_name ||
                                                      permName
                                                    : `${permName} (missing)`}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-4 w-4 p-0 hover:bg-transparent"
                                                    onClick={() =>
                                                        handlePermissionToggle(
                                                            permName
                                                        )
                                                    }
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </Badge>
                                        );
                                    })}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    <Info className="h-3 w-3 inline mr-1" />
                                    User needs ANY of these permissions to see
                                    this menu item
                                </div>
                            </div>
                        )}

                        <Separator />

                        {/* Permission Groups */}
                        <div className="space-y-4">
                            <Label>Available Permissions by Group</Label>
                            {Object.entries(permissionGroups).map(
                                ([groupName, groupPermissions]) => (
                                    <Card
                                        key={groupName}
                                        className="border-dashed"
                                    >
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm capitalize">
                                                {groupName} (
                                                {groupPermissions.length})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="grid grid-cols-2 gap-2">
                                                {groupPermissions.map(
                                                    (permission) => (
                                                        <div
                                                            key={permission.id}
                                                            className="flex items-center space-x-2"
                                                        >
                                                            <Checkbox
                                                                id={`perm-${permission.id}`}
                                                                checked={selectedPermissions.includes(
                                                                    permission.name
                                                                )}
                                                                onCheckedChange={() =>
                                                                    handlePermissionToggle(
                                                                        permission.name
                                                                    )
                                                                }
                                                            />
                                                            <Label
                                                                htmlFor={`perm-${permission.id}`}
                                                                className="text-sm cursor-pointer"
                                                            >
                                                                {permission.display_name ||
                                                                    permission.name}
                                                            </Label>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Preview */}
            <Card>
                <CardHeader>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>
                        How this menu item will appear in the navigation.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg p-4 bg-muted/50">
                        <div className="flex items-center gap-3">
                            <div className="text-sm text-muted-foreground">
                                [{formData.icon}]
                            </div>
                            <div>
                                <div className="font-medium">
                                    {formData.title || "Menu Title"}
                                </div>
                                {formData.href && formData.href !== "#" && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <ExternalLink className="h-3 w-3" />
                                        <code className="text-xs">
                                            {formData.href}
                                        </code>
                                    </div>
                                )}
                            </div>
                        </div>
                        {selectedPermissions.length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                                <Shield className="h-3 w-3 inline mr-1" />
                                Requires: {selectedPermissions.join(" OR ")}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button onClick={handleSave} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Menu Item
                </Button>
            </div>
        </div>
    );
}
