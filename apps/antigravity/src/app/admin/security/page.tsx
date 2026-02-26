"use client";

import { useState } from "react";

export default function AdminSecurityPage() {
    const [saving, setSaving] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            alert("Active Directory configuration saved successfully! System needs to reboot to apply changes.");
        }, 1200);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Security & Active Directory</h1>
                <p className="text-slate-500 text-sm">Configure enterprise Single Sign-On, LDAP mapping, and security policies.</p>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>🛡️</span> Directory Integration
                    </h2>
                    <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded shadow-inner">Premium</span>
                </div>

                <div className="p-6">
                    <div className="mb-6 p-4 bg-sky-50 border border-sky-100 rounded-lg text-sm text-sky-800">
                        <strong>Feature Information:</strong> Active Directory (Azure AD / On-Premise) synchronization allows users to log into Knowledge Bites using their enterprise credentials. Role mappings automatically apply AD Groups to local Roles.
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">LDAP Server URL</label>
                                <input type="text" placeholder="ldaps://dc1.enterprise.local:636" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bind DN / Service Account</label>
                                <input type="text" placeholder="CN=LDAP_Read,OU=ServiceAccounts,DC=enterprise,DC=local" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Service Password</label>
                                <input type="password" placeholder="••••••••••••••" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-4">SSO & Provisioning</h3>

                            <div className="space-y-3">
                                <label className="flex items-center gap-3">
                                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" defaultChecked />
                                    <span className="text-sm text-slate-700 font-medium">Enable Just-In-Time (JIT) Provisioning</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" defaultChecked />
                                    <span className="text-sm text-slate-700 font-medium">Sync AD Groups to Knowledge Bites Roles</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                                    <span className="text-sm text-slate-700 font-medium">Force Multi-Factor Authentication (MFA)</span>
                                </label>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-end gap-3">
                            <button type="button" className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold tracking-wide rounded-lg transition-colors">Test Connection</button>
                            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold tracking-wide rounded-lg shadow-sm transition-colors disabled:opacity-70">
                                {saving ? "Saving Configuration..." : "Save AD Settings"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
