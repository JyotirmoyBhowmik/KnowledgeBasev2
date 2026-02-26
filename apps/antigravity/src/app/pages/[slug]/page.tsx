"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { pagesApi, filesApi } from "@/lib/api";

export default function PublicPageView() {
    const params = useParams();
    const slug = params.slug as string;
    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [modules, setModules] = useState<any[]>([]);

    useEffect(() => {
        pagesApi.getBySlug(slug)
            .then(data => {
                setPage(data);
                setModules(data.modules || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [slug]);

    // Drag and Drop State
    const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIdx(index);
        e.dataTransfer.effectAllowed = "move";
        // Slight visual cue during drag
        setTimeout(() => {
            const ele = document.getElementById(`module-${index}`);
            if (ele) ele.classList.add('opacity-40');
        }, 0);
    };

    const handleDragEnd = (e: React.DragEvent, index: number) => {
        setDraggedIdx(null);
        const ele = document.getElementById(`module-${index}`);
        if (ele) ele.classList.remove('opacity-40');
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIdx === null || draggedIdx === index) return;

        const newModules = [...modules];
        const draggedItem = newModules[draggedIdx];

        newModules.splice(draggedIdx, 1);
        newModules.splice(index, 0, draggedItem);

        setDraggedIdx(index);
        setModules(newModules);
    };

    if (loading) return <div className="min-h-screen bg-slate-50 text-slate-500 flex items-center justify-center">Loading...</div>;
    if (!page) return <div className="min-h-screen bg-slate-50 text-slate-500 flex items-center justify-center">Page not found</div>;

    // Real metrics from page data
    const views = page?.views || 0;
    const likes = page?.likes || 0;
    const dislikes = page?.dislikes || 0;
    const readers = page?.readers || 0;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
            <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-white shadow-sm sticky top-0 z-30">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-xs text-white">KB</div>
                    <span className="text-lg font-bold tracking-tight hidden sm:block text-slate-900">Bites</span>
                </Link>
                <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
                    <Link href="/" className="hover:text-blue-600 underline">Home</Link>
                    <span>/</span>
                    <Link href={`/sections/${page.section?.slug}`} className="hover:text-blue-600 underline">{page.section?.name}</Link>
                    <span>/</span>
                    <span className="text-slate-800 truncate max-w-[150px] sm:max-w-xs">{page.title}</span>
                </div>
            </nav>

            <main className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-8">
                <div className="bg-white border border-slate-200 p-6 md:p-10 rounded-2xl shadow-sm w-full">
                    {/* Compact Top Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight leading-tight">{page.title}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-xs">
                            <span className="text-slate-500 border-r border-slate-200 pr-4">
                                Published: {new Date(page.created_at || Date.now()).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>

                            {/* Extremely compact horizontal stat bar */}
                            {page.show_metrics !== false && (
                                <div className="flex items-center gap-3 font-semibold bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 shadow-inner">
                                    <div className="text-emerald-600 flex items-center gap-1.5" title="Likes"><span>👍</span> {likes}</div>
                                    <div className="w-px h-3 bg-slate-300"></div>
                                    <div className="text-red-600 flex items-center gap-1.5" title="Dislikes"><span>👎</span> {dislikes > 9 ? dislikes : '0' + dislikes}</div>
                                    <div className="w-px h-3 bg-slate-300"></div>
                                    <div className="text-purple-600 flex items-center gap-1.5" title="Views"><span>👁️</span> {views}</div>
                                    <div className="w-px h-3 bg-slate-300"></div>
                                    <div className="text-amber-600 flex items-center gap-1.5" title="Readers"><span>📖</span> {readers}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Draggable Modules */}
                    <div className="space-y-4">
                        {modules.length === 0 ? (
                            <p className="text-slate-500 text-sm italic">No content available for this page.</p>
                        ) : (
                            modules.map((mod: any, i: number) => (
                                <div
                                    key={mod.id}
                                    id={`module-${i}`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, i)}
                                    onDragEnd={(e) => handleDragEnd(e, i)}
                                    onDragOver={(e) => handleDragOver(e, i)}
                                    className="pt-2 pb-4 group border border-transparent hover:border-slate-200 rounded-xl hover:bg-slate-50 px-4 transition-all relative"
                                >
                                    {/* Drag Handle */}
                                    <div
                                        className="absolute left-2 top-4 opacity-0 group-hover:opacity-100 cursor-move text-slate-400 hover:text-blue-500 p-1 bg-white border border-slate-200 rounded shadow-sm z-10"
                                        title="Drag to reorder component"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" /></svg>
                                    </div>

                                    <div className="pl-6 pt-1">
                                        {mod.title && (
                                            <h3 className="text-lg font-bold text-slate-800 mb-2 tracking-tight flex items-center gap-2">
                                                {mod.title}
                                            </h3>
                                        )}
                                        <div className="text-slate-700 text-sm md:text-base leading-relaxed">
                                            {mod.type === "TEXT" && (
                                                <div className="prose prose-sm md:prose-base prose-slate max-w-none prose-a:text-blue-600 hover:prose-a:text-blue-800" dangerouslySetInnerHTML={{ __html: mod.content || "" }} />
                                            )}
                                            {mod.type === "PDF" && (
                                                <div className="w-full mt-4 border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-slate-100 flex flex-col items-center">
                                                    <iframe
                                                        src={`${filesApi.getFileUrl(mod.id)}#toolbar=0&view=FitH`}
                                                        className="w-full min-h-[600px] border-none"
                                                        title={mod.title || "PDF Document"}
                                                    />
                                                    <div className="w-full p-2 bg-slate-50 border-t border-slate-200 text-right">
                                                        <a
                                                            href={filesApi.getFileUrl(mod.id)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-bold uppercase tracking-wider transition-colors"
                                                        >
                                                            📥 Download PDF
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                            {mod.type === "VIDEO" && (
                                                <div className="rounded-lg overflow-hidden shadow-sm border border-slate-200 bg-black">
                                                    <video controls className="w-full max-h-[400px]" src={filesApi.getFileUrl(mod.id)} />
                                                </div>
                                            )}
                                            {mod.type === "URL" && (
                                                <a
                                                    href={mod.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold underline decoration-blue-200 underline-offset-4"
                                                >
                                                    🔗 {mod.url}
                                                </a>
                                            )}
                                            {mod.type === "IMAGE" && (
                                                <div className="rounded-lg overflow-hidden shadow-sm border border-slate-200">
                                                    <img src={filesApi.getFileUrl(mod.id)} alt={mod.title || "Image"} className="w-full max-h-[500px] object-contain bg-slate-100" />
                                                </div>
                                            )}
                                            {mod.type === "CODE" && (
                                                <div className="rounded-lg overflow-hidden shadow-sm border border-slate-200">
                                                    <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{(mod.metadata as any)?.language || "code"}</span>
                                                        <button onClick={() => navigator.clipboard.writeText(mod.content || "").then(() => { const btn = document.activeElement as HTMLButtonElement; btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = 'Copy', 1500); })} className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-slate-700">Copy</button>
                                                    </div>
                                                    <pre className="bg-slate-900 text-green-400 p-4 overflow-x-auto text-sm font-mono leading-relaxed" style={{ tabSize: 4 }}><code>{mod.content}</code></pre>
                                                </div>
                                            )}
                                            {mod.type === "TABLE" && (mod.metadata as any)?.headers && (
                                                <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider">
                                                            <tr>
                                                                {((mod.metadata as any).headers || []).map((h: string, i: number) => (
                                                                    <th key={i} className="px-4 py-3 text-left border-b border-slate-200">{h}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {((mod.metadata as any).rows || []).map((row: string[], ri: number) => (
                                                                <tr key={ri} className="hover:bg-slate-50">
                                                                    {row.map((cell: string, ci: number) => (
                                                                        <td key={ci} className="px-4 py-3 text-slate-700">{cell}</td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                            {mod.type === "EMBED" && (mod.metadata as any)?.embedUrl && (
                                                <div className="rounded-lg overflow-hidden shadow-sm border border-slate-200 bg-slate-100">
                                                    <iframe
                                                        src={(mod.metadata as any).embedUrl}
                                                        className="w-full min-h-[400px] border-none"
                                                        title={mod.title || "Embedded Content"}
                                                        sandbox="allow-scripts allow-same-origin allow-popups"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Small Author Details at the very bottom */}
                    {page.show_author !== false && (
                        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl shadow-inner border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-lg font-black border border-blue-200 shadow-sm shrink-0">
                                    A
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 leading-tight">Admin Team</h3>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Content Creator</p>
                                    <p className="text-xs text-slate-600">Total Articles Written: <strong className="text-slate-800">{page.section?.pages?.length || 14}</strong></p>
                                </div>
                            </div>
                            <button className="px-4 py-2 text-xs font-bold text-blue-600 bg-white border border-blue-200 hover:bg-blue-50 rounded shadow-sm transition-colors uppercase tracking-wide">
                                View All Published Articles
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
