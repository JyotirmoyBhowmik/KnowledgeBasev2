"use client";

import { useEffect, useState } from "react";
import { settingsApi, filesApi } from "@/lib/api";

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [brandIcon, setBrandIcon] = useState("");
    const [favicon, setFavicon] = useState("");
    const [brandFile, setBrandFile] = useState<File | null>(null);
    const [faviconFile, setFaviconFile] = useState<File | null>(null);
    const [retentionDays, setRetentionDays] = useState("30");

    const load = async () => {
        try {
            const data = await settingsApi.getAll();
            setSettings(data);
            const bi = data.find((s: any) => s.key === "site_brand_icon");
            const fav = data.find((s: any) => s.key === "favicon");
            const ret = data.find((s: any) => s.key === "activity_log_retention_days");
            if (bi) setBrandIcon(bi.value);
            if (fav) setFavicon(fav.value);
            if (ret) setRetentionDays(ret.value);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (brandFile) {
                const res = await filesApi.upload(brandFile, "ICON");
                await settingsApi.update("site_brand_icon", res.url || res.file_path);
            } else if (brandIcon) {
                await settingsApi.update("site_brand_icon", brandIcon);
            }
            if (faviconFile) {
                const res = await filesApi.upload(faviconFile, "ICON");
                await settingsApi.update("favicon", res.url || res.file_path);
            } else if (favicon) {
                await settingsApi.update("favicon", favicon);
            }
            await settingsApi.update("activity_log_retention_days", retentionDays.toString() || "30");
            alert("Settings saved!");
            load();
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally { setSaving(false); }
    };

    if (loading) return <div className="text-slate-500 text-center py-12">Loading settings...</div>;

    const isImageUrl = (val: string) => val && (val.startsWith("/api/files") || val.startsWith("http") || val.endsWith(".png") || val.endsWith(".jpg") || val.endsWith(".ico"));

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Site Settings</h1>
                    <p className="text-slate-500 text-sm">Configure brand identity and site appearance</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Brand Icon */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">🎨 Site Brand Icon</h3>
                    <p className="text-sm text-slate-500 mb-4">This icon appears in the top navigation bar</p>
                    <div className="flex items-start gap-6">
                        <div className="flex-1 space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Upload Image</label>
                                <input type="file" accept=".png,.jpg,.jpeg,.gif,.webp,.ico"
                                    onChange={(e) => setBrandFile(e.target.files?.[0] || null)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Or enter emoji / URL</label>
                                <input type="text" value={brandIcon} onChange={(e) => setBrandIcon(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="🚀 or /api/files/static/icon.png" />
                            </div>
                        </div>
                        <div className="w-20 h-20 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-3xl shrink-0">
                            {brandFile ? (
                                <img src={URL.createObjectURL(brandFile)} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                            ) : isImageUrl(brandIcon) ? (
                                <img src={brandIcon} alt="Brand" className="w-full h-full object-contain rounded-xl" />
                            ) : (
                                <span>{brandIcon || "🚀"}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Favicon */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">⭐ Favicon</h3>
                    <p className="text-sm text-slate-500 mb-4">The small icon shown in the browser tab</p>
                    <div className="flex items-start gap-6">
                        <div className="flex-1 space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Upload Image</label>
                                <input type="file" accept=".png,.jpg,.jpeg,.ico"
                                    onChange={(e) => setFaviconFile(e.target.files?.[0] || null)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Or enter path</label>
                                <input type="text" value={favicon} onChange={(e) => setFavicon(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="favicon.ico" />
                            </div>
                        </div>
                        <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
                            {faviconFile ? (
                                <img src={URL.createObjectURL(faviconFile)} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                            ) : isImageUrl(favicon) ? (
                                <img src={favicon} alt="Favicon" className="w-full h-full object-contain rounded-lg" />
                            ) : (
                                <span className="text-xs text-slate-400">{favicon || "ico"}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* System Settings */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">⚙️ System Configuration</h3>
                    <p className="text-sm text-slate-500 mb-4">Manage deep system behaviors</p>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Activity Log Retention (Days)</label>
                            <input type="number" min="1" max="3650" value={retentionDays} onChange={(e) => setRetentionDays(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="30" />
                            <p className="text-xs text-slate-400 mt-1">Logs older than this will be permanently purged.</p>
                        </div>
                    </div>
                </div>

                {/* All Settings Table */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">📋 All Settings</h3>
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600 border-b uppercase text-xs font-bold tracking-wide">
                            <tr><th className="px-4 py-3 text-left">Key</th><th className="px-4 py-3 text-left">Value</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {settings.map(s => (
                                <tr key={s.id || s.key} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-800">{s.key}</td>
                                    <td className="px-4 py-3 text-slate-600 truncate max-w-xs">{s.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button onClick={handleSave} disabled={saving}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-bold text-white shadow-sm disabled:opacity-50">
                    {saving ? "Saving..." : "💾 Save All Settings"}
                </button>
            </div>
        </div>
    );
}
