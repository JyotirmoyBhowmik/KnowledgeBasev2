DO $$
DECLARE
    new_page_id UUID;
    home_section_id UUID;
BEGIN
    SELECT id INTO home_section_id FROM sections WHERE slug = 'home' LIMIT 1;

    IF home_section_id IS NULL THEN
        RAISE NOTICE 'Home section not found. Make sure you seeded the database first.';
        RETURN;
    END IF;

    -- Delete if it already exists to avoid duplicates
    DELETE FROM pages WHERE slug = 'copilot-experience-hub';

    INSERT INTO pages (section_id, title, slug, status, show_author, show_metrics, views) 
    VALUES (home_section_id, 'Microsoft 365 Copilot Chat | Experience Hub', 'copilot-experience-hub', 'published', false, false, 0)
    RETURNING id INTO new_page_id;

    INSERT INTO modules (page_id, type, content, "order", metadata)
    VALUES (
        new_page_id, 
        'HTML', 
        '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Microsoft 365 Copilot Chat | Experience Hub</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- Font Awesome for Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; background-color: #F9FAFB; }
        .copilot-gradient-text { background: linear-gradient(90deg, #6366F1, #D946EF, #F43F5E); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .copilot-gradient-bg { background: linear-gradient(135deg, #4F46E5, #9333EA); }
        .nav-item.active { background-color: #EEF2FF; color: #4F46E5; border-left: 4px solid #4F46E5; }
        .chart-container { position: relative; width: 100%; max-width: 600px; margin-left: auto; margin-right: auto; height: 300px; max-height: 400px; }
        @media (min-width: 768px) { .chart-container { height: 350px; } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
    </style>
</head>
<body class="text-slate-800 h-screen overflow-hidden flex flex-col md:flex-row">
    <aside class="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-20">
        <div class="p-6 border-b border-gray-100 flex items-center gap-3">
            <div class="w-8 h-8 rounded-full copilot-gradient-bg flex items-center justify-center text-white font-bold">
                <i class="fa-solid fa-sparkles"></i>
            </div>
            <h1 class="font-bold text-xl tracking-tight">Copilot Chat <br><span class="text-xs font-normal text-gray-500">Experience Hub</span></h1>
        </div>
        <nav class="flex-1 overflow-y-auto py-4 space-y-1">
            <button onclick="navigate(''overview'')" id="nav-overview" class="nav-item active w-full text-left px-6 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3">
                <i class="fa-solid fa-house w-5 text-center"></i> Overview
            </button>
            <button onclick="navigate(''access'')" id="nav-access" class="nav-item w-full text-left px-6 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3">
                <i class="fa-solid fa-location-dot w-5 text-center"></i> Where to Find It
            </button>
            <button onclick="navigate(''capabilities'')" id="nav-capabilities" class="nav-item w-full text-left px-6 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3">
                <i class="fa-solid fa-layer-group w-5 text-center"></i> Capabilities
            </button>
            <button onclick="navigate(''agents'')" id="nav-agents" class="nav-item w-full text-left px-6 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3">
                <i class="fa-solid fa-robot w-5 text-center"></i> Agents
            </button>
            <button onclick="navigate(''adoption'')" id="nav-adoption" class="nav-item w-full text-left px-6 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3">
                <i class="fa-solid fa-flag-checkered w-5 text-center"></i> Adoption Kit
            </button>
        </nav>
        <div class="p-4 border-t border-gray-100">
            <div class="bg-indigo-50 rounded-lg p-4">
                <p class="text-xs text-indigo-800 font-semibold mb-1">Expert Tip</p>
                <p class="text-xs text-indigo-600">Use "/" in chat to reference files, people, and meetings instantly.</p>
            </div>
        </div>
    </aside>
    <main class="flex-1 overflow-y-auto bg-gray-50 relative" id="main-content"></main>
    <script>
        const state = { currentView: ''overview'', selectedApp: ''word'', selectedAgentCat: ''all'' };
        const data = {
            benefits: {
                labels: [''Inspiring Creativity'', ''Boosting Productivity'', ''Enabling Focus'', ''Enterprise Security''],
                data: [90, 95, 85, 100],
                descriptions: [
                    "Insights and suggestions to think outside the box.",
                    "Accomplish more in less time by reasoning alongside AI.",
                    "Handle routine tasks so you can focus on what matters.",
                    "Enterprise Data Protection with limited work data access."
                ]
            },
            platforms: [
                { id: ''desktop'', icon: ''fa-desktop'', title: ''Windows & Mac'', desc: ''<b>Windows:</b> Taskbar or Win+C.<br><b>Mac:</b> Dock or Option+Spacebar.'', color: ''bg-blue-100 text-blue-600'' },
                { id: ''web'', icon: ''fa-globe'', title: ''Web Access'', desc: ''Secure AI chat grounded in web data.<br><i>m365.cloud.microsoft/chat</i>'', color: ''bg-purple-100 text-purple-600'' },
                { id: ''mobile'', icon: ''fa-mobile-screen'', title: ''Mobile App'', desc: ''Access Copilot Chat on the go.<br>Sign in with work account.'', color: ''bg-green-100 text-green-600'' },
                { id: ''teams'', icon: ''fa-people-group'', title: ''Teams & Outlook'', desc: ''Found in the App selection bar.<br>Unified chat history.'', color: ''bg-indigo-100 text-indigo-600'' }
            ],
            apps: {
                word: { name: ''Word'', icon: ''fa-file-word'', color: ''text-blue-700'', desc: ''Create impressive documents and improve writing.'', features: [''Drafting content'', ''Summarizing text'', ''Rewriting for tone''] },
                ppt: { name: ''PowerPoint'', icon: ''fa-file-powerpoint'', color: ''text-orange-600'', desc: ''Create polished presentations that stand out.'', features: [''Create slide notes'', ''Summarize decks'', ''Make decks concise''] },
                excel: { name: ''Excel'', icon: ''fa-file-excel'', color: ''text-green-700'', desc: ''Simplify complex data and create spreadsheets.'', features: [''Analyze trends'', ''Create charts'', ''Formula assistance''] },
                outlook: { name: ''Outlook'', icon: ''fa-envelope'', color: ''text-blue-500'', desc: ''Manage email, calendar, tasks together.'', features: [''Drafting replies'', ''Summarizing threads'', ''Meeting prep''] },
                teams: { name: ''Teams'', icon: ''fa-users'', color: ''text-indigo-600'', desc: ''Collaborate, chat, and meet.'', features: [''Meeting recaps'', ''Action items'', ''Chat summarization''] },
                onenote: { name: ''OneNote'', icon: ''fa-book'', color: ''text-purple-700'', desc: ''Capture ideas and organize thoughts.'', features: [''Plan events'', ''Summarize notes'', ''Generate to-do lists''] },
                loop: { name: ''Loop'', icon: ''fa-infinity'', color: ''text-cyan-600'', desc: ''Think, plan and create together.'', features: [''Co-creation'', ''Shared workspaces'', ''Live components''] },
                whiteboard: { name: ''Whiteboard'', icon: ''fa-pen-to-square'', color: ''text-blue-400'', desc: ''Visualize ideas and brainstorm.'', features: [''Visual brainstorming'', ''Categorizing ideas'', ''Summarizing board''] }
            },
            agents: [
                { name: ''Prompt Coach'', desc: ''Write and improve your prompts'', type: ''productivity'' },
                { name: ''Idea Coach'', desc: ''Plan and navigate brainstorming'', type: ''creativity'' },
                { name: ''Writing Coach'', desc: ''Take writing to the next level'', type: ''skills'' },
                { name: ''Learning Coach'', desc: ''Unlock potential & learn topics'', type: ''skills'' },
                { name: ''Career Coach'', desc: ''Personalized career advice'', type: ''growth'' },
                { name: ''Customer Insights'', desc: ''Get to know your customers'', type: ''business'' },
                { name: ''Interview Questions'', desc: ''Generate professional questions'', type: ''business'' },
                { name: ''Meeting Coach'', desc: ''Create and run effective meetings'', type: ''productivity'' },
                { name: ''Quiz Tutor'', desc: ''Create engaging quiz questions'', type: ''skills'' },
                { name: ''Scrum Assistant'', desc: ''Supporting the scrum team'', type: ''business'' }
            ]
        };

        function navigate(viewId) {
            state.currentView = viewId;
            document.querySelectorAll(''.nav-item'').forEach(el => el.classList.remove(''active''));
            document.getElementById(`nav-${viewId}`).classList.add(''active'');
            renderMainContent();
        }

        function renderMainContent() {
            const container = document.getElementById(''main-content'');
            container.innerHTML = '''';
            switch(state.currentView) {
                case ''overview'': renderOverview(container); break;
                case ''access'': renderAccess(container); break;
                case ''capabilities'': renderCapabilities(container); break;
                case ''agents'': renderAgents(container); break;
                case ''adoption'': renderAdoption(container); break;
            }
        }

        function renderOverview(container) {
            const html = `
                <div class="max-w-5xl mx-auto p-8">
                    <header class="mb-10 text-center">
                        <h2 class="text-4xl font-extrabold text-slate-900 mb-4">The UI for AI</h2>
                        <p class="text-lg text-slate-600 max-w-2xl mx-auto">
                            Microsoft 365 Copilot Chat is your everyday AI companion, designed to reason over your work data and web data to boost productivity and creativity.
                        </p>
                    </header>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12">
                        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 class="text-xl font-bold mb-2 text-slate-800">Value Proposition</h3>
                            <p class="text-sm text-slate-500 mb-6">Key impact areas for enterprise users.</p>
                            <div class="chart-container"><canvas id="benefitsChart"></canvas></div>
                        </div>
                        <div class="space-y-6">
                            <div class="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                                <div class="flex items-start gap-4">
                                    <div class="bg-indigo-600 text-white p-2 rounded-lg"><i class="fa-solid fa-lock"></i></div>
                                    <div>
                                        <h4 class="font-bold text-indigo-900">Secure AI for Enterprise</h4>
                                        <p class="text-sm text-indigo-700 mt-1">Enterprise Data Protection (EDP) is built-in. Your data is not used to train models, and work data access is limited and secure.</p>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-white p-6 rounded-xl border border-gray-200">
                                <h4 class="font-bold text-slate-800 mb-3">Moving Beyond Basics</h4>
                                <ul class="space-y-3">
                                    <li class="flex items-center gap-3 text-sm text-slate-600"><i class="fa-solid fa-check text-green-500"></i> Grounded in Web & Work Data</li>
                                    <li class="flex items-center gap-3 text-sm text-slate-600"><i class="fa-solid fa-check text-green-500"></i> Integrated into M365 Ecosystem</li>
                                    <li class="flex items-center gap-3 text-sm text-slate-600"><i class="fa-solid fa-check text-green-500"></i> Extensible via Agents</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML = html;
            initBenefitsChart();
        }

        function renderAccess(container) {
            let gridHtml = '''';
            data.platforms.forEach(p => {
                gridHtml += `
                    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-indigo-300 transition-all card-hover group">
                        <div class="w-12 h-12 rounded-full \${p.color} flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                            <i class="fa-solid \${p.icon}"></i>
                        </div>
                        <h3 class="text-lg font-bold text-slate-800 mb-2">\${p.title}</h3>
                        <p class="text-sm text-slate-600">\${p.desc}</p>
                    </div>
                `;
            });
            const html = `
                <div class="max-w-6xl mx-auto p-8">
                    <div class="mb-8"><h2 class="text-3xl font-bold text-slate-900">Where to find Copilot</h2><p class="text-slate-500 mt-2">Access your AI companion across all your devices and workflows.</p></div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">\${gridHtml}</div>
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
                        <div class="p-8 md:w-1/3 bg-slate-900 text-white flex flex-col justify-center">
                            <h3 class="text-2xl font-bold mb-4">Mobile Access</h3>
                            <p class="text-slate-300 mb-6">Scan the QR code to download the Microsoft 365 Copilot mobile app. Sign in with your work account.</p>
                            <div class="w-32 h-32 bg-white rounded-lg p-2 mx-auto md:mx-0"><div class="w-full h-full border-2 border-slate-900 flex items-center justify-center bg-slate-100"><i class="fa-solid fa-qrcode text-4xl text-slate-900"></i></div></div>
                            <p class="text-center md:text-left text-xs text-slate-400 mt-2">aka.ms/copilotmobile</p>
                        </div>
                        <div class="p-8 md:w-2/3">
                            <h3 class="text-xl font-bold text-slate-800 mb-4">Microsoft 365 Apps Integration</h3>
                            <p class="text-slate-600 mb-4">Already in Teams or Outlook? You can find Copilot in the app selection bar on the left side.</p>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"><i class="fa-solid fa-envelope text-blue-500 text-xl"></i><div><div class="font-semibold text-sm">Outlook</div><div class="text-xs text-gray-500">Draft & Summarize</div></div></div>
                                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"><i class="fa-solid fa-users text-indigo-500 text-xl"></i><div><div class="font-semibold text-sm">Teams</div><div class="text-xs text-gray-500">Chat & Meetings</div></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML = html;
        }

        function renderCapabilities(container) {
            const html = `
                <div class="max-w-6xl mx-auto p-8 h-full flex flex-col">
                    <header class="mb-6"><h2 class="text-3xl font-bold text-slate-900">Advanced Capabilities</h2><p class="text-slate-500">Maximize your chat experience with these powerful features.</p></header>
                    <div class="flex border-b border-gray-200 mb-6">
                        <button onclick="switchCapTab(''pages'')" id="tab-pages" class="cap-tab px-6 py-3 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600 focus:outline-none">Copilot Pages</button>
                        <button onclick="switchCapTab(''create'')" id="tab-create" class="cap-tab px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none">Copilot Create</button>
                        <button onclick="switchCapTab(''apps'')" id="tab-apps" class="cap-tab px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none">Chat in Apps</button>
                    </div>
                    <div id="cap-content" class="flex-1 overflow-y-auto"></div>
                </div>
            `;
            container.innerHTML = html;
            renderPagesTab();
        }

        function renderAgents(container) {
            let agentsHtml = '''';
            data.agents.forEach(agent => {
                let badgeColor = ''bg-gray-100 text-gray-800'';
                if(agent.type === ''productivity'') badgeColor = ''bg-blue-100 text-blue-800'';
                if(agent.type === ''creativity'') badgeColor = ''bg-purple-100 text-purple-800'';
                if(agent.type === ''business'') badgeColor = ''bg-green-100 text-green-800'';
                agentsHtml += `
                    <div class="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                        <div class="flex justify-between items-start mb-2">
                            <div class="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600"><i class="fa-solid fa-robot"></i></div>
                            <span class="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide \${badgeColor}">\${agent.type}</span>
                        </div>
                        <h4 class="font-bold text-slate-800 text-sm mb-1">\${agent.name}</h4>
                        <p class="text-xs text-slate-500">\${agent.desc}</p>
                    </div>
                `;
            });
            const html = `
                <div class="max-w-6xl mx-auto p-8">
                    <div class="mb-8"><h2 class="text-3xl font-bold text-slate-900">Agents in Copilot Chat</h2><p class="text-slate-500 mt-2">Personalize and extend intelligence for your daily work.</p></div>
                    <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mb-10">
                        <h3 class="text-lg font-bold text-slate-800 mb-6">The Spectrum of Agents</h3>
                        <div class="flex flex-col md:flex-row items-center justify-between relative gap-4">
                            <div class="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-indigo-200 -z-0"></div>
                            <div class="relative z-10 bg-white p-4 rounded-xl border-2 border-blue-200 w-full md:w-1/3 text-center card-hover">
                                <div class="w-12 h-12 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl mb-3"><i class="fa-regular fa-comment-dots"></i></div>
                                <h4 class="font-bold text-slate-800">Retrieval</h4><p class="text-xs text-slate-500 mt-2">Retrieve info from grounding data, reason, summarize, and answer questions.</p>
                            </div>
                            <div class="relative z-10 bg-white p-4 rounded-xl border-2 border-purple-200 w-full md:w-1/3 text-center card-hover">
                                <div class="w-12 h-12 mx-auto bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xl mb-3"><i class="fa-solid fa-list-check"></i></div>
                                <h4 class="font-bold text-slate-800">Task</h4><p class="text-xs text-slate-500 mt-2">Take actions when asked, automate workflows, and replace repetitive tasks.</p>
                            </div>
                            <div class="relative z-10 bg-white p-4 rounded-xl border-2 border-indigo-200 w-full md:w-1/3 text-center card-hover">
                                <div class="w-12 h-12 mx-auto bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl mb-3"><i class="fa-solid fa-gears"></i></div>
                                <h4 class="font-bold text-slate-800">Autonomous</h4><p class="text-xs text-slate-500 mt-2">Operate independently, dynamically plan, orchestrate other agents, learn and escalate.</p>
                            </div>
                        </div>
                    </div>
                    <div class="bg-slate-900 text-white p-8 rounded-2xl mb-10 flex flex-col md:flex-row items-center gap-8">
                        <div class="md:w-2/3">
                            <h3 class="text-xl font-bold mb-2">Build Your Own Agent</h3><p class="text-slate-300 text-sm mb-4">Use Agent Builder to create declarative agents with custom instructions, knowledge sources, and capabilities like Code Interpreter or Image Generator.</p>
                            <div class="flex gap-2 flex-wrap"><span class="px-3 py-1 bg-white/10 rounded-full text-xs border border-white/20">Define Purpose</span><span class="px-3 py-1 bg-white/10 rounded-full text-xs border border-white/20">Add Knowledge</span><span class="px-3 py-1 bg-white/10 rounded-full text-xs border border-white/20">Set Capabilities</span></div>
                        </div>
                        <div class="md:w-1/3 flex justify-center"><div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg"><i class="fa-solid fa-hammer"></i></div></div>
                    </div>
                    <h3 class="text-xl font-bold text-slate-800 mb-4">Agent Templates (Out of the Box)</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">\${agentsHtml}</div>
                </div>
            `;
            container.innerHTML = html;
        }

        function renderAdoption(container) {
            const html = `
                <div class="max-w-5xl mx-auto p-8">
                    <header class="mb-10 text-center"><h2 class="text-4xl font-extrabold text-slate-900 mb-4">Adoption & Next Steps</h2><p class="text-lg text-slate-600">Empower your organization to get more from Microsoft 365 Copilot.</p></header>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center text-center h-full">
                            <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-4"><i class="fa-solid fa-trophy"></i></div>
                            <h3 class="font-bold text-lg mb-2">Become a Champion</h3><p class="text-sm text-slate-500 mb-6 flex-1">Expand your knowledge, help others, and enhance your career.</p><button class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 w-full">Join Program</button>
                        </div>
                        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center text-center h-full">
                            <div class="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center text-2xl mb-4"><i class="fa-solid fa-book-open"></i></div>
                            <h3 class="font-bold text-lg mb-2">Success Kit</h3><p class="text-sm text-slate-500 mb-6 flex-1">Admin controls, licensing, training materials, and onboarding templates.</p><button class="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 w-full">Download Kit</button>
                        </div>
                        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center text-center h-full">
                            <div class="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-2xl mb-4"><i class="fa-solid fa-users-viewfinder"></i></div>
                            <h3 class="font-bold text-lg mb-2">Customer Hub</h3><p class="text-sm text-slate-500 mb-6 flex-1">Upcoming sessions, updates, and on-demand content.</p><button class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 w-full">Visit Hub</button>
                        </div>
                    </div>
                    <div class="bg-gray-50 rounded-xl p-8 border border-gray-200 text-center">
                        <h3 class="text-xl font-bold text-slate-800 mb-2">Resources</h3>
                        <div class="flex flex-wrap justify-center gap-4 mt-4">
                            <span class="text-sm text-blue-600 hover:underline cursor-pointer">Implementation Guide</span><span class="text-gray-300">|</span>
                            <span class="text-sm text-blue-600 hover:underline cursor-pointer">User Onboarding Templates</span><span class="text-gray-300">|</span>
                            <span class="text-sm text-blue-600 hover:underline cursor-pointer">Trainer Kit</span><span class="text-gray-300">|</span>
                            <span class="text-sm text-blue-600 hover:underline cursor-pointer">Prompt Do''s & Don''ts</span>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML = html;
        }

        function switchCapTab(tabName) {
            document.querySelectorAll(''.cap-tab'').forEach(el => { el.classList.remove(''text-indigo-600'', ''border-b-2'', ''border-indigo-600''); el.classList.add(''text-gray-500''); });
            const activeTab = document.getElementById(`tab-\${tabName}`);
            activeTab.classList.remove(''text-gray-500''); activeTab.classList.add(''text-indigo-600'', ''border-b-2'', ''border-indigo-600'');
            if(tabName === ''pages'') renderPagesTab();
            if(tabName === ''create'') renderCreateTab();
            if(tabName === ''apps'') renderAppsTab();
        }

        function renderPagesTab() {
            document.getElementById(''cap-content'').innerHTML = `
                <div class="flex flex-col md:flex-row gap-8 items-center bg-white p-8 rounded-xl border border-gray-200 h-full">
                    <div class="md:w-1/2">
                        <span class="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2 block">Dynamic Canvas</span>
                        <h3 class="text-2xl font-bold text-slate-800 mb-4">Copilot Pages</h3>
                        <p class="text-slate-600 mb-6 leading-relaxed">Pages are persistent canvases designed for AI-powered group collaboration. Turn insightful chat responses into editable, shareable pages.</p>
                        <ul class="space-y-4">
                            <li class="flex items-start gap-3"><div class="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5"><i class="fa-solid fa-check text-xs"></i></div><span class="text-sm text-slate-700">Facilitates long-form writing and outlining.</span></li>
                            <li class="flex items-start gap-3"><div class="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5"><i class="fa-solid fa-check text-xs"></i></div><span class="text-sm text-slate-700">Edits are shareable with your team (Loop components).</span></li>
                            <li class="flex items-start gap-3"><div class="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5"><i class="fa-solid fa-check text-xs"></i></div><span class="text-sm text-slate-700">Keep iterating with Copilot side-by-side.</span></li>
                        </ul>
                    </div>
                    <div class="md:w-1/2 bg-gray-50 p-6 rounded-xl border border-gray-200 w-full">
                        <div class="bg-white shadow-lg rounded-lg p-4 border border-gray-100">
                            <div class="flex items-center justify-between mb-4 border-b pb-2">
                                <div class="flex items-center gap-2"><div class="w-4 h-4 bg-purple-500 rounded"></div><span class="text-xs font-bold text-slate-700">Project Plan.loop</span></div>
                                <div class="flex -space-x-2"><div class="w-6 h-6 rounded-full bg-blue-400 border-2 border-white"></div><div class="w-6 h-6 rounded-full bg-green-400 border-2 border-white"></div></div>
                            </div>
                            <div class="space-y-2"><div class="h-2 bg-slate-200 rounded w-3/4"></div><div class="h-2 bg-slate-200 rounded w-full"></div><div class="h-2 bg-slate-200 rounded w-5/6"></div><div class="p-3 bg-indigo-50 rounded text-xs text-indigo-800 mt-4 border border-indigo-100"><i class="fa-solid fa-wand-magic-sparkles mr-1"></i> Copilot generated draft...</div></div>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderCreateTab() {
            document.getElementById(''cap-content'').innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-white p-6 rounded-xl border border-gray-200"><div class="w-12 h-12 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center text-xl mb-4"><i class="fa-solid fa-paintbrush"></i></div><h3 class="text-lg font-bold text-slate-800 mb-2">AI-Powered Creation</h3><p class="text-sm text-slate-600 mb-4">Design visual artifacts grounded in the Microsoft Graph.</p><div class="flex flex-wrap gap-2"><span class="px-2 py-1 bg-gray-100 rounded text-xs">Create an image</span><span class="px-2 py-1 bg-gray-100 rounded text-xs">Design a poster</span><span class="px-2 py-1 bg-gray-100 rounded text-xs">Create an infographic</span></div></div>
                    <div class="bg-white p-6 rounded-xl border border-gray-200"><div class="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center text-xl mb-4"><i class="fa-solid fa-swatchbook"></i></div><h3 class="text-lg font-bold text-slate-800 mb-2">Company Brand Kit</h3><p class="text-sm text-slate-600 mb-4">Ensure consistency with your logos, color palettes, and fonts.</p><div class="flex gap-2 mt-4"><div class="w-6 h-6 rounded-full bg-blue-600"></div><div class="w-6 h-6 rounded-full bg-slate-800"></div><div class="w-6 h-6 rounded-full bg-green-500"></div></div></div>
                    <div class="bg-white p-6 rounded-xl border border-gray-200 md:col-span-2"><h3 class="text-lg font-bold text-slate-800 mb-2">Full Editing Experience</h3><p class="text-sm text-slate-600">Fine-tune your work with built-in visual editing tools. Edit text, add effects, and make adjustments.</p></div>
                </div>
            `;
        }

        function renderAppsTab() {
            let appListHtml = '''';
            Object.keys(data.apps).forEach(key => {
                const app = data.apps[key];
                appListHtml += `<button onclick="selectApp(''\${key}'')" class="w-full text-left p-3 rounded-lg flex items-center gap-3 hover:bg-gray-100 transition-colors \${state.selectedApp === key ? ''bg-indigo-50 border border-indigo-200'' : ''''}"><i class="fa-solid \${app.icon} \${app.color} w-6 text-center text-lg"></i><span class="text-sm font-semibold text-slate-700">\${app.name}</span></button>`;
            });
            const currentApp = data.apps[state.selectedApp];
            document.getElementById(''cap-content'').innerHTML = `
                <div class="flex flex-col md:flex-row h-[500px] border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <div class="w-full md:w-1/3 border-r border-gray-100 bg-gray-50 p-4 space-y-1 overflow-y-auto"><div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Select App</div>\${appListHtml}</div>
                    <div class="w-full md:w-2/3 p-8 flex flex-col justify-center">
                        <div class="mb-6"><div class="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-4xl mb-4 shadow-sm border border-gray-100"><i class="fa-solid \${currentApp.icon} \${currentApp.color}"></i></div><h3 class="text-3xl font-bold text-slate-900 mb-2">\${currentApp.name}</h3><p class="text-lg text-slate-600">\${currentApp.desc}</p></div>
                        <div class="bg-gray-50 rounded-xl p-6 border border-gray-100"><h4 class="font-bold text-slate-800 mb-4 text-sm uppercase">Key Capabilities</h4><div class="grid grid-cols-1 gap-3">\${currentApp.features.map(f => `<div class="flex items-center gap-3"><div class="w-2 h-2 rounded-full bg-indigo-500"></div><span class="text-slate-700">\${f}</span></div>`).join('''')}</div></div>
                        <div class="mt-6 flex items-center gap-2 text-xs text-slate-400"><i class="fa-solid fa-circle-info"></i><span>Capability depends on license (M365 Copilot vs Copilot Chat)</span></div>
                    </div>
                </div>
            `;
        }

        function selectApp(appKey) { state.selectedApp = appKey; renderAppsTab(); }

        function initBenefitsChart() {
            const ctx = document.getElementById(''benefitsChart'').getContext(''2d'');
            if (window.benefitsChartInstance) window.benefitsChartInstance.destroy();
            window.benefitsChartInstance = new Chart(ctx, {
                type: ''radar'',
                data: { labels: data.benefits.labels, datasets: [{ label: ''Impact Score'', data: data.benefits.data, backgroundColor: ''rgba(79, 70, 229, 0.2)'', borderColor: ''#4F46E5'', pointBackgroundColor: ''#fff'', pointBorderColor: ''#4F46E5'', pointHoverBackgroundColor: ''#4F46E5'', pointHoverBorderColor: ''#fff'', borderWidth: 2 }] },
                options: { responsive: true, maintainAspectRatio: false, scales: { r: { angleLines: { color: ''#e5e7eb'' }, grid: { color: ''#e5e7eb'' }, pointLabels: { font: { size: 12, family: "''Segoe UI'', sans-serif", weight: ''600'' }, color: ''#1e293b'' }, suggestedMin: 0, suggestedMax: 100, ticks: { display: false } } }, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(context) { return data.benefits.descriptions[context.dataIndex]; } }, backgroundColor: ''#1e293b'', padding: 12, cornerRadius: 8 } } }
            });
        }

        document.addEventListener(''DOMContentLoaded'', () => { renderMainContent(); });
    </script>
</body>
</html>',
        0,
        '{"fullscreen": true}'::jsonb
    );
END $$;
