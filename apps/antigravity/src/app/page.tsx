"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { publicApi, sectionsApi, API_BASE } from "@/lib/api";

export default function HomePage() {
  const [recentPages, setRecentPages] = useState<any[]>([]);
  const [sidebarItems, setSidebarItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // New state for section filtering
  const [selectedSection, setSelectedSection] = useState<string>("ALL");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recentPagesData, sectionsTreeData, settingsRes] = await Promise.all([
          publicApi.getRecentPages(),
          sectionsApi.getTree(),
          fetch(`${API_BASE}/api/settings`).then(r => r.json()).catch(() => [])
        ]);

        setRecentPages(Array.isArray(recentPagesData) ? recentPagesData : []);

        const formattedSettings: any = {};
        if (Array.isArray(settingsRes)) {
          settingsRes.forEach((s: any) => { formattedSettings[s.key] = s.value; });
          if (formattedSettings.favicon && formattedSettings.favicon.startsWith('/api')) {
            formattedSettings.favicon = `${API_BASE}${formattedSettings.favicon}`;
          }
        }
        setSiteSettings(formattedSettings);

        const mapSection = (m: any): any => ({
          label: m.name || m.label,
          href: m.route || (m.slug ? `/sections/${m.slug}` : "#"),
          icon: m.icon || "🧠",
          desc: m.children?.length ? `${m.children.length} items` : "",
          children: m.children?.map(mapSection) || []
        });

        const mappedMenus = Array.isArray(sectionsTreeData) ? sectionsTreeData.map(mapSection) : [];
        if (mappedMenus.length === 0) {
          mappedMenus.push({ label: "Admin Portal", href: "/admin", icon: "⚙️", desc: "Configuration" });
        }
        setSidebarItems(mappedMenus);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Live search with debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) { setSearchResults(null); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await publicApi.search(searchQuery);
        setSearchResults(Array.isArray(results) ? results : []);
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter the display pages based on selected section
  const displayPages = (searchResults !== null ? searchResults : recentPages).filter((page: any) => {
    if (selectedSection === "ALL") return true;
    return page.section?.name === selectedSection;
  });

  // Extract unique top-level sections from recent pages for the filter pills
  const availableSections = Array.from(new Set(recentPages.map(p => p.section?.name).filter(Boolean)));

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 overflow-hidden relative">
      {/* Left Panel - Vertical Navigation (Collapsible & Hidden by default) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col shadow-2xl transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="px-6 py-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {siteSettings?.favicon ? (
              <img src={siteSettings.favicon} alt="Logo" className="w-8 h-8 rounded object-contain bg-white" />
            ) : (
              <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center font-bold text-lg">
                KB
              </div>
            )}
            <div className="font-bold text-lg tracking-tight">Menu</div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white p-2 text-xl font-bold">×</button>
        </div>

        <nav className="flex-1 py-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => (
            <div key={item.label}>
              <Link
                href={item.href}
                onClick={() => !item.children?.length && setIsSidebarOpen(false)}
                className="flex items-center gap-4 px-6 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors border-l-4 border-transparent hover:border-blue-500"
              >
                <span className="text-xl opacity-80">{item.icon}</span>
                <div className="flex flex-col">
                  <span className="font-semibold">{item.label}</span>
                  {item.desc && <span className="text-xs font-normal text-slate-500">{item.desc}</span>}
                </div>
              </Link>
              {item.children?.length > 0 && (
                <div className="pl-12 pr-4 py-1 flex flex-col space-y-1 border-l border-slate-700 ml-8 mb-2">
                  {item.children.map((child: any) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className="text-sm font-medium text-slate-400 hover:text-white py-1.5 transition-colors flex items-center gap-3"
                    >
                      <span className="text-base opacity-70">{child.icon}</span>
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Backdrop for click-away when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 md:px-8 shadow-sm justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4 w-1/3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
          </div>

          <div className="hidden sm:flex flex-1 max-w-lg justify-center w-1/3 mx-auto">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Search recent articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 w-1/3">
            <span className="text-sm font-bold text-slate-800 hidden md:block tracking-tight">
              {siteSettings?.site_name || "Knowledge Platform"}
            </span>
            {siteSettings?.favicon ? (
              <img src={siteSettings.favicon} alt="Logo" className="w-8 h-8 rounded-lg object-contain bg-white shadow-sm ring-2 ring-slate-100" />
            ) : (
              <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-blue-100">
                KB
              </div>
            )}
          </div>
        </header>

        {/* Mobile Search Bar */}
        <div className="sm:hidden px-4 py-3 bg-white border-b border-slate-200 shadow-sm z-20 sticky top-16">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search recent articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-8 lg:px-16 xl:px-24 w-full">
          {/* Attractive Hero Area */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-8 md:p-12 mb-10 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 opacity-20 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none"></div>

            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-bold tracking-widest uppercase border border-white/20 mb-4">
                Welcome to your hub
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">Your Knowledge, <span className="text-blue-300">Unified.</span></h1>
              <p className="text-blue-100 max-w-2xl text-sm md:text-base leading-relaxed">
                Explore training paths, insightful adoption guides, and enterprise references to enhance your productivity with our modern platform. Quick links to recent updates are just below.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Recent Published Pages</h2>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <button
                onClick={() => setSelectedSection("ALL")}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border shadow-sm ${selectedSection === "ALL"
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                ALL
              </button>
              {availableSections.map((sec: any) => (
                <button
                  key={sec}
                  onClick={() => setSelectedSection(sec)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border shadow-sm ${selectedSection === sec
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500">
              <span className="animate-spin text-4xl mb-4">⏳</span>
              <span className="text-sm font-semibold">Loading your knowledge base...</span>
            </div>
          ) : displayPages.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-6xl mb-4 opacity-30">📭</div>
              <p className="text-lg font-bold text-slate-700">No published pages found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {displayPages.map((page) => (
                <Link
                  key={page.id}
                  href={`/pages/${page.slug}`}
                  className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full pointer-events-none"></div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-black border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                      📄
                    </div>
                    <span suppressHydrationWarning className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1.5 rounded-md border border-slate-100">
                      {new Date(page.created_at).toLocaleDateString("en-GB", { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-2 leading-tight mb-4 flex-1 relative z-10">
                    {page.title}
                  </h3>
                  <div className="border-t border-slate-100 pt-3 mt-auto flex items-center justify-between relative z-10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded truncate max-w-[100px]">
                      {page.section?.name || 'Knowledge'}
                    </span>
                    <span className="text-xs font-bold text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      READ →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
