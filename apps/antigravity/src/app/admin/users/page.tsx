"use client";

import { useEffect, useState } from "react";
import { usersApi } from "@/lib/api";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "viewer" });
    const [creating, setCreating] = useState(false);

    // Edit functionality
    const [editingUser, setEditingUser] = useState<any>(null);
    const [editForm, setEditForm] = useState({ name: "", email: "", role: "" });
    const [updating, setUpdating] = useState(false);

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

    const handleEditClick = (u: any) => {
        setEditingUser(u);
        const primaryRole = u.roles?.length ? (u.roles[0].role?.name || u.roles[0].name) : "viewer";
        setEditForm({ name: u.name || "", email: u.email || "", role: primaryRole });
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setUpdating(true);
        try {
            await usersApi.update(editingUser.id, { name: editForm.name, email: editForm.email, role: editForm.role });
            setEditingUser(null);
            loadUsers();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const toggleStatus = async (user: any) => {
        try {
            if (user.status === 'active') {
                if (confirm(`Are you sure you want to deactivate ${user.name}? They will lose access.`)) {
                    await usersApi.deactivate(user.id);
                }
            } else {
                await usersApi.activate(user.id);
            }
            loadUsers();
        } catch (err: any) {
            alert(err.message);
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

            {editingUser && (
                <div className="fixed inset-0 bg-slate-900/40 z-50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Edit User Profile</h3>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Full Name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input required type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Primary Role</label>
                                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                                    <option value="viewer">Viewer</option>
                                    <option value="contributor">Contributor</option>
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                                <p className="text-xs text-slate-500 mt-1">This will override current roles.</p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button disabled={updating} type="submit" className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white shadow-sm disabled:opacity-50">
                                    {updating ? "Saving..." : "Save Changes"}
                                </button>
                                <button type="button" onClick={() => setEditingUser(null)} className="py-2 px-4 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-medium text-slate-700">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
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
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEditClick(u)}
                                            className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded hover:bg-slate-200 transition-colors uppercase tracking-wide"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(u)}
                                            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded border transition-colors ${u.status === 'active'
                                                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                }`}
                                        >
                                            {u.status === 'active' ? 'Deactivate' : 'Activate'}
                                        </button>
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
