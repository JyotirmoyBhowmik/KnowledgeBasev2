"use client";

import { useEffect, useState } from "react";
import { pagesApi } from "@/lib/api";
import Link from "next/link";

export default function AdminTrashPage() {
    const [pages, setPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            const data = await pagesApi.getTrashed();
            setPages(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleRestore = async (id: string) => {
        if (!confirm("Restore this page?")) return;
        await pagesApi.restore(id);
        load();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Permanently delete this page? This cannot be undone.")) return;
        await pagesApi.permanentDelete(id);
        load();
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">🗑️ Trash</h1>
                <p className="text-slate-500 text-sm">Deleted pages that can be restored or permanently removed</p>
            </div>

            {loading ? (
                <div className="text-slate-500 py-12">Loading...</div>
            ) : pages.length === 0 ? (
                <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
                    <div className="text-5xl mb-3 opacity-30">🗑️</div>
                    <p className="text-slate-500 font-medium">Trash is empty</p>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-xs font-bold tracking-wide">
                            <tr>
                                <th className="px-6 py-4">Page</th>
                                <th className="px-6 py-4">Section</th>
                                <th className="px-6 py-4">Deleted</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {pages.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-900">{p.title}</div>
                                        <div className="text-xs text-slate-500">/{p.slug}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{p.section?.name || "—"}</td>
                                    <td className="px-6 py-4 text-xs text-slate-500">
                                        {p.deleted_at ? new Date(p.deleted_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => handleRestore(p.id)} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-bold hover:bg-emerald-100 transition-colors">
                                            ♻️ Restore
                                        </button>
                                        <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-bold hover:bg-red-100 transition-colors">
                                            🗑️ Delete Forever
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
