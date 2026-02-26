"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sectionsApi } from "@/lib/api";

export default function PublicSectionsPage() {
    const [sections, setSections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        sectionsApi.getAll()
            .then((data) => setSections(data.filter((s: any) => s.visible)))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const sectionIcons: Record<string, string> = {
        training: "📚",
        knowledge: "🧠",
        adoption: "🚀",
        "contact-suggest": "💡",
        home: "🏠",
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-200 bg-white shadow-sm">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg text-white">EK</div>
                    <span className="text-xl font-bold tracking-tight">Enterprise Knowledge Platform</span>
                </Link>
            </nav>

            <main className="max-w-5xl mx-auto px-8 py-16">
                <h1 className="text-3xl font-bold mb-2 text-slate-900">Knowledge Base</h1>
                <p className="text-slate-600 mb-10">Browse all available sections and content.</p>

                {loading ? (
                    <div className="text-slate-500 text-center py-12">Loading...</div>
                ) : sections.length === 0 ? (
                    <div className="text-center py-16 text-slate-500">
                        <div className="text-5xl mb-4">📭</div>
                        <p className="text-lg">No published content yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sections.map((section) => (
                            <Link
                                key={section.id}
                                href={`/sections/${section.slug}`}
                                className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-md transition-all group"
                            >
                                <div className="text-3xl mb-3">{sectionIcons[section.slug] || "📂"}</div>
                                <h2 className="text-xl font-semibold group-hover:text-blue-600 transition-colors mb-1 text-slate-800">{section.name}</h2>
                                <p className="text-sm text-slate-500">{section.pages?.length || 0} pages available</p>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
