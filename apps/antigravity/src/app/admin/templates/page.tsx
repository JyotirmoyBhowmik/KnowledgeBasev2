"use client";

import { useEffect, useState } from "react";
import { templatesApi } from "@/lib/api";

export default function AdminTemplatesPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: "", description: "", modules: "[]" });
    const [editingId, setEditingId] = useState<string | null>(null);

    const load = async () => {
        try {
            const data = await templatesApi.getAll();
            setTemplates(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let parsedModules: any[];
            try { parsedModules = JSON.parse(form.modules); } catch { alert("Invalid JSON for modules"); return; }

            const payload = { name: form.name, description: form.description, modules: parsedModules };
            if (editingId) {
                await templatesApi.update(editingId, payload);
            } else {
                await templatesApi.create(payload);
            }
            setShowForm(false);
            setEditingId(null);
            setForm({ name: "", description: "", modules: "[]" });
            load();
        } catch (err: any) { alert(err.message); }
    };

    const handleEdit = (t: any) => {
        setForm({
            name: t.name,
            description: t.description || "",
            modules: JSON.stringify(t.modules, null, 2),
        });
        setEditingId(t.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this template?")) return;
        await templatesApi.delete(id);
        load();
    };

    const presets = [
        {
            name: "FAQ",
            modules: [
                { type: "TEXT", title: "Question 1", content: "<h3>What is ...?</h3><p>Answer here.</p>", order: 0 },
                { type: "TEXT", title: "Question 2", content: "<h3>How to ...?</h3><p>Answer here.</p>", order: 1 },
            ]
        },
        {
            name: "SOP (Standard Operating Procedure)",
            modules: [
                { type: "TEXT", title: "Purpose", content: "<h2>Purpose</h2><p>Describe the purpose...</p>", order: 0 },
                { type: "TEXT", title: "Scope", content: "<h2>Scope</h2><p>Define the scope...</p>", order: 1 },
                { type: "TEXT", title: "Procedure", content: "<h2>Procedure</h2><ol><li>Step 1</li><li>Step 2</li></ol>", order: 2 },
            ]
        },
        {
            name: "Tutorial",
            modules: [
                { type: "TEXT", title: "Introduction", content: "<h2>Introduction</h2><p>Overview of the tutorial.</p>", order: 0 },
                { type: "TEXT", title: "Prerequisites", content: "<h2>Prerequisites</h2><ul><li>Item 1</li></ul>", order: 1 },
                { type: "TEXT", title: "Steps", content: "<h2>Steps</h2><ol><li>Do this</li><li>Then that</li></ol>", order: 2 },
                { type: "TEXT", title: "Summary", content: "<h2>Summary</h2><p>Wrap up here.</p>", order: 3 },
            ]
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">📋 Page Templates</h1>
                    <p className="text-slate-500 text-sm">Pre-defined layouts for quick page creation</p>
                </div>
                <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: "", description: "", modules: "[]" }); }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white transition-colors shadow-sm">
                    + New Template
                </button>
            </div>

            {/* Quick Presets */}
            {templates.length === 0 && !showForm && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
                    <h3 className="text-sm font-bold text-blue-800 mb-3">Quick Start — Add a preset template:</h3>
                    <div className="flex gap-3 flex-wrap">
                        {presets.map(p => (
                            <button key={p.name} onClick={async () => {
                                await templatesApi.create({ name: p.name, description: `Auto-generated ${p.name} template`, modules: p.modules });
                                load();
                            }} className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors shadow-sm">
                                + {p.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6 space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">{editingId ? "Edit Template" : "New Template"}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Template name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Brief description" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Modules (JSON)</label>
                        <textarea value={form.modules} onChange={(e) => setForm({ ...form, modules: e.target.value })} rows={6}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs" />
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white shadow-sm">
                            {editingId ? "Update" : "Create"}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-medium text-slate-700">Cancel</button>
                    </div>
                </form>
            )}

            {loading ? <div className="text-slate-500 py-12">Loading templates...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map(t => (
                        <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="font-bold text-slate-800">{t.name}</h3>
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(t)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">✏️</button>
                                    <button onClick={() => handleDelete(t.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors" title="Delete">🗑️</button>
                                </div>
                            </div>
                            {t.description && <p className="text-sm text-slate-500 mb-3">{t.description}</p>}
                            <div className="text-xs text-slate-400 font-medium">
                                {Array.isArray(t.modules) ? t.modules.length : 0} module(s)
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
