"use client";

import { useEffect, useState } from "react";
import { usersApi } from "@/lib/api";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "viewer" });
    const [creating, setCreating] = useState(false);

    const loadUsers = async () => {
        try {
            const data = await usersApi.getAll();
            setUsers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadUsers(); }, []);

    const assignRole = async (userId: string, roleName: string) => {
        try {
            await usersApi.assignRole(userId, roleName);
            loadUsers();
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            await usersApi.create(userForm);
            setShowForm(false);
            setUserForm({ name: "", email: "", password: "", role: "viewer" });
            loadUsers();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
                    <p className="text-slate-500 text-sm">Manage system users and their roles</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white transition-colors shadow-sm"
                >
                    + Add User
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreateUser} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Add New User</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                            <input required value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Full Name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input required type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Email address" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input required type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Set login password" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                            <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                                <option value="viewer">Viewer</option>
                                <option value="contributor">Contributor</option>
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                        <button disabled={creating} type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white shadow-sm disabled:opacity-50">
                            {creating ? "Creating..." : "Create User"}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-medium text-slate-700">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="text-slate-500 py-12">Loading users...</div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-xs font-bold font-sans tracking-wide">
                            <tr>
                                <th className="px-6 py-4">Name / Email</th>
                                <th className="px-6 py-4">Auth</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Roles</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-900">{u.name || "Unknown"}</div>
                                        <div className="text-xs text-slate-500">{u.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium uppercase tracking-wider">{u.auth_source}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-md font-bold uppercase tracking-wider ${u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1 flex-wrap">
                                            {u.roles?.length ? u.roles.map((r: any) => (
                                                <span key={r.role_id || r.id} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-semibold uppercase">
                                                    {r.role?.name || r.name || "ROLE"}
                                                </span>
                                            )) : <span className="text-slate-400 text-xs italic">No roles</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <select
                                            onChange={(e) => { if (e.target.value) assignRole(u.id, e.target.value); e.target.value = ""; }}
                                            className="uppercase text-xs font-bold tracking-wider py-1.5 px-2 border border-slate-200 rounded text-slate-700 bg-white hover:bg-slate-50 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Assign Role...</option>
                                            <option value="viewer">Viewer</option>
                                            <option value="contributor">Contributor</option>
                                            <option value="admin">Admin</option>
                                            <option value="super_admin">Super Admin</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && (
                        <div className="text-center py-12 text-slate-500">No users found.</div>
                    )}
                </div>
            )}
        </div>
    );
}
