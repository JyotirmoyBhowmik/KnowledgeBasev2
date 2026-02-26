"use client";

import { useEffect, useState } from "react";
import { suggestionsApi } from "@/lib/api";

export default function AdminSuggestionsPage() {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadSuggestions = async () => {
        try {
            const data = await suggestionsApi.getAll();
            setSuggestions(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadSuggestions(); }, []);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            await suggestionsApi.update(id, { status: newStatus });
            loadSuggestions();
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this suggestion?")) return;
        try {
            await suggestionsApi.delete(id);
            loadSuggestions();
        } catch (e: any) {
            alert(e.message);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">User Suggestions</h1>
                <p className="text-slate-500 text-sm">Review feedback and feature requests from the community</p>
            </div>

            {loading ? (
                <div className="text-slate-500 py-12">Loading suggestions...</div>
            ) : (
                <div className="grid gap-4">
                    {suggestions.map((s) => (
                        <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="text-slate-800 font-medium">{s.message}</div>
                                    <div className="text-xs text-slate-400 mt-2">{new Date(s.created_at).toLocaleString()} - by {s.user?.name || s.user?.email || 'Anonymous'}</div>
                                </div>
                                <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${s.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {s.status}
                                </span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                                <button onClick={() => handleUpdateStatus(s.id, s.status === 'pending' ? 'reviewed' : 'pending')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold uppercase tracking-wider">
                                    Mark {s.status === 'pending' ? 'Reviewed' : 'Pending'}
                                </button>
                                <button onClick={() => handleDelete(s.id)} className="px-3 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded text-xs font-bold uppercase tracking-wider">Delete</button>
                            </div>
                        </div>
                    ))}
                    {suggestions.length === 0 && (
                        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 shadow-sm">
                            <div className="text-3xl mb-3">📬</div>
                            No suggestions in the inbox.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
