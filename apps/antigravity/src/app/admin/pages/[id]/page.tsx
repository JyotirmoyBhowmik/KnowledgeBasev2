"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { pagesApi, modulesApi, filesApi } from "@/lib/api";

export default function AdminPageEditor() {
    const params = useParams();
    const pageId = params.id as string;
    const [page, setPage] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModuleForm, setShowModuleForm] = useState(false);
    const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
    const [moduleForm, setModuleForm] = useState({ type: "TEXT" as string, content: "", title: "", url: "" });
    const [moduleFile, setModuleFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [pageSettings, setPageSettings] = useState({ status: "draft", show_author: true, show_metrics: true, icon: "" });
    const [savingSettings, setSavingSettings] = useState(false);

    const load = async () => {
        try {
            const p = await pagesApi.getOne(pageId);
            setPage(p);
            setModules(p.modules || []);
            setPageSettings({
                status: p.status || "draft",
                show_author: p.show_author !== false, // default true
                show_metrics: p.show_metrics !== false, // default true
                icon: p.icon || ""
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [pageId]);

    const handleSaveSettings = async () => {
        setSavingSettings(true);
        try {
            await pagesApi.update(pageId, pageSettings);
            load();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSavingSettings(false);
        }
    };

    const handleAddModule = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let uploadedFilePath = undefined;

            if ((moduleForm.type === "PDF" || moduleForm.type === "VIDEO" || moduleForm.type === "IMAGE") && moduleFile) {
                setUploading(true);
                const fileRes = await filesApi.upload(moduleFile, moduleForm.type);
                uploadedFilePath = fileRes.file_path;
            }

            const payload = {
                page_id: pageId,
                type: moduleForm.type,
                content: moduleForm.type === "TEXT" ? moduleForm.content : undefined,
                title: moduleForm.title || undefined,
                url: moduleForm.type === "URL" ? moduleForm.url : undefined,
                file_path: uploadedFilePath,
            };

            if (editingModuleId) {
                await modulesApi.update(editingModuleId, payload);
            } else {
                await modulesApi.create({ ...payload, order: modules.length });
            }

            setShowModuleForm(false);
            setEditingModuleId(null);
            setModuleForm({ type: "TEXT", content: "", title: "", url: "" });
            setModuleFile(null);
            setUploading(false);
            load();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleEditModule = (mod: any) => {
        setEditingModuleId(mod.id);
        setModuleForm({
            type: mod.type,
            content: mod.content || "",
            title: mod.title || "",
            url: mod.url || ""
        });
        setModuleFile(null);
        setShowModuleForm(true);
    };

    const handleDeleteModule = async (id: string) => {
        if (!confirm("Remove this module?")) return;
        try { await modulesApi.delete(id); load(); } catch (err: any) { alert(err.message); }
    };

    if (loading) return <div className="text-slate-500 text-center py-12">Loading...</div>;
    if (!page) return <div className="text-red-400 text-center py-12">Page not found</div>;

    const typeIcons: Record<string, string> = { TEXT: "📝", PDF: "📄", VIDEO: "🎬", URL: "🔗", IMAGE: "🖼️" };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">{page.title}</h1>
                    <p className="text-slate-400 text-sm">/{page.slug} · {page.section?.name}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setEditingModuleId(null);
                            setModuleForm({ type: "TEXT", content: "", title: "", url: "" });
                            setModuleFile(null);
                            setShowModuleForm(!showModuleForm);
                        }}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white transition-colors"
                    >
                        + Add Module
                    </button>
                </div>
            </div>

            {/* Page Settings Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 flex flex-wrap items-center gap-6 shadow-sm">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <label className="text-sm font-medium text-slate-300">Status:</label>
                    <select
                        value={pageSettings.status}
                        onChange={(e) => setPageSettings({ ...pageSettings, status: e.target.value })}
                        className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-sm text-white focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <label className="text-sm font-medium text-slate-300">Icon:</label>
                    <input
                        type="text"
                        value={pageSettings.icon}
                        onChange={(e) => setPageSettings({ ...pageSettings, icon: e.target.value })}
                        className="px-3 py-1.5 w-20 bg-slate-800 border border-slate-700 rounded-md text-sm text-white focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. 📄"
                    />
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                        type="checkbox"
                        checked={pageSettings.show_author}
                        onChange={(e) => setPageSettings({ ...pageSettings, show_author: e.target.checked })}
                        className="rounded border-slate-600 focus:ring-indigo-500 bg-slate-800 text-indigo-600 w-4 h-4"
                    />
                    Show Author
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                        type="checkbox"
                        checked={pageSettings.show_metrics}
                        onChange={(e) => setPageSettings({ ...pageSettings, show_metrics: e.target.checked })}
                        className="rounded border-slate-600 focus:ring-indigo-500 bg-slate-800 text-indigo-600 w-4 h-4"
                    />
                    Show Metrics
                </label>

                <div className="sm:ml-auto w-full sm:w-auto mt-4 sm:mt-0">
                    <button
                        onClick={handleSaveSettings}
                        disabled={savingSettings}
                        className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium text-slate-200 transition-colors disabled:opacity-50"
                    >
                        {savingSettings ? "Saving..." : "Save Settings"}
                    </button>
                </div>
            </div>

            {showModuleForm && (
                <form onSubmit={handleAddModule} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                            <select
                                value={moduleForm.type}
                                onChange={(e) => setModuleForm({ ...moduleForm, type: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                            >
                                <option value="TEXT">Text (Rich HTML/Markdown)</option>
                                <option value="PDF">PDF Document</option>
                                <option value="VIDEO">Video</option>
                                <option value="IMAGE">Image</option>
                                <option value="URL">External URL</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                            <input
                                value={moduleForm.title}
                                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                                placeholder="Module title"
                            />
                        </div>
                    </div>

                    {moduleForm.type === "TEXT" && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Content</label>
                            <textarea
                                value={moduleForm.content}
                                onChange={(e) => setModuleForm({ ...moduleForm, content: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm min-h-[200px] font-mono"
                                placeholder="HTML or Markdown content..."
                            />
                        </div>
                    )}

                    {moduleForm.type === "URL" && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">URL</label>
                            <input
                                value={moduleForm.url}
                                onChange={(e) => setModuleForm({ ...moduleForm, url: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                                placeholder="https://..."
                            />
                        </div>
                    )}

                    {(moduleForm.type === "PDF" || moduleForm.type === "VIDEO" || moduleForm.type === "IMAGE") && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Upload File ({moduleForm.type})</label>
                            <input
                                type="file"
                                accept={moduleForm.type === "PDF" ? ".pdf" : moduleForm.type === "VIDEO" ? ".mp4,.webm" : ".png,.jpg,.jpeg,.gif,.webp"}
                                onChange={(e) => setModuleFile(e.target.files?.[0] || null)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                            />
                            {moduleFile && (
                                <p className="mt-2 text-xs text-slate-400 font-medium tracking-wide">
                                    ✓ Selected: {moduleFile.name} ({(moduleFile.size / 1024 / 1024).toFixed(2)} MB)
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={uploading} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white shadow-sm disabled:opacity-50 min-w-[120px]">
                            {uploading ? "Uploading..." : editingModuleId ? "Save Module" : "Add Module"}
                        </button>
                        <button type="button" onClick={() => {
                            setShowModuleForm(false);
                            setEditingModuleId(null);
                        }} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-300 transition-colors">Cancel</button>
                    </div>
                </form>
            )}

            {modules.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                    <div className="text-4xl mb-3">📦</div>
                    <p>No modules yet. Add your first content module above.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {modules.map((mod, index) => (
                        <div key={mod.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{typeIcons[mod.type] || "📦"}</span>
                                    <span className="text-sm font-medium text-white">{mod.title || `${mod.type} Module #${index + 1}`}</span>
                                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded-full">{mod.type}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEditModule(mod)} className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-xs text-blue-400">Edit</button>
                                    <button onClick={() => handleDeleteModule(mod.id)} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-xs text-red-400">Remove</button>
                                </div>
                            </div>
                            {mod.type === "TEXT" && mod.content && (
                                <div className="text-sm text-slate-400 line-clamp-3 bg-slate-800/50 p-3 rounded-lg" dangerouslySetInnerHTML={{ __html: mod.content.substring(0, 300) }} />
                            )}
                            {mod.type === "URL" && mod.url && (
                                <a href={mod.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:underline">{mod.url}</a>
                            )}
                            {(mod.type === "PDF" || mod.type === "VIDEO" || mod.type === "IMAGE") && mod.file_path && (
                                <div className="text-sm text-slate-500 bg-slate-800/50 p-3 rounded-lg flex items-center gap-2 mt-2">
                                    {mod.type === "IMAGE" ? (
                                        <img src={`/api/files/${mod.id}`} alt={mod.title} className="max-h-32 rounded border border-slate-700 object-contain bg-black/40" />
                                    ) : (
                                        <span>📎 {mod.file_path}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
