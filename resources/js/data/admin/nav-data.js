// Auto-generated navigation configuration
// Last updated: 2025-06-28 07:50:04

export const navItems = [
    {
        title: "Dashboard",
        href: route("admin.dashboard"),
        icon: "dashboard",
        label: "Dashboard",
        permit: "view dashboard",
    },
    {
        title: "Users",
        href: "#",
        icon: "users",
        label: "Users",
        permit: "view users|manage users",
        items: [
            {
                title: "Add Users",
                href: route("admin.users.create"),
                icon: "menu",
                label: "Add Users",
                permit: "create roles",
            },
            {
                title: "All Users",
                href: route("admin.users.index"),
                icon: "list",
                label: "All Users",
                permit: "view users",
            },
        ],
    },
    {
        title: "Roles & Permissions",
        href: "#",
        icon: "shield",
        label: "Roles & Permissions",
        permit: "view roles|manage roles|view permissions|manage permissions",
        items: [
            {
                title: "Roles",
                href: route("admin.roles.index"),
                icon: "shield",
                label: "Roles",
                permit: "view roles",
            },
            {
                title: "Permissions",
                href: route("admin.permissions.index"),
                icon: "lock",
                label: "Permissions",
                permit: "view permissions",
            },
            {
                title: "Permission Matrix",
                href: route("admin.roles.permission-matrix"),
                icon: "grid",
                label: "Permission Matrix",
                permit: "manage roles",
            },
            {
                title: "Menu Configuration",
                href: route("admin.roles.menu-configuration"),
                icon: "settings",
                label: "Menu Configuration",
                permit: "manage roles",
            },
        ],
    },
    {
        title: "Acitivity Logs",
        href: route("admin.activityLogs.index"),
        icon: "list",
        label: "Acitivity Logs",
        permit: "view activity logs|export activity logs",
    },
    {
        title: "Settings",
        href: route("admin.settings.view"),
        icon: "settings",
        label: "Settings",
        permit: "view-setting",
    },
];
