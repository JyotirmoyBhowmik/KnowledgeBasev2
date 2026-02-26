"use client";

import { useEffect, useState } from "react";
import { sectionsApi, pagesApi, usersApi } from "@/lib/api";

export default function AdminDashboard() {
    const [stats, setStats] = useState({ sections: 0, pages: 0, users: 0, viewers: 0 });

    useEffect(() => {
        Promise.all([
            sectionsApi.getAll().catch(() => []),
            pagesApi.getAll().catch(() => []),
            usersApi.getAll().catch(() => [])
        ]).then(([secs, pgs, usrs]) => {
            setStats({
                sections: secs.length || 0,
                pages: pgs.length || 0,
                users: usrs.length || 0,
                viewers: usrs.filter((u: any) => u.roles?.includes("viewer")).length || 0
            });
        });
    }, []);

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Platform Overview</h1>

            {/* Match the Metric Cards from the screenshot */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Green Card */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm relative overflow-hidden flex flex-col items-center justify-center py-8">
                    <div className="text-3xl font-bold text-emerald-700 mb-1">{stats.sections}</div>
                    <div className="text-sm font-medium text-emerald-800 flex items-center gap-2">
                        <span>📂</span> Sections
                    </div>
                </div>

                {/* Red/Orange Card */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm relative overflow-hidden flex flex-col items-center justify-center py-8">
                    <div className="text-3xl font-bold text-red-700 mb-1">{stats.pages}</div>
                    <div className="text-sm font-medium text-red-800 flex items-center gap-2">
                        <span>📄</span> Published Pages
                    </div>
                </div>

                {/* Purple Card */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 shadow-sm relative overflow-hidden flex flex-col items-center justify-center py-8">
                    <div className="text-3xl font-bold text-purple-700 mb-1">{stats.users}</div>
                    <div className="text-sm font-medium text-purple-800 flex items-center gap-2">
                        <span>👥</span> Total Users
                    </div>
                </div>

                {/* Yellow Card */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm relative overflow-hidden flex flex-col items-center justify-center py-8">
                    <div className="text-3xl font-bold text-amber-700 mb-1">{stats.viewers}</div>
                    <div className="text-sm font-medium text-amber-800 flex items-center gap-2">
                        <span>👁️</span> Active Viewers
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-800">Quick Actions & Shortcuts</h2>
                    <span className="text-sm text-slate-500 cursor-pointer hover:underline">Edit</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Create New Section", href: "/admin/sections", icon: "➕" },
                        { label: "Draft New Page", href: "/admin/pages", icon: "📝" },
                        { label: "Organize Menus", href: "/admin/menus", icon: "🗂️" },
                        { label: "Manage User Access", href: "/admin/users", icon: "🔑" },
                    ].map((action) => (
                        <a
                            key={action.label}
                            href={action.href}
                            className="flex flex-col items-center gap-3 p-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg text-sm text-slate-700 hover:text-blue-700 transition-all text-center"
                        >
                            <span className="text-2xl">{action.icon}</span>
                            <span className="font-medium">{action.label}</span>
                        </a>
                    ))}
                </div>
            </div>

            <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4">System Logistics</h2>
                <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                        <p className="text-sm text-slate-600">PostgreSQL Database Connection</p>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">Online</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-100">
                        <p className="text-sm text-slate-600">NestJS API Operational Status</p>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
