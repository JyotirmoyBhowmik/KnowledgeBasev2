"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { sectionsApi } from "@/lib/api";

export default function PublicSectionDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [section, setSection] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        sectionsApi.getBySlug(slug)
            .then(setSection)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [slug]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-200 bg-white shadow-sm">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg text-white">EK</div>
                    <span className="text-xl font-bold tracking-tight">Enterprise Knowledge Platform</span>
                </Link>
                <Link href="/sections" className="text-blue-600 hover:text-blue-800 text-sm font-medium">← All Sections</Link>
            </nav>

            <main className="max-w-4xl mx-auto px-8 py-16">
                {loading ? (
                    <div className="text-slate-500 text-center py-12">Loading...</div>
                ) : !section ? (
                    <div className="text-center py-16 text-slate-500">Section not found</div>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold mb-2 text-slate-900">{section.name}</h1>
                        <p className="text-slate-600 mb-8">{section.pages?.length || 0} published pages</p>

                        {(section.pages?.length || 0) === 0 ? (
                            <div className="text-center py-16 text-slate-500">No published pages in this section.</div>
                        ) : (
                            <div className="space-y-4">
                                {section.pages.map((page: any) => (
                                    <Link
                                        key={page.id}
                                        href={`/pages/${page.slug}`}
                                        className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-sm transition-all group"
                                    >
                                        <h2 className="text-lg font-semibold group-hover:text-blue-600 text-slate-800 transition-colors">{page.title}</h2>
                                        <p className="text-sm text-slate-500 mt-1">/{page.slug}</p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
