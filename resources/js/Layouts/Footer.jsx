import React from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    Facebook,
    Instagram,
    Linkedin,
    Mail,
    MapPinIcon,
    Phone,
} from "lucide-react";

export default function Footer() {
    const { appName, globalSettings } = usePage().props;
    return (
        <footer className="px-4 divide-y bg-slate-50">
            <div className="py-6 text-sm text-center">
                © {globalSettings.general.app_name || appName}. All rights
                reserved.
            </div>
        </footer>
    );
}
