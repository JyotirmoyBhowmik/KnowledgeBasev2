"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { pagesApi, modulesApi, filesApi, versionsApi } from "@/lib/api";

const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), { ssr: false });

export default function AdminPageEditor() {
    const params = useParams();
    const pageId = params.id as string;
    const [page, setPage] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModuleForm, setShowModuleForm] = useState(false);
    const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
    const [moduleForm, setModuleForm] = useState<any>({ type: "TEXT", content: "", title: "", url: "", metadata: {} });
    const [moduleFile, setModuleFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [pageSettings, setPageSettings] = useState({ status: "draft", show_author: true, show_metrics: true, icon: "" });
    const [savingSettings, setSavingSettings] = useState(false);
    const [showVersions, setShowVersions] = useState(false);
    const [versions, setVersions] = useState<any[]>([]);
    const [dragIdx, setDragIdx] = useState<number | null>(null);

    const load = async () => {
        try {
            const p = await pagesApi.getOne(pageId);
            setPage(p);
            setModules(p.modules || []);
            setPageSettings({
                status: p.status || "draft",
                show_author: p.show_author !== false,
                show_metrics: p.show_metrics !== false,
                icon: p.icon || ""
            });
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [pageId]);

    const handleSaveSettings = async () => {
        setSavingSettings(true);
        try { await pagesApi.update(pageId, pageSettings); load(); }
        catch (err: any) { alert(err.message); }
        finally { setSavingSettings(false); }
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

            const payload: any = {
                page_id: pageId,
                type: moduleForm.type,
                title: moduleForm.title || undefined,
                file_path: uploadedFilePath,
            };

            if (moduleForm.type === "TEXT") payload.content = moduleForm.content;
            if (moduleForm.type === "CODE") { payload.content = moduleForm.content; payload.metadata = { language: moduleForm.metadata?.language || "plaintext" }; }
            if (moduleForm.type === "TABLE") { payload.metadata = { headers: moduleForm.metadata?.headers || [], rows: moduleForm.metadata?.rows || [] }; }
            if (moduleForm.type === "EMBED") { payload.metadata = { embedUrl: moduleForm.metadata?.embedUrl || "" }; }
            if (moduleForm.type === "URL") payload.url = moduleForm.url;

            if (editingModuleId) {
                await modulesApi.update(editingModuleId, payload);
            } else {
                await modulesApi.create({ ...payload, order: modules.length });
            }
            // Auto-snapshot on module change
            versionsApi.snapshot(pageId).catch(() => { });
            resetForm();
            load();
        } catch (err: any) { alert(err.message); }
        finally { setUploading(false); }
    };

    const resetForm = () => {
        setShowModuleForm(false);
        setEditingModuleId(null);
        setModuleForm({ type: "TEXT", content: "", title: "", url: "", metadata: {} });
        setModuleFile(null);
    };

    const handleEditModule = (mod: any) => {
        setEditingModuleId(mod.id);
        setModuleForm({ type: mod.type, content: mod.content || "", title: mod.title || "", url: mod.url || "", metadata: mod.metadata || {} });
        setModuleFile(null);
        setShowModuleForm(true);
    };

    const handleDeleteModule = async (id: string) => {
        if (!confirm("Remove this module?")) return;
        try { await modulesApi.delete(id); load(); } catch (err: any) { alert(err.message); }
    };

    // Drag and drop handlers
    const handleDragStart = (idx: number) => setDragIdx(idx);
    const handleDragOver = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        if (dragIdx === null || dragIdx === idx) return;
        const newMods = [...modules];
        const dragged = newMods.splice(dragIdx, 1)[0];
        newMods.splice(idx, 0, dragged);
        setModules(newMods);
        setDragIdx(idx);
    };
    const handleDragEnd = async () => {
        setDragIdx(null);
        const ids = modules.map(m => m.id);
        try { await modulesApi.reorder(pageId, ids); } catch (e) { console.error(e); }
    };

    // Version history
    const loadVersions = async () => {
        try { const v = await versionsApi.getAll(pageId); setVersions(v); }
        catch (e) { console.error(e); }
    };
    const handleRestore = async (versionId: string) => {
        if (!confirm("Restore this version? Current content will be overwritten.")) return;
        await versionsApi.restore(pageId, versionId);
        load();
        setShowVersions(false);
    };

    // Approval workflow
    const handleWorkflowAction = async (action: string) => {
        try {
            if (action === "submit") await pagesApi.submitForReview(pageId);
            else if (action === "approve") await pagesApi.approve(pageId);
            else if (action === "reject") await pagesApi.reject(pageId);
            load();
        } catch (err: any) { alert(err.message); }
    };

    if (loading) return <div className="text-slate-500 text-center py-12">Loading...</div>;
    if (!page) return <div className="text-red-400 text-center py-12">Page not found</div>;

    const typeIcons: Record<string, string> = { TEXT: "📝", PDF: "📄", VIDEO: "🎬", URL: "🔗", IMAGE: "🖼️", TABLE: "📊", CODE: "💻", EMBED: "🪟" };
    const statusColors: Record<string, string> = {
        draft: "bg-yellow-100 text-yellow-800 border-yellow-300",
        review: "bg-blue-100 text-blue-800 border-blue-300",
        published: "bg-emerald-100 text-emerald-800 border-emerald-300",
        archived: "bg-slate-200 text-slate-600 border-slate-300",
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-800">{page.title}</h1>
                        <span className={`px-2 py-0.5 text-xs font-bold uppercase border rounded ${statusColors[page.status] || ""}`}>{page.status}</span>
                    </div>
                    <p className="text-slate-500 text-sm">/{page.slug} · {page.section?.name}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {page.status === "draft" && <button onClick={() => handleWorkflowAction("submit")} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold text-white">📤 Submit for Review</button>}
                    {page.status === "review" && (
                        <>
                            <button onClick={() => handleWorkflowAction("approve")} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold text-white">✅ Approve</button>
                            <button onClick={() => handleWorkflowAction("reject")} className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold text-white">❌ Reject</button>
                        </>
                    )}
                    <button onClick={() => { setShowVersions(!showVersions); if (!showVersions) loadVersions(); }}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-bold text-slate-700">🕐 Versions</button>
                    <button onClick={() => { resetForm(); setShowModuleForm(!showModuleForm); }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white">+ Add Module</button>
                </div>
            </div>

            {/* Version History Panel */}
            {showVersions && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 max-h-64 overflow-y-auto">
                    <h3 className="font-bold text-slate-800 mb-3">Version History</h3>
                    {versions.length === 0 ? <p className="text-slate-500 text-sm">No versions saved yet.</p> : (
                        <div className="space-y-2">
                            {versions.map(v => (
                                <div key={v.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    <div>
                                        <span className="font-bold text-slate-800 text-sm">v{v.version}</span>
                                        <span className="text-xs text-slate-500 ml-3">{new Date(v.created_at).toLocaleString("en-GB")}</span>
                                        {v.user && <span className="text-xs text-slate-400 ml-2">by {v.user.name || v.user.email}</span>}
                                    </div>
                                    <button onClick={() => handleRestore(v.id)} className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-xs font-bold hover:bg-indigo-100">Restore</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Page Settings Bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 flex flex-wrap items-center gap-6 shadow-sm">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <label className="text-sm font-medium text-slate-700">Status:</label>
                    <select value={pageSettings.status} onChange={(e) => setPageSettings({ ...pageSettings, status: e.target.value })}
                        className="px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500">
                        <option value="draft">Draft</option>
                        <option value="review">In Review</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <label className="text-sm font-medium text-slate-700">Icon:</label>
                    <input type="text" value={pageSettings.icon} onChange={(e) => setPageSettings({ ...pageSettings, icon: e.target.value })}
                        className="px-3 py-1.5 w-20 border border-slate-300 rounded-md text-sm" placeholder="e.g. 📄" />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={pageSettings.show_author} onChange={(e) => setPageSettings({ ...pageSettings, show_author: e.target.checked })}
                        className="rounded border-slate-300 focus:ring-indigo-500 text-indigo-600 w-4 h-4" /> Show Author
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={pageSettings.show_metrics} onChange={(e) => setPageSettings({ ...pageSettings, show_metrics: e.target.checked })}
                        className="rounded border-slate-300 focus:ring-indigo-500 text-indigo-600 w-4 h-4" /> Show Metrics
                </label>
                <div className="sm:ml-auto">
                    <button onClick={handleSaveSettings} disabled={savingSettings}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium text-white disabled:opacity-50">
                        {savingSettings ? "Saving..." : "Save Settings"}
                    </button>
                </div>
            </div>

            {/* Module Form */}
            {showModuleForm && (
                <form onSubmit={handleAddModule} className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 space-y-4 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800">{editingModuleId ? "Edit Module" : "Add Module"}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                            <select value={moduleForm.type} onChange={(e) => setModuleForm({ ...moduleForm, type: e.target.value, metadata: {} })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                                <option value="TEXT">📝 Text (Rich Editor)</option>
                                <option value="PDF">📄 PDF Document</option>
                                <option value="VIDEO">🎬 Video</option>
                                <option value="IMAGE">🖼️ Image</option>
                                <option value="URL">🔗 External URL</option>
                                <option value="TABLE">📊 Table</option>
                                <option value="CODE">💻 Code Snippet</option>
                                <option value="EMBED">🪟 Embed (iframe)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                            <input value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Module title" />
                        </div>
                    </div>

                    {moduleForm.type === "TEXT" && (
                        <RichTextEditor content={moduleForm.content} onChange={(html: string) => setModuleForm({ ...moduleForm, content: html })} />
                    )}

                    {moduleForm.type === "CODE" && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
                                <select value={moduleForm.metadata?.language || "plaintext"}
                                    onChange={(e) => setModuleForm({ ...moduleForm, metadata: { ...moduleForm.metadata, language: e.target.value } })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                                    {["plaintext", "javascript", "typescript", "python", "java", "csharp", "html", "css", "sql", "bash", "json", "xml", "yaml", "powershell", "go", "rust", "php", "ruby"].map(l => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                            </div>
                            <textarea value={moduleForm.content} onChange={(e) => setModuleForm({ ...moduleForm, content: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm min-h-[200px] font-mono bg-slate-50"
                                placeholder="Paste your code here..." />
                        </div>
                    )}

                    {moduleForm.type === "TABLE" && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Headers (comma separated)</label>
                                <input value={(moduleForm.metadata?.headers || []).join(", ")}
                                    onChange={(e) => setModuleForm({ ...moduleForm, metadata: { ...moduleForm.metadata, headers: e.target.value.split(",").map((s: string) => s.trim()) } })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Column 1, Column 2, Column 3" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Rows (JSON array)</label>
                                <textarea value={JSON.stringify(moduleForm.metadata?.rows || [], null, 2)}
                                    onChange={(e) => { try { setModuleForm({ ...moduleForm, metadata: { ...moduleForm.metadata, rows: JSON.parse(e.target.value) } }); } catch { } }}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm min-h-[120px] font-mono bg-slate-50"
                                    placeholder='[["Cell 1", "Cell 2"], ["Cell 3", "Cell 4"]]' />
                            </div>
                        </div>
                    )}

                    {moduleForm.type === "EMBED" && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Embed URL (iframe src)</label>
                            <input value={moduleForm.metadata?.embedUrl || ""}
                                onChange={(e) => setModuleForm({ ...moduleForm, metadata: { ...moduleForm.metadata, embedUrl: e.target.value } })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="https://example.com/embed" />
                        </div>
                    )}

                    {moduleForm.type === "URL" && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">URL</label>
                            <input value={moduleForm.url} onChange={(e) => setModuleForm({ ...moduleForm, url: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="https://..." />
                        </div>
                    )}

                    {(moduleForm.type === "PDF" || moduleForm.type === "VIDEO" || moduleForm.type === "IMAGE") && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Upload File ({moduleForm.type})</label>
                            <input type="file"
                                accept={moduleForm.type === "PDF" ? ".pdf" : moduleForm.type === "VIDEO" ? ".mp4,.webm" : ".png,.jpg,.jpeg,.gif,.webp"}
                                onChange={(e) => setModuleFile(e.target.files?.[0] || null)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer" />
                            {moduleFile && <p className="mt-2 text-xs text-slate-500">✓ {moduleFile.name} ({(moduleFile.size / 1024 / 1024).toFixed(2)} MB)</p>}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={uploading} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white shadow-sm disabled:opacity-50">
                            {uploading ? "Uploading..." : editingModuleId ? "Save Module" : "Add Module"}
                        </button>
                        <button type="button" onClick={resetForm} className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-medium text-slate-700">Cancel</button>
                    </div>
                </form>
            )}

            {/* Module List with Drag and Drop */}
            {modules.length === 0 ? (
                <div className="text-center py-16 text-slate-500 bg-white border border-slate-200 rounded-2xl">
                    <div className="text-4xl mb-3">📦</div>
                    <p>No modules yet. Add your first content module above.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {modules.map((mod, index) => (
                        <div key={mod.id} draggable onDragStart={() => handleDragStart(index)} onDragOver={(e) => handleDragOver(e, index)} onDragEnd={handleDragEnd}
                            className={`bg-white border rounded-xl p-5 transition-all cursor-move group ${dragIdx === index ? "border-indigo-400 shadow-lg opacity-70" : "border-slate-200 hover:border-slate-300 hover:shadow-sm"}`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">⠿</span>
                                    <span className="text-lg">{typeIcons[mod.type] || "📦"}</span>
                                    <span className="text-sm font-semibold text-slate-800">{mod.title || `${mod.type} Module #${index + 1}`}</span>
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full font-medium">{mod.type}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEditModule(mod)} className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-xs text-indigo-700 font-bold">Edit</button>
                                    <button onClick={() => handleDeleteModule(mod.id)} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-xs text-red-600 font-bold">Remove</button>
                                </div>
                            </div>
                            {mod.type === "TEXT" && mod.content && (
                                <div className="text-sm text-slate-600 line-clamp-3 bg-slate-50 p-3 rounded-lg" dangerouslySetInnerHTML={{ __html: mod.content.substring(0, 300) }} />
                            )}
                            {mod.type === "CODE" && mod.content && (
                                <pre className="text-xs text-slate-600 bg-slate-900 text-slate-300 p-3 rounded-lg overflow-x-auto max-h-32"><code>{mod.content.substring(0, 500)}</code></pre>
                            )}
                            {mod.type === "TABLE" && mod.metadata?.headers && (
                                <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">{mod.metadata.headers.join(" | ")} ({(mod.metadata.rows || []).length} rows)</div>
                            )}
                            {mod.type === "EMBED" && mod.metadata?.embedUrl && (
                                <div className="text-xs text-indigo-600 bg-indigo-50 p-2 rounded-lg truncate">🪟 {mod.metadata.embedUrl}</div>
                            )}
                            {mod.type === "URL" && mod.url && (
                                <a href={mod.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">{mod.url}</a>
                            )}
                            {(mod.type === "PDF" || mod.type === "VIDEO" || mod.type === "IMAGE") && mod.file_path && (
                                <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg flex items-center gap-2 mt-1">
                                    {mod.type === "IMAGE" ? (
                                        <img src={`/api/files/${mod.id}`} alt={mod.title} className="max-h-32 rounded border border-slate-200 object-contain" />
                                    ) : <span>📎 {mod.file_path}</span>}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
