"use client";

import { useEffect, useState } from "react";
import { pagesApi, sectionsApi } from "@/lib/api";

export default function AdminPagesPage() {
    const [pages, setPages] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: "", slug: "", section_id: "", status: "draft" });
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleEditSettings = (page: any) => {
        setEditingId(page.id);
        setForm({
            title: page.title || "",
            slug: page.slug || "",
            section_id: page.section_id || sections[0]?.id || "",
            status: page.status || "draft"
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const load = async () => {
        try {
            const [p, s] = await Promise.all([pagesApi.getAll(), sectionsApi.getAll()]);
            setPages(p);
            setSections(s);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await pagesApi.update(editingId, form);
            } else {
                await pagesApi.create(form);
            }
            setShowForm(false);
            setEditingId(null);
            setForm({ title: "", slug: "", section_id: "", status: "draft" });
            load();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handlePublish = async (id: string) => {
        try { await pagesApi.publish(id); load(); } catch (err: any) { alert(err.message); }
    };

    const handleArchive = async (id: string) => {
        try { await pagesApi.archive(id); load(); } catch (err: any) { alert(err.message); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this page?")) return;
        try { await pagesApi.delete(id); load(); } catch (err: any) { alert(err.message); }
    };

    const statusColors: Record<string, string> = {
        draft: "bg-yellow-500/10 text-yellow-400",
        published: "bg-emerald-500/10 text-emerald-400",
        archived: "bg-slate-500/10 text-slate-400",
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Pages</h1>
                    <p className="text-slate-400 text-sm">Manage knowledge base pages and content</p>
                </div>
                <button
                    onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ title: "", slug: "", section_id: sections[0]?.id || "", status: "draft" }); }}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white transition-colors"
                >
                    + New Page
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                            <input
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") })}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Section</label>
                            <select
                                value={form.section_id}
                                onChange={(e) => setForm({ ...form, section_id: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select section</option>
                                {sections.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white">
                            {editingId ? "Update" : "Create"}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300">Cancel</button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="text-slate-500 text-center py-12">Loading...</div>
            ) : pages.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                    <div className="text-4xl mb-3">📄</div>
                    <p>No pages yet. Create your first page above.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {pages.map((page) => (
                        <div key={page.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between hover:border-slate-700 transition-colors">
                            <div className="flex items-center gap-4">
                                <div>
                                    <div className="font-medium text-white">{page.title}</div>
                                    <div className="text-xs text-slate-500">/{page.slug} · {page.section?.name} · {page.modules?.length || 0} modules</div>
                                </div>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[page.status] || ""}`}>
                                    {page.status}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                {page.status === "draft" && (
                                    <button onClick={() => handlePublish(page.id)} className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg text-xs text-emerald-400">Publish</button>
                                )}
                                {page.status === "published" && (
                                    <button onClick={() => handleArchive(page.id)} className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg text-xs text-amber-400">Archive</button>
                                )}
                                <button onClick={() => handleEditSettings(page)} className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-xs text-blue-400">Settings</button>
                                <a href={`/admin/pages/${page.id}`} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300">Edit Modules</a>
                                <button onClick={() => handleDelete(page.id)} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-xs text-red-400">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
