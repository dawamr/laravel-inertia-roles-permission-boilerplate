import { Button } from "@/shadcn/ui/button";
import { Head, Link, router } from "@inertiajs/react";
import PageHeading from "@/Components/PageHeading";
import { useForm } from "@inertiajs/react";
import { Label } from "@/shadcn/ui/label";
import { Input } from "@/shadcn/ui/input";
import { Textarea } from "@/shadcn/ui/textarea";
import InputError from "@/Components/InputError";
import React, { useState } from "react";
import TwoColumnLayout from "@/Layouts/admin/TwoColumnLayout";

import {
    PlusCircle,
    Lock,
    Shield,
    Users,
    AlertTriangle,
    Info,
    CheckCircle,
    ArrowRight,
    Copy,
} from "lucide-react";
import ShadcnCard from "@/Components/ShadcnCard";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shadcn/ui/select";
import { Switch } from "@/shadcn/ui/switch";
import { Badge } from "@/shadcn/ui/badge";
import { Separator } from "@/shadcn/ui/separator";
import { Alert, AlertDescription } from "@/shadcn/ui/alert";
import Can from "@/Components/Can";

export default function Permission({
    permission,
    groups,
    roles,
    users,
    guards,
}) {
    const [nameSlug, setNameSlug] = useState("");
    const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");

    const { data, setData, post, put, processing, errors } = useForm({
        name: permission ? permission.name : "",
        display_name: permission ? permission.display_name : "",
        description: permission ? permission.description : "",
        group_name: permission ? permission.group_name : "",
        guard_name: permission ? permission.guard_name : "web",
        is_system: permission ? permission.is_system : false,
    });

    // Generate slug from name
    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .replace(/\s+/g, " ")
            .trim();
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        setData("name", name);
        if (!permission) {
            setNameSlug(generateSlug(name));
        }
    };

    const handleGroupChange = (value) => {
        if (value === "new_group") {
            setIsCreatingNewGroup(true);
            setNewGroupName("");
            setData("group_name", "");
        } else {
            setIsCreatingNewGroup(false);
            setData("group_name", value);
        }
    };

    const handleNewGroupSubmit = () => {
        if (newGroupName.trim()) {
            setData("group_name", newGroupName.trim());
            setIsCreatingNewGroup(false);
        }
    };

    const handleNewGroupCancel = () => {
        setIsCreatingNewGroup(false);
        setNewGroupName("");
        setData("group_name", "");
    };

    const submit = (e) => {
        e.preventDefault();

        if (permission) {
            put(route("admin.permissions.update", { id: permission.id }), {
                onSuccess: () => {
                    // Force reload to get fresh data
                    router.visit(route("admin.permissions.index"), {
                        preserveState: false,
                        preserveScroll: false,
                    });
                },
            });
        } else {
            post(route("admin.permissions.store"), {
                onSuccess: () => {
                    // Force reload to get fresh data
                    router.visit(route("admin.permissions.index"), {
                        preserveState: false,
                        preserveScroll: false,
                    });
                },
            });
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <TwoColumnLayout>
            <Head>
                <title>{`${
                    permission
                        ? "Edit Permission - " + permission.name
                        : "Buat Permission Baru"
                }`}</title>
            </Head>
            <TwoColumnLayout.Heading>
                <PageHeading>
                    <PageHeading.Title>
                        {permission ? (
                            <div className="flex gap-x-3 items-center">
                                <Lock className="h-6 w-6 text-blue-600" />
                                <span className="font-semibold">
                                    {permission.name}
                                </span>
                                <Badge variant="outline" className="ml-2">
                                    {permission.group_name}
                                </Badge>
                                {permission.is_system && (
                                    <Badge
                                        variant="destructive"
                                        className="ml-1"
                                    >
                                        System
                                    </Badge>
                                )}
                            </div>
                        ) : (
                            <div className="flex gap-x-3 items-center">
                                <PlusCircle className="h-6 w-6 text-green-600" />
                                <span>Buat Permission Baru</span>
                            </div>
                        )}
                    </PageHeading.Title>
                    <PageHeading.Actions>
                        <Button asChild variant="outline">
                            <Link href={route("admin.permissions.index")}>
                                Batal
                            </Link>
                        </Button>
                        <Can permit="create permissions">
                            <Button asChild variant="outline">
                                <Link href={route("admin.permissions.create")}>
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Buat Baru
                                </Link>
                            </Button>
                        </Can>
                    </PageHeading.Actions>
                </PageHeading>
                <div className="flex justify-between items-center">
                    <div>
                        {permission ? (
                            <span className="text-blue-600 italic text-sm">
                                {route("admin.permissions.edit", permission.id)}
                            </span>
                        ) : (
                            <span className="text-muted-foreground text-sm">
                                Buat permission baru untuk kontrol akses
                            </span>
                        )}
                    </div>
                </div>
            </TwoColumnLayout.Heading>

            <TwoColumnLayout.Content>
                <TwoColumnLayout.Main>
                    <form onSubmit={submit} className="space-y-6">
                        {/* Permission Basic Information */}
                        <ShadcnCard
                            title={
                                <div className="flex items-center gap-2">
                                    <Lock className="h-5 w-5" />
                                    Detail Permission
                                </div>
                            }
                            description="Tentukan nama permission, deskripsi, dan kategorisasi"
                        >
                            <div className="space-y-6">
                                {/* Permission Name */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">
                                            Nama Permission *
                                        </Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={data.name}
                                            autoFocus={!permission}
                                            disabled={permission?.is_system}
                                            className="mt-1"
                                            placeholder="e.g., view users, create posts, delete comments"
                                            onChange={handleNameChange}
                                        />
                                        <InputError
                                            message={errors.name}
                                            className="mt-2"
                                        />
                                        {!permission && nameSlug && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Saran:{" "}
                                                <code className="bg-muted px-1 rounded">
                                                    {nameSlug}
                                                </code>
                                            </p>
                                        )}
                                        {permission?.is_system && (
                                            <p className="text-sm text-amber-600 mt-1">
                                                ⚠️ System permission - nama
                                                tidak dapat diubah
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="display_name">
                                            Nama Tampilan
                                        </Label>
                                        <Input
                                            id="display_name"
                                            type="text"
                                            name="display_name"
                                            value={data.display_name}
                                            className="mt-1"
                                            placeholder="Nama yang mudah dibaca"
                                            onChange={(e) =>
                                                setData(
                                                    "display_name",
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <InputError
                                            message={errors.display_name}
                                            className="mt-2"
                                        />
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Opsional: Nama yang user-friendly
                                            untuk tampilan UI
                                        </p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <Label htmlFor="description">
                                        Deskripsi
                                    </Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={data.description}
                                        rows={3}
                                        className="mt-1"
                                        placeholder="Jelaskan apa yang diizinkan permission ini untuk dilakukan users..."
                                        onChange={(e) =>
                                            setData(
                                                "description",
                                                e.target.value
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.description}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Group and Guard */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="group_name">
                                            Grup Permission *
                                        </Label>
                                        {!isCreatingNewGroup ? (
                                            <Select
                                                value={data.group_name}
                                                onValueChange={
                                                    handleGroupChange
                                                }
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Pilih grup" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {groups &&
                                                        groups.map((group) => (
                                                            <SelectItem
                                                                key={group}
                                                                value={group}
                                                                className="capitalize"
                                                            >
                                                                {group}
                                                            </SelectItem>
                                                        ))}
                                                    <Separator />
                                                    <SelectItem value="new_group">
                                                        + Buat Grup Baru
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div className="mt-1 space-y-2">
                                                <Input
                                                    type="text"
                                                    placeholder="Masukkan nama grup baru..."
                                                    value={newGroupName}
                                                    onChange={(e) =>
                                                        setNewGroupName(
                                                            e.target.value
                                                        )
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            handleNewGroupSubmit();
                                                        }
                                                        if (
                                                            e.key === "Escape"
                                                        ) {
                                                            handleNewGroupCancel();
                                                        }
                                                    }}
                                                    autoFocus
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={
                                                            handleNewGroupSubmit
                                                        }
                                                        disabled={
                                                            !newGroupName.trim()
                                                        }
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Simpan
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={
                                                            handleNewGroupCancel
                                                        }
                                                    >
                                                        Batal
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                        <InputError
                                            message={errors.group_name}
                                            className="mt-2"
                                        />
                                        {isCreatingNewGroup && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Tekan Enter untuk menyimpan atau
                                                Escape untuk membatal
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="guard_name">
                                            Guard
                                        </Label>
                                        <Select
                                            value={data.guard_name}
                                            onValueChange={(value) =>
                                                setData("guard_name", value)
                                            }
                                            disabled={permission?.is_system}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Pilih guard" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {guards &&
                                                    guards.map((guard) => (
                                                        <SelectItem
                                                            key={guard}
                                                            value={guard}
                                                        >
                                                            {guard}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={errors.guard_name}
                                            className="mt-2"
                                        />
                                    </div>
                                </div>

                                {/* System Permission Toggle */}
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">
                                            System Permission
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Tandai sebagai system permission
                                            (terlindungi dari penghapusan)
                                        </p>
                                    </div>
                                    <Switch
                                        checked={data.is_system}
                                        onCheckedChange={(checked) =>
                                            setData("is_system", checked)
                                        }
                                        disabled={permission?.is_system}
                                    />
                                </div>
                            </div>
                        </ShadcnCard>

                        {/* System Warnings */}
                        {data.is_system && (
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    System permissions terlindungi dan tidak
                                    dapat dihapus. Mereka penting untuk
                                    fungsionalitas aplikasi.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Permission Usage Preview */}
                        {!permission && data.name && (
                            <ShadcnCard
                                title={
                                    <div className="flex items-center gap-2">
                                        <Info className="h-5 w-5" />
                                        Preview Penggunaan
                                    </div>
                                }
                                description="Bagaimana permission ini akan digunakan dalam aplikasi"
                            >
                                <div className="space-y-4">
                                    <div className="bg-muted p-4 rounded-lg">
                                        <h5 className="font-medium mb-2">
                                            Laravel Gate/Policy:
                                        </h5>
                                        <code className="text-sm bg-background p-2 rounded block">
                                            {`Gate::allows('${data.name}')\n$user->can('${data.name}')`}
                                        </code>
                                    </div>
                                    <div className="bg-muted p-4 rounded-lg">
                                        <h5 className="font-medium mb-2">
                                            Middleware:
                                        </h5>
                                        <code className="text-sm bg-background p-2 rounded block">
                                            {`Route::middleware('can:${data.name}')`}
                                        </code>
                                    </div>
                                    <div className="bg-muted p-4 rounded-lg">
                                        <h5 className="font-medium mb-2">
                                            Frontend Component:
                                        </h5>
                                        <code className="text-sm bg-background p-2 rounded block">
                                            {`<Can permit="${data.name}">...</Can>`}
                                        </code>
                                    </div>
                                </div>
                            </ShadcnCard>
                        )}

                        <TwoColumnLayout.Actions isSticky>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="text-sm text-muted-foreground">
                                    {permission ? "Update" : "Buat"} permission
                                    untuk kontrol akses
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full sm:w-[200px]"
                                    disabled={processing || !data.name}
                                >
                                    {processing
                                        ? "Menyimpan..."
                                        : permission
                                        ? "Update Permission"
                                        : "Buat Permission"}
                                </Button>
                            </div>
                        </TwoColumnLayout.Actions>
                    </form>
                </TwoColumnLayout.Main>

                <TwoColumnLayout.Aside>
                    {permission && (
                        <div className="space-y-6">
                            {/* Permission Statistics */}
                            <ShadcnCard
                                title={
                                    <div className="flex items-center gap-2">
                                        <Lock className="h-5 w-5" />
                                        Penggunaan Permission
                                    </div>
                                }
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">
                                            Roles yang Menggunakan
                                        </span>
                                        <Badge variant="secondary">
                                            {permission.roles?.length || 0}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">
                                            Direct Users
                                        </span>
                                        <Badge variant="secondary">
                                            {permission.users?.length || 0}
                                        </Badge>
                                    </div>
                                    <Separator />
                                    <div className="text-sm text-muted-foreground">
                                        <p>
                                            <strong>Dibuat:</strong>{" "}
                                            {new Date(
                                                permission.created_at
                                            ).toLocaleDateString()}
                                        </p>
                                        <p>
                                            <strong>Terakhir Update:</strong>{" "}
                                            {new Date(
                                                permission.updated_at
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </ShadcnCard>

                            {/* Roles Using This Permission */}
                            {permission.roles &&
                                permission.roles.length > 0 && (
                                    <ShadcnCard
                                        title={
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-5 w-5" />
                                                Roles yang Menggunakan (
                                                {permission.roles.length})
                                            </div>
                                        }
                                    >
                                        <div className="space-y-2">
                                            {permission.roles.map((role) => (
                                                <div
                                                    key={role.id}
                                                    className="flex items-center justify-between p-2 rounded-md border"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                                        <span className="capitalize">
                                                            {role.name}
                                                        </span>
                                                    </div>
                                                    <Can permit="view roles">
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <Link
                                                                href={route(
                                                                    "admin.roles.edit",
                                                                    role.id
                                                                )}
                                                            >
                                                                <ArrowRight className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </Can>
                                                </div>
                                            ))}
                                        </div>
                                    </ShadcnCard>
                                )}

                            {/* Direct Users */}
                            {permission.users &&
                                permission.users.length > 0 && (
                                    <ShadcnCard
                                        title={
                                            <div className="flex items-center gap-2">
                                                <Users className="h-5 w-5" />
                                                Direct Users (
                                                {permission.users.length})
                                            </div>
                                        }
                                    >
                                        <div className="space-y-2">
                                            {permission.users.map((user) => (
                                                <div
                                                    key={user.id}
                                                    className="flex items-center justify-between p-2 rounded-md border"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        <span>{user.name}</span>
                                                    </div>
                                                    <Can permit="view users">
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <Link
                                                                href={route(
                                                                    "admin.users.edit",
                                                                    user.id
                                                                )}
                                                            >
                                                                <ArrowRight className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </Can>
                                                </div>
                                            ))}
                                        </div>
                                    </ShadcnCard>
                                )}

                            {/* Quick Actions */}
                            <ShadcnCard title="Quick Actions">
                                <div className="space-y-2">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() =>
                                            copyToClipboard(permission.name)
                                        }
                                    >
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy Nama Permission
                                    </Button>
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
                                                Kelola Roles
                                            </Link>
                                        </Button>
                                    </Can>
                                    <Can permit="view permissions">
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="w-full justify-start"
                                        >
                                            <Link
                                                href={route(
                                                    "admin.permissions.index"
                                                )}
                                            >
                                                <Lock className="h-4 w-4 mr-2" />
                                                Semua Permissions
                                            </Link>
                                        </Button>
                                    </Can>
                                </div>
                            </ShadcnCard>
                        </div>
                    )}

                    {!permission && (
                        <ShadcnCard
                            title="Membuat Permission"
                            description="Best practices untuk pembuatan permission"
                        >
                            <div className="space-y-4 text-sm text-muted-foreground">
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                                    <p>
                                        Gunakan nama yang deskriptif seperti
                                        "view users" atau "create posts"
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                                    <p>
                                        Kelompokkan permission yang terkait
                                        bersama
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                                    <p>
                                        Tambahkan deskripsi yang jelas untuk
                                        pemahaman tim
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                                    <p>
                                        Tandai system permission untuk mencegah
                                        penghapusan tidak sengaja
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
