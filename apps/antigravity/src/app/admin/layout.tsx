"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const sidebarItems = [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Sections", href: "/admin/sections", icon: "📂" },
    { label: "Pages", href: "/admin/pages", icon: "📄" },
    { label: "Templates", href: "/admin/templates", icon: "📋" },
    { label: "Users", href: "/admin/users", icon: "👥" },
    { label: "Suggestions", href: "/admin/suggestions", icon: "💡" },
    { label: "Activity Log", href: "/admin/activity", icon: "🕐" },
    { label: "Trash", href: "/admin/trash", icon: "🗑️" },
    { label: "Settings", href: "/admin/settings", icon: "⚙️" },
    { label: "Security & AD", href: "/admin/security", icon: "🛡️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        if (!token || !userData) {
            router.push("/admin/login");
            return;
        }
        setUser(JSON.parse(userData));
    }, [router]);

    if (pathname === "/admin/login") return <>{children}</>;

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/admin/login");
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            {/* Sidebar matching the 'Moon Base' aesthetic */}
            <aside className="w-64 bg-blue-600 text-white flex flex-col shadow-xl z-10 relative">
                {/* Logo Area */}
                <div className="px-6 py-6 border-b border-blue-500 flex items-center gap-3">
                    <div className="w-8 h-8 bg-white text-blue-600 rounded flex items-center justify-center font-bold text-lg">
                        EK
                    </div>
                    <div className="font-bold text-lg leading-tight tracking-tight">Enterprise KB</div>
                </div>

                <nav className="flex-1 py-4 space-y-1">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-4 px-6 py-3 text-sm font-medium transition-colors
                                ${isActive
                                        ? "bg-white text-blue-600 shadow-sm relative before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-blue-800"
                                        : "text-blue-100 hover:bg-blue-500 hover:text-white"
                                    }`}
                            >
                                <span className={`text-lg ${isActive ? "opacity-100" : "opacity-80"}`}>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto pb-4">
                    <div className="px-6 py-4 border-t border-blue-500/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 border-2 border-white/20 rounded-full flex items-center justify-center text-xs font-bold bg-blue-700">
                                {user?.name?.[0] || user?.email?.[0] || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{user?.name || user?.email}</div>
                                <div className="text-xs text-blue-200 truncate">{user?.roles?.join(", ")}</div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-blue-100 hover:bg-blue-700 rounded transition-colors"
                        >
                            <span>🚪</span> Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header matching dashboard top bar */}
                <header className="bg-white border-b border-slate-200 h-16 flex items-center px-8 shadow-sm justify-between">
                    <div className="text-sm text-slate-500 flex items-center gap-2">
                        <span>Admin Panel</span>
                        <span className="text-slate-300">»</span>
                        <span className="font-medium text-slate-800">
                            {sidebarItems.find(i => i.href === pathname)?.label || "Overview"}
                        </span>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
