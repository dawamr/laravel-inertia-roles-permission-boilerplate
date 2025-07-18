import { Button } from "@/shadcn/ui/button";
import { Head, Link } from "@inertiajs/react";
import PageHeading from "@/Components/PageHeading";
import { useForm } from "@inertiajs/react";
import { Label } from "@/shadcn/ui/label";
import { Input } from "@/shadcn/ui/input";
import InputError from "@/Components/InputError";
import React from "react";
import TwoColumnLayout from "@/Layouts/admin/TwoColumnLayout";
import { TextLarge, TextMuted } from "@/shadcn/ui/text-muted";
import {
    MoreHorizontal,
    PencilLine,
    PlusCircle,
    User as UserIcon,
    Mail,
    Shield,
    Key,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle,
    UserCheck,
    Users,
    Calendar,
    Clock,
} from "lucide-react";
import ShadcnCard from "@/Components/ShadcnCard";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/shadcn/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/ui/avatar";
import { Badge } from "@/shadcn/ui/badge";
import { Progress } from "@/shadcn/ui/progress";
import { Separator } from "@/shadcn/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/shadcn/ui/select";
import Can from "@/Components/Can";

// Helper functions
const getUserInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${
        lastName?.charAt(0) || ""
    }`.toUpperCase();
};

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

const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[a-z]/.test(password)) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;

    if (score <= 25)
        return { strength: score, label: "Lemah", color: "bg-red-500" };
    if (score <= 50)
        return { strength: score, label: "Sedang", color: "bg-yellow-500" };
    if (score <= 75)
        return { strength: score, label: "Kuat", color: "bg-blue-500" };
    return { strength: score, label: "Sangat Kuat", color: "bg-green-500" };
};

export default function User({ user, roles }) {
    const [showPassword, setShowPassword] = React.useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: user ? user?.first_name : "",
        last_name: user ? user?.last_name : "",
        email: user ? user?.email : "",
        role_ids: user ? user.roles.map((r) => r.id) : [],
        password: "",
    });

    const passwordStrength = getPasswordStrength(data.password);

    const submit = (e) => {
        e.preventDefault();

        if (user) {
            post(route("admin.users.update", { id: user.id }));
        } else {
            post(route("admin.users.store"));
        }
    };

    return (
        <TwoColumnLayout>
            <Head>
                <title>{`${
                    user
                        ? "Edit Pengguna - " + user.full_name
                        : "Tambah Pengguna Baru"
                }`}</title>
            </Head>
            <TwoColumnLayout.Heading>
                <PageHeading>
                    <PageHeading.Title>
                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <PencilLine className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">
                                        Edit Pengguna
                                    </h1>
                                    <p className="text-muted-foreground">
                                        {user.full_name}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <PlusCircle className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">
                                        Tambah Pengguna Baru
                                    </h1>
                                    <p className="text-muted-foreground">
                                        Buat akun pengguna baru
                                    </p>
                                </div>
                            </div>
                        )}
                    </PageHeading.Title>
                    <PageHeading.Actions>
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline">
                                <Link href={route("admin.users.index")}>
                                    Batal
                                </Link>
                            </Button>
                            <Can permit="create users">
                                <Button asChild variant="secondary">
                                    <Link href={route("admin.users.create")}>
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Buat Baru
                                    </Link>
                                </Button>
                            </Can>
                            {user && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                            <UserCheck className="mr-2 h-4 w-4" />
                                            Lihat Profil
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Mail className="mr-2 h-4 w-4" />
                                            Kirim Email
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <Can permit="delete users">
                                            <DropdownMenuItem className="text-red-600">
                                                <AlertCircle className="mr-2 h-4 w-4" />
                                                Hapus Pengguna
                                            </DropdownMenuItem>
                                        </Can>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </PageHeading.Actions>
                </PageHeading>

                {user && (
                    <div className="flex items-center gap-4 pt-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage
                                src={user.avatar}
                                alt={user.full_name}
                            />
                            <AvatarFallback className="text-lg font-semibold">
                                {getUserInitials(
                                    user.first_name,
                                    user.last_name
                                )}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-semibold">
                                    {user.full_name}
                                </h2>
                                {user.email_verified_at ? (
                                    <Badge
                                        variant="outline"
                                        className="text-green-600 border-green-200"
                                    >
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Verified
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="outline"
                                        className="text-amber-600 border-amber-200"
                                    >
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        Unverified
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {user.roles.map((role, index) => (
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
                    </div>
                )}
            </TwoColumnLayout.Heading>

            <TwoColumnLayout.Content>
                <TwoColumnLayout.Main>
                    <form onSubmit={submit} className="space-y-6">
                        {/* Basic Information */}
                        <ShadcnCard
                            title="Informasi Dasar"
                            description="Informasi identitas dan kontak pengguna"
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="first_name"
                                        className="flex items-center gap-2"
                                    >
                                        <UserIcon className="h-4 w-4" />
                                        Nama Depan
                                    </Label>
                                    <Input
                                        id="first_name"
                                        type="text"
                                        name="first_name"
                                        value={data.first_name}
                                        className="h-11"
                                        placeholder="Masukkan nama depan..."
                                        onChange={(e) =>
                                            setData(
                                                "first_name",
                                                e.target.value
                                            )
                                        }
                                    />
                                    <InputError message={errors.first_name} />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="last_name"
                                        className="flex items-center gap-2"
                                    >
                                        <UserIcon className="h-4 w-4" />
                                        Nama Belakang
                                    </Label>
                                    <Input
                                        id="last_name"
                                        type="text"
                                        name="last_name"
                                        value={data.last_name}
                                        className="h-11"
                                        placeholder="Masukkan nama belakang..."
                                        onChange={(e) =>
                                            setData("last_name", e.target.value)
                                        }
                                    />
                                    <InputError message={errors.last_name} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="flex items-center gap-2"
                                >
                                    <Mail className="h-4 w-4" />
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="h-11"
                                    placeholder="user@example.com"
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                />
                                <InputError message={errors.email} />
                            </div>
                        </ShadcnCard>

                        {/* Role & Permissions */}
                        <ShadcnCard
                            title="Role & Akses"
                            description="Atur role dan hak akses pengguna"
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label
                                    htmlFor="role"
                                    className="flex items-center gap-2"
                                >
                                    <Shield className="h-4 w-4" />
                                    Role Pengguna
                                </Label>
                                <Select
                                    value={`${
                                        data.role_ids &&
                                        data.role_ids.length > 0
                                            ? data.role_ids[0]
                                            : ""
                                    }`}
                                    onValueChange={(value) =>
                                        setData("role_ids", [value])
                                    }
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Pilih role untuk pengguna" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>
                                                Role Tersedia
                                            </SelectLabel>
                                            {roles.map((role) => (
                                                <SelectItem
                                                    key={role.id}
                                                    value={`${role.id}`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="h-4 w-4" />
                                                        <span className="capitalize">
                                                            {role.display_name ||
                                                                role.name}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.role_id} />
                                <p className="text-sm text-muted-foreground">
                                    Role menentukan hak akses dan fitur yang
                                    dapat digunakan pengguna
                                </p>
                            </div>
                        </ShadcnCard>

                        {/* Security */}
                        <ShadcnCard
                            title="Keamanan"
                            description={
                                user
                                    ? "Ubah password (kosongkan jika tidak ingin mengubah)"
                                    : "Atur password untuk akun baru"
                            }
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label
                                    htmlFor="password"
                                    className="flex items-center gap-2"
                                >
                                    <Key className="h-4 w-4" />
                                    Password{" "}
                                    {!user && (
                                        <span className="text-red-500">*</span>
                                    )}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        name="password"
                                        value={data.password}
                                        className="h-11 pr-10"
                                        placeholder={
                                            user
                                                ? "Kosongkan jika tidak ingin mengubah"
                                                : "Masukkan password"
                                        }
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                <InputError message={errors.password} />

                                {/* Password Strength Indicator */}
                                {data.password && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Kekuatan Password
                                            </span>
                                            <span
                                                className={`text-sm font-medium ${
                                                    passwordStrength.strength <=
                                                    25
                                                        ? "text-red-600"
                                                        : passwordStrength.strength <=
                                                          50
                                                        ? "text-yellow-600"
                                                        : passwordStrength.strength <=
                                                          75
                                                        ? "text-blue-600"
                                                        : "text-green-600"
                                                }`}
                                            >
                                                {passwordStrength.label}
                                            </span>
                                        </div>
                                        <Progress
                                            value={passwordStrength.strength}
                                            className="h-2"
                                        />
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <p>Password harus memiliki:</p>
                                            <ul className="space-y-1 ml-4">
                                                <li
                                                    className={`flex items-center gap-2 ${
                                                        data.password.length >=
                                                        8
                                                            ? "text-green-600"
                                                            : "text-muted-foreground"
                                                    }`}
                                                >
                                                    {data.password.length >=
                                                    8 ? (
                                                        <CheckCircle className="h-3 w-3" />
                                                    ) : (
                                                        <AlertCircle className="h-3 w-3" />
                                                    )}
                                                    Minimal 8 karakter
                                                </li>
                                                <li
                                                    className={`flex items-center gap-2 ${
                                                        /[a-z]/.test(
                                                            data.password
                                                        )
                                                            ? "text-green-600"
                                                            : "text-muted-foreground"
                                                    }`}
                                                >
                                                    {/[a-z]/.test(
                                                        data.password
                                                    ) ? (
                                                        <CheckCircle className="h-3 w-3" />
                                                    ) : (
                                                        <AlertCircle className="h-3 w-3" />
                                                    )}
                                                    Huruf kecil
                                                </li>
                                                <li
                                                    className={`flex items-center gap-2 ${
                                                        /[A-Z]/.test(
                                                            data.password
                                                        )
                                                            ? "text-green-600"
                                                            : "text-muted-foreground"
                                                    }`}
                                                >
                                                    {/[A-Z]/.test(
                                                        data.password
                                                    ) ? (
                                                        <CheckCircle className="h-3 w-3" />
                                                    ) : (
                                                        <AlertCircle className="h-3 w-3" />
                                                    )}
                                                    Huruf besar
                                                </li>
                                                <li
                                                    className={`flex items-center gap-2 ${
                                                        /[0-9]/.test(
                                                            data.password
                                                        )
                                                            ? "text-green-600"
                                                            : "text-muted-foreground"
                                                    }`}
                                                >
                                                    {/[0-9]/.test(
                                                        data.password
                                                    ) ? (
                                                        <CheckCircle className="h-3 w-3" />
                                                    ) : (
                                                        <AlertCircle className="h-3 w-3" />
                                                    )}
                                                    Angka
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ShadcnCard>

                        <TwoColumnLayout.Actions>
                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={route("admin.users.index")}>
                                        Batal
                                    </Link>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="min-w-[140px]"
                                >
                                    {processing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Menyimpan...
                                        </div>
                                    ) : user ? (
                                        "Perbarui Pengguna"
                                    ) : (
                                        "Buat Pengguna"
                                    )}
                                </Button>
                            </div>
                        </TwoColumnLayout.Actions>
                    </form>
                </TwoColumnLayout.Main>

                <TwoColumnLayout.Aside>
                    {user ? (
                        <div className="space-y-6">
                            {/* User Profile Card */}
                            <Card>
                                <CardHeader className="text-center">
                                    <Avatar className="h-20 w-20 mx-auto mb-4">
                                        <AvatarImage
                                            src={user.avatar}
                                            alt={user.full_name}
                                        />
                                        <AvatarFallback className="text-2xl font-bold">
                                            {getUserInitials(
                                                user.first_name,
                                                user.last_name
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <CardTitle className="text-xl">
                                        {user.full_name}
                                    </CardTitle>
                                    <CardDescription>
                                        {user.email}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Status
                                        </span>
                                        {user.email_verified_at ? (
                                            <Badge
                                                variant="outline"
                                                className="text-green-600 border-green-200"
                                            >
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Verified
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="outline"
                                                className="text-amber-600 border-amber-200"
                                            >
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                Unverified
                                            </Badge>
                                        )}
                                    </div>

                                    <Separator />

                                    <div>
                                        <span className="text-sm text-muted-foreground">
                                            Role
                                        </span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {user.roles.map((role, index) => (
                                                <Badge
                                                    key={index}
                                                    variant={getRoleColor(
                                                        role.name
                                                    )}
                                                    className="capitalize"
                                                >
                                                    <Shield className="h-3 w-3 mr-1" />
                                                    {role.display_name ||
                                                        role.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* User Statistics */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Statistik Pengguna
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">
                                                Bergabung
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium">
                                            {new Date(
                                                user.created_at
                                            ).toLocaleDateString("id-ID")}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">
                                                Terakhir Update
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium">
                                            {new Date(
                                                user.updated_at
                                            ).toLocaleDateString("id-ID")}
                                        </span>
                                    </div>

                                    {user.email_verified_at && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span className="text-sm">
                                                    Email Verified
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium">
                                                {new Date(
                                                    user.email_verified_at
                                                ).toLocaleDateString("id-ID")}
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Aksi Cepat</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        size="sm"
                                    >
                                        <Mail className="h-4 w-4 mr-2" />
                                        Kirim Email
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        size="sm"
                                    >
                                        <Shield className="h-4 w-4 mr-2" />
                                        Atur Permissions
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        size="sm"
                                    >
                                        <UserCheck className="h-4 w-4 mr-2" />
                                        Lihat Aktivitas
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        /* New User Guidance */
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserIcon className="h-5 w-5" />
                                    Panduan Pengguna Baru
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center mt-0.5">
                                            1
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                Isi Data Pengguna
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Lengkapi nama depan, belakang,
                                                dan email
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center mt-0.5">
                                            2
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                Pilih Role
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Tentukan hak akses sesuai
                                                tanggung jawab
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center mt-0.5">
                                            3
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                Atur Password
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Buat password yang kuat dan aman
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-800">
                                            Tips
                                        </span>
                                    </div>
                                    <p className="text-sm text-blue-700">
                                        Setelah dibuat, pengguna akan menerima
                                        email verifikasi. Pastikan email yang
                                        dimasukkan valid dan aktif.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TwoColumnLayout.Aside>
            </TwoColumnLayout.Content>
        </TwoColumnLayout>
    );
}
