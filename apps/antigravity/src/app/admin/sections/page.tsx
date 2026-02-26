"use client";

import { useEffect, useState } from "react";
import { sectionsApi } from "@/lib/api";

export default function AdminSectionsPage() {
    const [sections, setSections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: "", slug: "", route: "", roles_allowed: "", parent_id: "", order: 0, visible: true, icon: "" });
    const [editingId, setEditingId] = useState<string | null>(null);

    const load = async () => {
        try {
            const data = await sectionsApi.getAll();
            setSections(data);
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
            const finalRoles = form.roles_allowed ? form.roles_allowed.split(',').map(r => r.trim()).filter(Boolean) : [];
            const payload = { ...form, parent_id: form.parent_id || null, roles_allowed: finalRoles.length ? finalRoles : null, icon: form.icon || null };
            if (editingId) {
                await sectionsApi.update(editingId, payload);
            } else {
                await sectionsApi.create(payload);
            }
            setShowForm(false);
            setEditingId(null);
            setForm({ name: "", slug: "", route: "", roles_allowed: "", parent_id: "", order: 0, visible: true, icon: "" });
            load();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleEdit = (section: any) => {
        setForm({
            name: section.name,
            slug: section.slug,
            route: section.route || "",
            roles_allowed: section.roles_allowed ? section.roles_allowed.join(", ") : "",
            parent_id: section.parent_id || "",
            order: section.order,
            visible: section.visible,
            icon: section.icon || ""
        });
        setEditingId(section.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this section?")) return;
        try {
            await sectionsApi.delete(id);
            load();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Sections</h1>
                    <p className="text-slate-400 text-sm">Manage knowledge base sections</p>
                </div>
                <button
                    onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: "", slug: "", route: "", roles_allowed: "", parent_id: "", order: 0, visible: true, icon: "" }); }}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white transition-colors"
                >
                    + New Section
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                            <input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Icon (Emoji/SVG)</label>
                            <input
                                value={form.icon}
                                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="e.g. 📂"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Slug</label>
                            <input
                                value={form.slug}
                                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Route Override</label>
                            <input
                                value={form.route}
                                placeholder="e.g. /home or http://..."
                                onChange={(e) => setForm({ ...form, route: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Roles Allowed (comma separated)</label>
                            <input
                                value={form.roles_allowed}
                                placeholder="e.g. manager, admin"
                                onChange={(e) => setForm({ ...form, roles_allowed: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Order</label>
                            <input
                                type="number"
                                value={form.order}
                                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Parent Section</label>
                            <select
                                value={form.parent_id || ""}
                                onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="">None (Top Level)</option>
                                {sections.filter(s => s.id !== editingId).map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 text-sm text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={form.visible}
                                    onChange={(e) => setForm({ ...form, visible: e.target.checked })}
                                    className="rounded border-slate-600"
                                />
                                Visible
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white">
                            {editingId ? "Update" : "Create"}
                        </button>
                        <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="text-slate-500 text-center py-12">Loading...</div>
            ) : sections.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                    <div className="text-4xl mb-3">📂</div>
                    <p>No sections yet. Create your first section above.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sections.map((section) => (
                        <div key={section.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between hover:border-slate-700 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center text-indigo-400 font-bold text-sm">
                                    {section.order}
                                </div>
                                <div>
                                    <div className="font-medium text-white flex items-center gap-2">
                                        {section.icon && <span className="text-lg">{section.icon}</span>}
                                        {section.name}
                                        {section.parent_id && <span className="ml-2 text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded">Sub-section</span>}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        /{section.slug} · {section.pages?.length || 0} pages
                                        {section.route && ` · Route: ${section.route}`}
                                        {section.roles_allowed && section.roles_allowed.length > 0 && ` · Roles: ${section.roles_allowed.join(', ')}`}
                                    </div>
                                </div>
                                {!section.visible && (
                                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs rounded-full">Hidden</span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(section)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300">Edit</button>
                                <button onClick={() => handleDelete(section.id)} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-xs text-red-400">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
