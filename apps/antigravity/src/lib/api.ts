export const API_BASE = typeof window === 'undefined' ? 'http://localhost:4000' : '';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE}${path}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options?.headers,
        },
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(error.message || 'API Error');
    }

    return res.json();
}

// ── Auth ─────────────────────────────────────────────
export const authApi = {
    login: (email: string, password: string) =>
        fetchApi<{ access_token: string; user: any }>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),
    register: (email: string, password: string, name?: string) =>
        fetchApi<any>('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        }),
    getProfile: () => fetchApi<any>('/api/auth/profile'),
};

// ── Sections ─────────────────────────────────────────
export const sectionsApi = {
    getAll: () => fetchApi<any[]>('/api/sections'),
    getTree: (roles?: string[]) => fetchApi<any[]>(`/api/sections/tree${roles ? `?roles=${roles.join(',')}` : ''}`),
    getOne: (id: string) => fetchApi<any>(`/api/sections/${id}`),
    getBySlug: (slug: string) => fetchApi<any>(`/api/sections/slug/${slug}`),
    create: (data: any) =>
        fetchApi<any>('/api/sections', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
        fetchApi<any>(`/api/sections/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
        fetchApi<any>(`/api/sections/${id}`, { method: 'DELETE' }),
};

// ── Pages ────────────────────────────────────────────
export const pagesApi = {
    getAll: (sectionId?: string) =>
        fetchApi<any[]>(`/api/pages${sectionId ? `?sectionId=${sectionId}` : ''}`),
    getOne: (id: string) => fetchApi<any>(`/api/pages/${id}`),
    getBySlug: (slug: string) => fetchApi<any>(`/api/pages/slug/${slug}`),
    create: (data: any) =>
        fetchApi<any>('/api/pages', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
        fetchApi<any>(`/api/pages/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
        fetchApi<any>(`/api/pages/${id}`, { method: 'DELETE' }),
    publish: (id: string) =>
        fetchApi<any>(`/api/pages/${id}/publish`, { method: 'PATCH' }),
    archive: (id: string) =>
        fetchApi<any>(`/api/pages/${id}/archive`, { method: 'PATCH' }),
    submitForReview: (id: string) =>
        fetchApi<any>(`/api/pages/${id}/submit-review`, { method: 'PATCH' }),
    approve: (id: string) =>
        fetchApi<any>(`/api/pages/${id}/approve`, { method: 'PATCH' }),
    reject: (id: string) =>
        fetchApi<any>(`/api/pages/${id}/reject`, { method: 'PATCH' }),
    getTrashed: () => fetchApi<any[]>('/api/pages/admin/trashed'),
    restore: (id: string) =>
        fetchApi<any>(`/api/pages/${id}/restore`, { method: 'PATCH' }),
    permanentDelete: (id: string) =>
        fetchApi<any>(`/api/pages/${id}/permanent`, { method: 'DELETE' }),
    duplicate: (id: string) =>
        fetchApi<any>(`/api/pages/${id}/duplicate`, { method: 'POST' }),
};

// ── Modules ──────────────────────────────────────────
export const modulesApi = {
    getByPage: (pageId: string) => fetchApi<any[]>(`/api/modules?pageId=${pageId}`),
    create: (data: any) =>
        fetchApi<any>('/api/modules', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
        fetchApi<any>(`/api/modules/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
        fetchApi<any>(`/api/modules/${id}`, { method: 'DELETE' }),
    reorder: (pageId: string, orderedIds: string[]) =>
        fetchApi<any>(`/api/modules/reorder/${pageId}`, {
            method: 'PATCH',
            body: JSON.stringify({ orderedIds }),
        }),
};



// ── Users ────────────────────────────────────────────
export const usersApi = {
    getAll: () => fetchApi<any[]>('/api/users'),
    getOne: (id: string) => fetchApi<any>(`/api/users/${id}`),
    create: (data: any) =>
        fetchApi<any>('/api/users', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    assignRole: (id: string, role: string) =>
        fetchApi<any>(`/api/users/${id}/roles`, {
            method: 'PATCH',
            body: JSON.stringify({ role }),
        }),
};

// ── Files ────────────────────────────────────────────
export const filesApi = {
    getFileUrl: (moduleId: string) => {
        const cdnBase = typeof window !== 'undefined'
            ? (window as any).__NEXT_PUBLIC_CDN_URL || ''
            : process.env.NEXT_PUBLIC_CDN_URL || '';
        return cdnBase ? `${cdnBase}/files/${moduleId}` : `/api/files/${moduleId}`;
    },
    upload: async (file: File, type: string) => {
        const formData = new FormData();
        formData.append('type', type);
        formData.append('file', file);
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch(`${API_BASE}/api/files/upload`, {
            method: 'POST',
            body: formData,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
    },
};

// ── Suggestions ──────────────────────────────────────────
export const suggestionsApi = {
    getAll: () => fetchApi<any[]>('/api/suggestions'),
    getOne: (id: string) => fetchApi<any>(`/api/suggestions/${id}`),
    create: (data: any) =>
        fetchApi<any>('/api/suggestions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
        fetchApi<any>(`/api/suggestions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
        fetchApi<any>(`/api/suggestions/${id}`, { method: 'DELETE' }),
};

// ── Settings ─────────────────────────────────────────────
export const settingsApi = {
    getAll: () => fetchApi<any[]>('/api/settings'),
    getByKey: (key: string) => fetchApi<any>(`/api/settings/${key}`),
    update: (key: string, value: string) =>
        fetchApi<any>(`/api/settings/${key}`, { method: 'PATCH', body: JSON.stringify({ value }) }),
};

// ── Versions ─────────────────────────────────────────────
export const versionsApi = {
    snapshot: (pageId: string) =>
        fetchApi<any>(`/api/pages/${pageId}/snapshot`, { method: 'POST' }),
    getAll: (pageId: string) => fetchApi<any[]>(`/api/pages/${pageId}/versions`),
    restore: (pageId: string, versionId: string) =>
        fetchApi<any>(`/api/pages/${pageId}/versions/${versionId}/restore`, { method: 'POST' }),
};

// ── Templates ────────────────────────────────────────────
export const templatesApi = {
    getAll: () => fetchApi<any[]>('/api/templates'),
    getOne: (id: string) => fetchApi<any>(`/api/templates/${id}`),
    create: (data: any) =>
        fetchApi<any>('/api/templates', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
        fetchApi<any>(`/api/templates/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
        fetchApi<any>(`/api/templates/${id}`, { method: 'DELETE' }),
};

// ── Activity ─────────────────────────────────────────────
export const activityApi = {
    getAll: (params?: { userId?: string; entityType?: string; limit?: number }) => {
        const qs = new URLSearchParams();
        if (params?.userId) qs.set('userId', params.userId);
        if (params?.entityType) qs.set('entityType', params.entityType);
        if (params?.limit) qs.set('limit', String(params.limit));
        return fetchApi<any[]>(`/api/activity?${qs.toString()}`);
    },
};

// ── Public API (no auth needed) ──────────────────────────
export const publicApi = {
    getPublishedPages: () => fetchApi<any[]>('/api/public/pages'),
    getRecentPages: () => fetchApi<any[]>('/api/public/pages/recent'),
    search: (q: string) => fetchApi<any[]>(`/api/public/search?q=${encodeURIComponent(q)}`),
    health: () => fetchApi<any>('/api/health'),
};
