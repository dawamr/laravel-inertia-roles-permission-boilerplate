import { useState, Fragment } from "react";
import { Head, router } from "@inertiajs/react";
import { Badge } from "@/shadcn/ui/badge";
import { Button } from "@/shadcn/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import {
    Menu,
    Shield,
    Settings,
    CheckCircle,
    XCircle,
    Info,
    Edit,
    Save,
    Plus,
    Trash2,
    GripVertical,
    Eye,
} from "lucide-react";
import AuthenticatedLayout from "@/Layouts/admin/AuthenticatedLayout";
import PageHeading from "@/Components/PageHeading";
import NavigationEditor from "./Components/NavigationEditor";

export default function MenuConfiguration({ menuItems, permissions }) {
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingItems, setEditingItems] = useState(menuItems || []);

    // Safety check for menuItems
    const safeMenuItems = menuItems || [];
    const safePermissions = permissions || [];

    // Helper function to parse permit string into array
    const parsePermit = (permitString) => {
        if (!permitString) return [];
        return permitString.split("|").map((p) => p.trim());
    };

    // Helper function to get permission details
    const getPermissionDetails = (permissionName) => {
        return safePermissions.find((p) => p.name === permissionName);
    };

    const saveNavigationChanges = () => {
        router.post(
            route("admin.roles.save-navigation"),
            {
                menuItems: editingItems,
            },
            {
                onSuccess: () => {
                    setIsEditing(false);
                    // Update the menuItems with edited items to reflect changes immediately
                    // Flash notification will be shown automatically via AuthenticatedLayout
                },
                onError: (errors) => {
                    console.error("Failed to save navigation:", errors);
                },
            }
        );
    };

    const renderMenuRow = (item, level = 0, keyPrefix = "") => {
        const requiredPermissions = parsePermit(item.permit);
        const hasChildren = item.children && item.children.length > 0;
        const uniqueKey =
            keyPrefix || `${item.title}-${item.href || "no-href"}-${level}`;

        return (
            <Fragment key={`fragment-${uniqueKey}`}>
                <TableRow
                    key={`row-${uniqueKey}`}
                    className={level > 0 ? "bg-muted/50" : ""}
                >
                    <TableCell>
                        <div
                            className={`${
                                level > 0 ? "ml-6" : ""
                            } flex items-center gap-2`}
                        >
                            {level > 0 && (
                                <div className="w-4 h-px bg-border"></div>
                            )}
                            <Menu className="h-4 w-4" />
                            <span className="font-medium">{item.title}</span>
                            {hasChildren && (
                                <Badge variant="secondary" className="text-xs">
                                    {item.children.length} items
                                </Badge>
                            )}
                        </div>
                    </TableCell>
                    <TableCell>
                        {item.href && (
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                                {item.href}
                            </code>
                        )}
                    </TableCell>
                    <TableCell>
                        <div className="space-y-1">
                            {requiredPermissions.length > 0 ? (
                                requiredPermissions.map((permName, index) => {
                                    const permission =
                                        getPermissionDetails(permName);
                                    return (
                                        <div
                                            key={`perm-${uniqueKey}-${index}`}
                                            className="flex items-center gap-2"
                                        >
                                            {permission ? (
                                                <>
                                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {permission.display_name ||
                                                            permName}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        ({permission.group_name}
                                                        )
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="h-3 w-3 text-red-500" />
                                                    <Badge
                                                        variant="destructive"
                                                        className="text-xs"
                                                    >
                                                        {permName} (missing)
                                                    </Badge>
                                                </>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Info className="h-3 w-3 text-blue-500" />
                                    <span className="text-xs text-muted-foreground">
                                        No restrictions
                                    </span>
                                </div>
                            )}
                        </div>
                    </TableCell>
                    <TableCell>
                        <Badge
                            variant={
                                requiredPermissions.length > 0
                                    ? "default"
                                    : "secondary"
                            }
                        >
                            {requiredPermissions.length > 0
                                ? `${requiredPermissions.length} permissions`
                                : "Public"}
                        </Badge>
                    </TableCell>
                </TableRow>
                {hasChildren &&
                    item.children.map((child, childIndex) =>
                        renderMenuRow(
                            child,
                            level + 1,
                            `${uniqueKey}-child-${childIndex}`
                        )
                    )}
            </Fragment>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head>
                <title>Menu Configuration</title>
            </Head>
            <ScrollArea className="h-full">
                <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                    <PageHeading>
                        <PageHeading.Title>
                            <div className="flex items-center gap-3">
                                <Settings className="h-8 w-8" />
                                Menu Configuration
                            </div>
                        </PageHeading.Title>
                        <PageHeading.Actions>
                            <div className="flex items-center gap-2">
                                {isEditing ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditingItems(safeMenuItems);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={saveNavigationChanges}
                                            className="gap-2"
                                        >
                                            <Save className="h-4 w-4" />
                                            Save Changes
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        className="gap-2"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Edit Navigation
                                    </Button>
                                )}
                            </div>
                        </PageHeading.Actions>
                    </PageHeading>

                    {/* Error/Loading State */}
                    {!menuItems && (
                        <Card>
                            <CardContent className="p-6">
                                <div className="text-center space-y-2">
                                    <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                                    <h3 className="text-lg font-semibold">
                                        Failed to Load Navigation Data
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Could not parse nav-data.js file. Please
                                        check the file format.
                                    </p>
                                    <Button
                                        onClick={() => window.location.reload()}
                                        variant="outline"
                                        className="mt-4"
                                    >
                                        Retry
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {safeMenuItems.length === 0 && menuItems && (
                        <Card>
                            <CardContent className="p-6">
                                <div className="text-center space-y-2">
                                    <Info className="h-12 w-12 text-blue-500 mx-auto" />
                                    <h3 className="text-lg font-semibold">
                                        No Menu Items Found
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Navigation data is empty. You can start
                                        adding menu items using the editor.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Info Cards */}
                    {safeMenuItems.length > 0 && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Menu Items
                                    </CardTitle>
                                    <Menu className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {safeMenuItems.reduce(
                                            (acc, item) =>
                                                acc +
                                                1 +
                                                (item.children
                                                    ? item.children.length
                                                    : 0),
                                            0
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Including sub-items
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Protected Items
                                    </CardTitle>
                                    <Shield className="h-4 w-4 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">
                                        {
                                            safeMenuItems.filter(
                                                (item) => item.permit
                                            ).length
                                        }
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Have permission requirements
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Public Items
                                    </CardTitle>
                                    <Info className="h-4 w-4 text-blue-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {
                                            safeMenuItems.filter(
                                                (item) => !item.permit
                                            ).length
                                        }
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        No restrictions
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Available Permissions
                                    </CardTitle>
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {safePermissions.length}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        System permissions
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Tabs for View/Edit Mode */}
                    {safeMenuItems.length > 0 && (
                        <Tabs
                            value={isEditing ? "editor" : "overview"}
                            className="w-full"
                        >
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="overview" className="gap-2">
                                    <Eye className="h-4 w-4" />
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger value="editor" className="gap-2">
                                    <Edit className="h-4 w-4" />
                                    Navigation Editor
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                                {/* Menu Configuration Table */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Navigation Menu Structure
                                        </CardTitle>
                                        <CardDescription>
                                            Overview of menu items dan
                                            permission requirements yang
                                            dikonfigurasi di file nav-data.js.
                                            Items akan otomatis hidden jika user
                                            tidak memiliki permission yang
                                            diperlukan.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* Legend */}
                                            <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                    <span className="text-sm">
                                                        Permission exists
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <XCircle className="h-4 w-4 text-red-500" />
                                                    <span className="text-sm">
                                                        Permission missing
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Info className="h-4 w-4 text-blue-500" />
                                                    <span className="text-sm">
                                                        No restrictions
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Table */}
                                            <div className="rounded-md border">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>
                                                                Menu Item
                                                            </TableHead>
                                                            <TableHead>
                                                                Route
                                                            </TableHead>
                                                            <TableHead>
                                                                Required
                                                                Permissions
                                                            </TableHead>
                                                            <TableHead>
                                                                Access Level
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {safeMenuItems.map(
                                                            (item, index) =>
                                                                renderMenuRow(
                                                                    item,
                                                                    0,
                                                                    `main-${index}`
                                                                )
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Instructions */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            How to Configure Menu Permissions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="prose prose-sm max-w-none">
                                                <h4>
                                                    1. Use Navigation Editor
                                                </h4>
                                                <p>
                                                    Click "Edit Navigation"
                                                    button untuk masuk ke editor
                                                    mode yang memungkinkan edit
                                                    struktur menu secara visual.
                                                </p>

                                                <h4>2. Permission Format</h4>
                                                <p>
                                                    Gunakan format berikut untuk
                                                    menambahkan permission ke
                                                    menu item:
                                                </p>
                                                <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                                                    {`{
    title: "Menu Title",
    permit: "permission1|permission2",  // OR logic
    items: [
        {
            title: "Sub Menu",
            permit: "specific permission"
        }
    ]
}`}
                                                </pre>

                                                <h4>3. Permission Logic</h4>
                                                <ul>
                                                    <li>
                                                        Use <code>|</code> for
                                                        OR logic (user needs ANY
                                                        of the permissions)
                                                    </li>
                                                    <li>
                                                        Menu automatically
                                                        hidden if user doesn't
                                                        have required
                                                        permissions
                                                    </li>
                                                    <li>
                                                        Parent menu shown if
                                                        user has access to any
                                                        sub-menu
                                                    </li>
                                                    <li>
                                                        Leave{" "}
                                                        <code>permit</code>{" "}
                                                        empty or null for public
                                                        access
                                                    </li>
                                                </ul>

                                                <h4>
                                                    4. Available Permissions
                                                </h4>
                                                <p>
                                                    Use Permission Matrix untuk
                                                    melihat dan mengelola
                                                    permissions yang available.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="editor" className="space-y-4">
                                {isEditing && (
                                    <NavigationEditor
                                        menuItems={editingItems}
                                        permissions={safePermissions}
                                        onChange={setEditingItems}
                                    />
                                )}
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </ScrollArea>
        </AuthenticatedLayout>
    );
}
