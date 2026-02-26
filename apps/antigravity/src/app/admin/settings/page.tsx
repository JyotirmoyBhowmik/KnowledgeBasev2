"use client";

import { useEffect, useState } from "react";
import { settingsApi } from "@/lib/api";

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadSettings = async () => {
        try {
            const data = await settingsApi.getAll();
            const config = data.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
            setSettings({
                site_brand_icon: config.site_brand_icon || "🚀",
                favicon: config.favicon || "favicon.ico"
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadSettings(); }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await settingsApi.update("site_brand_icon", settings.site_brand_icon);
            await settingsApi.update("favicon", settings.favicon);
            alert("Settings updated successfully!");
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-slate-500 py-12">Loading settings...</div>;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Site Settings</h1>
                <p className="text-slate-500 text-sm">Manage global application settings</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm p-6 max-w-2xl">
                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Site Brand Icon (Emoji or SVG)</label>
                        <input
                            type="text"
                            value={settings.site_brand_icon}
                            onChange={(e) => setSettings({ ...settings, site_brand_icon: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="e.g. 🛠️"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Favicon URL or path</label>
                        <input
                            type="text"
                            value={settings.favicon}
                            onChange={(e) => setSettings({ ...settings, favicon: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="/favicon.ico"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Settings"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
