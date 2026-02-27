"use client";

import { useEffect, useState } from "react";
import { activityApi } from "@/lib/api";

export default function AdminActivityPage() {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ entityType: "", startDate: "", endDate: "", limit: 50 });

    const load = async () => {
        setLoading(true);
        try {
            const data = await activityApi.getAll({
                entityType: filter.entityType || undefined,
                startDate: filter.startDate || undefined,
                endDate: filter.endDate || undefined,
                limit: filter.limit,
            });
            setActivities(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [filter]);

    const actionColor: Record<string, string> = {
        viewed: "bg-blue-50 text-blue-700 border-blue-200",
        created: "bg-emerald-50 text-emerald-700 border-emerald-200",
        edited: "bg-amber-50 text-amber-700 border-amber-200",
        deleted: "bg-red-50 text-red-700 border-red-200",
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">📋 Activity Log</h1>
                    <p className="text-slate-500 text-sm">Track user actions across the knowledge base</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={filter.entityType}
                        onChange={(e) => setFilter({ ...filter, entityType: e.target.value })}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                        <option value="">All Types</option>
                        <option value="page">Pages</option>
                        <option value="module">Modules</option>
                        <option value="section">Sections</option>
                        <option value="user">Users</option>
                    </select>
                    <input
                        type="date"
                        value={filter.startDate}
                        onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                        title="Start Date"
                    />
                    <input
                        type="date"
                        value={filter.endDate}
                        onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                        title="End Date"
                    />
                    <select
                        value={filter.limit}
                        onChange={(e) => setFilter({ ...filter, limit: Number(e.target.value) })}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                        <option value={25}>Last 25</option>
                        <option value={50}>Last 50</option>
                        <option value={100}>Last 100</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-slate-500 py-12">Loading activity...</div>
            ) : activities.length === 0 ? (
                <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
                    <div className="text-5xl mb-3 opacity-30">📋</div>
                    <p className="text-slate-500 font-medium">No activity recorded yet</p>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-xs font-bold tracking-wide">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Entity</th>
                                <th className="px-6 py-4">IP Address</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {activities.map(a => (
                                <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-3">
                                        <div className="font-semibold text-slate-900 text-sm">{a.user?.name || a.user?.email || "System"}</div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-0.5 border rounded text-xs font-bold uppercase ${actionColor[a.action] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                                            {a.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-slate-600 text-xs">
                                        <span className="font-medium">{a.entity_type}</span>
                                        <span className="text-slate-400 ml-1">#{a.entity_id?.slice(0, 8)}</span>
                                    </td>
                                    <td className="px-6 py-3 text-xs font-mono text-slate-500">{a.ip_address || "—"}</td>
                                    <td className="px-6 py-3 text-xs text-slate-500 max-w-[200px] truncate">{a.details || "—"}</td>
                                    <td className="px-6 py-3 text-xs text-slate-500">
                                        {new Date(a.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
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
