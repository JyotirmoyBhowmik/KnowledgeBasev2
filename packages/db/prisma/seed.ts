import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...\n');

    // ═══════════════════════════════════════════════
    // 1. ROLES
    // ═══════════════════════════════════════════════
    const roleNames = ['viewer', 'contributor', 'admin', 'super_admin'];
    for (const name of roleNames) {
        await prisma.role.upsert({ where: { name }, create: { name }, update: {} });
    }
    console.log('✅ Roles: viewer, contributor, admin, super_admin');

    // ═══════════════════════════════════════════════
    // 2. SUPER ADMIN USER
    // ═══════════════════════════════════════════════
    const hash = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@company.com' },
        create: { email: 'admin@company.com', name: 'Super Admin', password_hash: hash, auth_source: 'local' },
        update: {},
    });
    const saRole = await prisma.role.findUnique({ where: { name: 'super_admin' } });
    if (saRole) {
        await prisma.userRole.upsert({
            where: { user_id_role_id: { user_id: admin.id, role_id: saRole.id } },
            create: { user_id: admin.id, role_id: saRole.id },
            update: {},
        });
    }
    console.log('✅ Admin user: admin@company.com / admin123');

    // ═══════════════════════════════════════════════
    // 3. SECTIONS (from SOW)
    // ═══════════════════════════════════════════════
    const secs = [
        { name: 'Home', slug: 'home', order: 0 },
        { name: 'Training', slug: 'training', order: 1 },
        { name: 'Knowledge', slug: 'knowledge', order: 2 },
        { name: 'Adoption', slug: 'adoption', order: 3 },
        { name: 'Contact & Suggest', slug: 'contact-suggest', order: 4 },
    ];
    for (const s of secs) {
        await prisma.section.upsert({ where: { slug: s.slug }, create: s, update: {} });
    }
    const adoption = (await prisma.section.findUnique({ where: { slug: 'adoption' } }))!;
    const training = (await prisma.section.findUnique({ where: { slug: 'training' } }))!;
    const knowledge = (await prisma.section.findUnique({ where: { slug: 'knowledge' } }))!;
    console.log('✅ Sections: Home, Training, Knowledge, Adoption, Contact & Suggest');

    // ═══════════════════════════════════════════════
    // 4. COPILOT ADOPTION PAGES
    // ═══════════════════════════════════════════════

    // Helper
    const upsertPage = async (slug: string, title: string, sectionId: string) => {
        return prisma.page.upsert({
            where: { slug },
            create: { section_id: sectionId, title, slug, status: 'published', created_by_id: admin.id },
            update: {},
        });
    };

    // ── ADOPTION SECTION ────────────────────────────

    // Page 1: Copilot Adoption Roadmap
    const p1 = await upsertPage('copilot-adoption-roadmap', 'Microsoft Copilot Adoption Roadmap for Our Organisation', adoption.id);
    await prisma.module.deleteMany({ where: { page_id: p1.id } });
    await prisma.module.createMany({
        data: [
            { page_id: p1.id, type: 'TEXT', title: 'Phase 1 – Orientation (Weeks 1–2)', order: 0, content: `<ul><li>Mandatory 30-min <em>Getting Started with Copilot Chat</em> for all employees</li><li>Role-specific training sessions (Excel for Finance, PowerPoint for Marketing)</li><li>Weekly Champion "office hours" in Teams</li></ul>` },
            { page_id: p1.id, type: 'TEXT', title: 'Phase 2 – Pilot & Feedback (Weeks 3–6)', order: 1, content: `<ul><li>Identify 30–50 early adopters (Champions)</li><li>Gather feedback through internal form</li><li>Adjust training materials based on real usage</li></ul>` },
            { page_id: p1.id, type: 'TEXT', title: 'Phase 3 – Scale & Measure (Weeks 7–12)', order: 2, content: `<ul><li>Full rollout to 300 users</li><li>Use the Copilot Dashboard to track adoption and usage</li><li>Highlight top 10 success stories in the company newsletter</li></ul>` },
            { page_id: p1.id, type: 'URL', title: 'Copilot Learn Hub (Microsoft Official)', url: 'https://learn.microsoft.com/en-us/copilot', order: 3 },
        ]
    });
    console.log('  📄 Copilot Adoption Roadmap');

    // Page 2: Why Copilot – Business Value and ROI
    const p2 = await upsertPage('why-copilot-business-value', 'Why Copilot? Business Value and ROI', adoption.id);
    await prisma.module.deleteMany({ where: { page_id: p2.id } });
    await prisma.module.createMany({
        data: [
            { page_id: p2.id, type: 'TEXT', title: 'Executive Summary', order: 0, content: `<p>Microsoft Copilot is an AI-powered productivity assistant embedded across Microsoft 365. Early enterprise adopters report <strong>30–50% time savings</strong> on repetitive tasks and a measurable uplift in employee satisfaction.</p><h3>Key ROI Metrics</h3><table style="width:100%;border-collapse:collapse"><tr style="border-bottom:1px solid #334155"><th style="text-align:left;padding:8px">Metric</th><th style="text-align:left;padding:8px">Before Copilot</th><th style="text-align:left;padding:8px">After Copilot</th></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">Email drafting</td><td style="padding:8px">12 min avg</td><td style="padding:8px">4 min avg</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">Meeting recap</td><td style="padding:8px">20 min manual</td><td style="padding:8px">Instant (auto)</td></tr><tr><td style="padding:8px">Data analysis (Excel)</td><td style="padding:8px">45 min</td><td style="padding:8px">4 min</td></tr></table>` },
            { page_id: p2.id, type: 'TEXT', title: 'Projected Outcomes', order: 1, content: `<table style="width:100%;border-collapse:collapse"><tr style="border-bottom:1px solid #334155"><th style="text-align:left;padding:8px">Timeframe</th><th style="text-align:left;padding:8px">Key Metric</th><th style="text-align:left;padding:8px">Expected Result</th></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">Week 4</td><td style="padding:8px">Active Usage</td><td style="padding:8px">40% adoption</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">Week 12</td><td style="padding:8px">Consistent Use</td><td style="padding:8px">85% weekly active users</td></tr><tr><td style="padding:8px">Ongoing</td><td style="padding:8px">Productivity</td><td style="padding:8px">Avg. 45 min/week/user saved</td></tr></table>` },
            { page_id: p2.id, type: 'URL', title: 'Microsoft Copilot ROI Calculator', url: 'https://adoption.microsoft.com/en-us/copilot/', order: 2 },
        ]
    });
    console.log('  📄 Why Copilot – Business Value and ROI');

    // Page 3: Security, Privacy & Responsible AI
    const p3 = await upsertPage('copilot-security-privacy', 'Security, Privacy & Responsible AI with Copilot', adoption.id);
    await prisma.module.deleteMany({ where: { page_id: p3.id } });
    await prisma.module.createMany({
        data: [
            { page_id: p3.id, type: 'TEXT', title: 'Data Security Principles', order: 0, content: `<ul><li>Copilot only accesses data the user already has permission to view</li><li>Content stays within your Microsoft 365 tenant boundary</li><li>No customer data is used to train the underlying LLM</li><li>All prompts and responses are encrypted in transit and at rest</li><li>Full admin audit logs available in Microsoft Purview</li></ul>` },
            { page_id: p3.id, type: 'TEXT', title: 'Responsible AI Guidelines', order: 1, content: `<h3>Our Internal AI Policy</h3><ol><li><strong>Always verify</strong> – Copilot output is a draft, not a final answer</li><li><strong>No sensitive data in prompts</strong> unless context-grounded within M365</li><li><strong>Report hallucinations</strong> – Flag incorrect outputs in the Suggestions module</li><li><strong>Human-in-the-loop</strong> – All published content requires reviewer approval</li></ol>` },
        ]
    });
    console.log('  📄 Security, Privacy & Responsible AI');

    // ── TRAINING SECTION ─────────────────────────────

    // Page 4: Getting Started with Copilot Chat
    const p4 = await upsertPage('copilot-chat-getting-started', 'Getting Started with Microsoft Copilot Chat (30-min)', training.id);
    await prisma.module.deleteMany({ where: { page_id: p4.id } });
    await prisma.module.createMany({
        data: [
            { page_id: p4.id, type: 'TEXT', title: 'Key 2026 Features', order: 0, content: `<ul><li>Personalised context memory and tone adaptation</li><li>Agent Mode for multi-step tasks</li><li>Copilot Pages for persistent collaboration</li><li>Secure grounding in Microsoft 365 data</li><li>Voice and memory continuity</li></ul>` },
            { page_id: p4.id, type: 'TEXT', title: 'Top Daily Prompts', order: 1, content: `<table style="width:100%;border-collapse:collapse"><tr style="border-bottom:1px solid #334155"><th style="text-align:left;padding:8px">Use Case</th><th style="text-align:left;padding:8px">Example Prompt</th><th style="text-align:left;padding:8px">Time Saved</th></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">Catch up on meetings</td><td style="padding:8px">"Recap yesterday's leadership meeting – key decisions and actions"</td><td style="padding:8px">15 min</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">Summarise emails</td><td style="padding:8px">"Summarise this thread into bullet points + action items."</td><td style="padding:8px">10 min</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">Brainstorm ideas</td><td style="padding:8px">"Give me five innovative ways to reduce customer churn."</td><td style="padding:8px">20 min</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">Draft comms</td><td style="padding:8px">"Write a professional message declining the vendor proposal politely."</td><td style="padding:8px">10 min</td></tr><tr><td style="padding:8px">Analyse data</td><td style="padding:8px">"What are the top 3 trends in this spreadsheet?"</td><td style="padding:8px">15 min</td></tr></table>` },
            { page_id: p4.id, type: 'URL', title: 'Microsoft Learn: Copilot Chat in Action (2026)', url: 'https://learn.microsoft.com/en-us/microsoft-365-copilot/microsoft-365-copilot-overview', order: 2 },
        ]
    });
    console.log('  📄 Getting Started with Copilot Chat');

    // Page 5: Copilot in Excel
    const p5 = await upsertPage('copilot-excel-mastery', 'Copilot in Excel Mastery (with Agent Mode)', training.id);
    await prisma.module.deleteMany({ where: { page_id: p5.id } });
    await prisma.module.createMany({
        data: [
            { page_id: p5.id, type: 'TEXT', title: 'Key Highlights', order: 0, content: `<ul><li><strong>Agent Mode</strong> (rolled out Jan 2026) enables multi-step reasoning within the grid</li><li>New <code>=COPILOT()</code> function for smart formula generation</li><li>Works seamlessly with local and cloud workbooks</li></ul>` },
            { page_id: p5.id, type: 'TEXT', title: 'Step-by-Step Modules', order: 1, content: `<ol><li><strong>Preparing Data for Copilot Analysis</strong> – Clean headers, remove merged cells, use Tables</li><li><strong>Asking for Insights: Sample Prompts</strong><br/>"Show the top 5 products by revenue as a bar chart"<br/>"Highlight all cells where growth is negative"</li><li><strong>Creating Charts & Pivot Tables Automatically</strong><br/>"Create a pivot table showing quarterly revenue by region"</li><li><strong>Best Practices & Common Pitfalls</strong><br/>Keep data < 2M rows · Use structured references · Verify formula output</li></ol>` },
            { page_id: p5.id, type: 'TEXT', title: 'Before/After Impact', order: 2, content: `<p><strong>Before:</strong> 45-minute manual data analysis task<br/><strong>After:</strong> Completed in 4 minutes with Copilot Agent Mode</p>` },
        ]
    });
    console.log('  📄 Copilot in Excel Mastery');

    // Page 6: Copilot in PowerPoint
    const p6 = await upsertPage('copilot-powerpoint', 'Copilot in PowerPoint – From Idea to Deck in Minutes', training.id);
    await prisma.module.deleteMany({ where: { page_id: p6.id } });
    await prisma.module.createMany({
        data: [
            { page_id: p6.id, type: 'TEXT', title: 'Best Practices', order: 0, content: `<ul><li>Begin with approved company templates</li><li>Use Word heading styles for seamless content import</li><li>Let Copilot create the first draft — refine the final 20%</li></ul>` },
            { page_id: p6.id, type: 'TEXT', title: 'Sample Prompt', order: 1, content: `<blockquote style="border-left:3px solid #6366f1;padding:12px 16px;background:#1e293b;border-radius:0 8px 8px 0">"Create a 12-slide presentation on our Q1 results using the corporate brand template. Include charts from the attached Excel file. Audience: Board of Directors. Tone: energetic yet professional."</blockquote>` },
            { page_id: p6.id, type: 'URL', title: 'Learn: Copilot in PowerPoint', url: 'https://support.microsoft.com/en-us/copilot-powerpoint', order: 2 },
        ]
    });
    console.log('  📄 Copilot in PowerPoint');

    // Page 7: Copilot in Word
    const p7 = await upsertPage('copilot-word', 'Copilot in Word – Draft, Summarise, Polish', training.id);
    await prisma.module.deleteMany({ where: { page_id: p7.id } });
    await prisma.module.createMany({
        data: [
            { page_id: p7.id, type: 'TEXT', title: 'Capabilities', order: 0, content: `<ul><li>Draft entire sections with one command</li><li>Summarise and integrate feedback from comments</li><li>Rewrite content in multiple tones (formal, casual, executive)</li><li>Cross-document intelligence — reference other files in your OneDrive</li></ul>` },
            { page_id: p7.id, type: 'TEXT', title: 'Prompt Library (15 Commands)', order: 1, content: `<ol><li>"Draft an executive summary of this document"</li><li>"Rewrite this paragraph in a more formal tone"</li><li>"Summarise this 20-page report in 5 bullet points"</li><li>"Create a table comparing Options A, B, and C"</li><li>"Turn this email thread into a structured memo"</li><li>"Add a conclusion section based on the data above"</li><li>"Simplify this text for a non-technical audience"</li><li>"Translate this section into French"</li><li>"Generate a cover letter template for this job description"</li><li>"List the key action items from these meeting notes"</li><li>"Expand this outline into full paragraphs"</li><li>"Create a FAQ section from the content in this document"</li><li>"Suggest improvements for clarity and readability"</li><li>"Write a professional LinkedIn post based on this article"</li><li>"Create an agenda from these discussion points"</li></ol>` },
        ]
    });
    console.log('  📄 Copilot in Word');

    // Page 8: Role-Based Playbooks
    const p8 = await upsertPage('copilot-role-playbooks', 'Role-Based Copilot Playbooks', training.id);
    await prisma.module.deleteMany({ where: { page_id: p8.id } });
    await prisma.module.createMany({
        data: [
            { page_id: p8.id, type: 'TEXT', title: 'Finance', order: 0, content: `<h3>💰 Finance Team</h3><ul><li>"Analyse variance between budget vs actual for Q4 — highlight top 5 deviations"</li><li>"Create a cash flow forecast table for the next 6 months"</li><li>"Summarise this audit report into findings, risks, and recommendations"</li></ul>` },
            { page_id: p8.id, type: 'TEXT', title: 'HR', order: 1, content: `<h3>👥 HR Team</h3><ul><li>"Draft an offer letter for a Senior Engineer role at Band 7"</li><li>"Summarise employee engagement survey results by department"</li><li>"Create a 90-day onboarding checklist for new hires"</li></ul>` },
            { page_id: p8.id, type: 'TEXT', title: 'Sales', order: 2, content: `<h3>📈 Sales Team</h3><ul><li>"Write a follow-up email for a prospect who attended our webinar"</li><li>"Prepare a competitive analysis slide comparing us vs Competitor X"</li><li>"Summarise this quarter's pipeline — deals at risk and next actions"</li></ul>` },
            { page_id: p8.id, type: 'TEXT', title: 'Operations', order: 3, content: `<h3>⚙️ Operations Team</h3><ul><li>"Create a Gantt chart timeline for the warehouse expansion project"</li><li>"Analyse supplier delivery data and flag late shipments"</li><li>"Draft an SOP for the new inventory management process"</li></ul>` },
            { page_id: p8.id, type: 'TEXT', title: 'IT', order: 4, content: `<h3>💻 IT Team</h3><ul><li>"Write a change request template for production deployments"</li><li>"Summarise this week's incident tickets — patterns and root causes"</li><li>"Create a knowledge base article for the VPN setup procedure"</li></ul>` },
        ]
    });
    console.log('  📄 Role-Based Copilot Playbooks');

    // ── KNOWLEDGE SECTION ────────────────────────────

    // Page 9: Prompt Library
    const p9 = await upsertPage('copilot-prompt-library', 'Copilot Prompt Library (200+ Prompts)', knowledge.id);
    await prisma.module.deleteMany({ where: { page_id: p9.id } });
    await prisma.module.createMany({
        data: [
            { page_id: p9.id, type: 'TEXT', title: 'Overview', order: 0, content: `<p>This library contains <strong>200+ curated prompts</strong> for Microsoft Copilot, organised by application and use case. Updated quarterly.</p><h3>Categories</h3><ul><li><strong>Excel:</strong> Data analysis, formula generation, pivot tables</li><li><strong>Word:</strong> Drafting, summarisation, tone adjustment</li><li><strong>PowerPoint:</strong> Slide creation, design polish, content import</li><li><strong>Teams:</strong> Meeting recap, action items, follow-ups</li><li><strong>Outlook:</strong> Email drafting, thread summary, scheduling</li></ul>` },
            { page_id: p9.id, type: 'TEXT', title: 'Monthly Prompt of the Month – February 2026', order: 1, content: `<div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px"><h4 style="color:#818cf8;margin-top:0">🏆 Prompt of the Month</h4><blockquote style="border-left:3px solid #6366f1;padding:8px 16px;margin:8px 0">"Compare the attached sales data for Q3 and Q4 — show a side-by-side table, highlight the top 3 improvements, and suggest actions for underperforming regions."</blockquote><p style="color:#94a3b8;font-size:14px">Best used in: <strong>Excel + Word</strong> · Average time saved: <strong>35 minutes</strong></p></div>` },
        ]
    });
    console.log('  📄 Copilot Prompt Library');

    // Page 10: Top 20 Use Cases
    const p10 = await upsertPage('copilot-top-use-cases', 'Top 20 Copilot Use Cases & Before/After Examples', knowledge.id);
    await prisma.module.deleteMany({ where: { page_id: p10.id } });
    await prisma.module.createMany({
        data: [
            { page_id: p10.id, type: 'TEXT', title: 'Use Cases 1–10', order: 0, content: `<table style="width:100%;border-collapse:collapse"><tr style="border-bottom:1px solid #334155"><th style="padding:8px">#</th><th style="text-align:left;padding:8px">Use Case</th><th style="text-align:left;padding:8px">App</th><th style="text-align:left;padding:8px">Time Saved</th></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">1</td><td style="padding:8px">Meeting recap with action items</td><td style="padding:8px">Teams</td><td style="padding:8px">20 min</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">2</td><td style="padding:8px">Email thread summary</td><td style="padding:8px">Outlook</td><td style="padding:8px">10 min</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">3</td><td style="padding:8px">First draft from outline</td><td style="padding:8px">Word</td><td style="padding:8px">30 min</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">4</td><td style="padding:8px">Data analysis & charting</td><td style="padding:8px">Excel</td><td style="padding:8px">40 min</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">5</td><td style="padding:8px">Presentation from document</td><td style="padding:8px">PowerPoint</td><td style="padding:8px">25 min</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">6</td><td style="padding:8px">Create project timeline</td><td style="padding:8px">Planner</td><td style="padding:8px">15 min</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">7</td><td style="padding:8px">Competitive analysis</td><td style="padding:8px">Chat</td><td style="padding:8px">20 min</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">8</td><td style="padding:8px">Policy document review</td><td style="padding:8px">Word</td><td style="padding:8px">35 min</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">9</td><td style="padding:8px">Onboarding material</td><td style="padding:8px">Word + PPT</td><td style="padding:8px">45 min</td></tr><tr><td style="padding:8px">10</td><td style="padding:8px">Weekly status report</td><td style="padding:8px">Outlook</td><td style="padding:8px">15 min</td></tr></table>` },
            { page_id: p10.id, type: 'TEXT', title: 'Use Cases 11–20', order: 1, content: `<table style="width:100%;border-collapse:collapse"><tr style="border-bottom:1px solid #334155"><th style="padding:8px">#</th><th style="text-align:left;padding:8px">Use Case</th><th style="text-align:left;padding:8px">App</th><th style="text-align:left;padding:8px">Time Saved</th></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">11</td><td style="padding:8px">Training content creation</td><td style="padding:8px">Word + PPT</td><td style="padding:8px">60 min</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">12</td><td style="padding:8px">Budget variance analysis</td><td style="padding:8px">Excel</td><td style="padding:8px">30 min</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">13</td><td style="padding:8px">Customer feedback summary</td><td style="padding:8px">Forms + Chat</td><td style="padding:8px">25 min</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">14</td><td style="padding:8px">RFP response drafting</td><td style="padding:8px">Word</td><td style="padding:8px">90 min</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">15</td><td style="padding:8px">Incident post-mortem</td><td style="padding:8px">Word</td><td style="padding:8px">20 min</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">16</td><td style="padding:8px">SOP documentation</td><td style="padding:8px">Word</td><td style="padding:8px">40 min</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">17</td><td style="padding:8px">Survey design</td><td style="padding:8px">Forms</td><td style="padding:8px">15 min</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">18</td><td style="padding:8px">Newsletter drafting</td><td style="padding:8px">Outlook</td><td style="padding:8px">20 min</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">19</td><td style="padding:8px">Contract clause review</td><td style="padding:8px">Word</td><td style="padding:8px">30 min</td></tr><tr><td style="padding:8px">20</td><td style="padding:8px">Brainstorm facilitation</td><td style="padding:8px">Whiteboard</td><td style="padding:8px">25 min</td></tr></table>` },
        ]
    });
    console.log('  📄 Top 20 Use Cases');

    // Page 11: Troubleshooting & Limitations
    const p11 = await upsertPage('copilot-troubleshooting', 'Troubleshooting & Limitations (2026 Edition)', knowledge.id);
    await prisma.module.deleteMany({ where: { page_id: p11.id } });
    await prisma.module.createMany({
        data: [
            { page_id: p11.id, type: 'TEXT', title: 'Common Issues & Fixes', order: 0, content: `<table style="width:100%;border-collapse:collapse"><tr style="border-bottom:1px solid #334155"><th style="text-align:left;padding:8px">Issue</th><th style="text-align:left;padding:8px">Cause</th><th style="text-align:left;padding:8px">Fix</th></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">Copilot button greyed out</td><td style="padding:8px">License not assigned</td><td style="padding:8px">Admin → M365 Admin Centre → assign Copilot license</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">"I can't find that data"</td><td style="padding:8px">File not in OneDrive/SharePoint</td><td style="padding:8px">Move file to cloud storage</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">Slow responses</td><td style="padding:8px">Large file, complex prompt</td><td style="padding:8px">Simplify prompt, reduce data range</td></tr><tr><td style="padding:8px">Inaccurate output</td><td style="padding:8px">Ambiguous prompt</td><td style="padding:8px">Be specific, provide context</td></tr></table>` },
            { page_id: p11.id, type: 'TEXT', title: 'Known Limitations (Feb 2026)', order: 1, content: `<ul><li>Max context window: ~128K tokens (varies by app)</li><li>Cannot access files on local drives that are not synced</li><li>Limited support for complex macros in Excel</li><li>PowerPoint: Cannot apply custom animations via prompt</li><li>Real-time co-authoring may delay Copilot responses</li></ul>` },
        ]
    });
    console.log('  📄 Troubleshooting & Limitations');

    // Page 12: Success Stories
    const p12 = await upsertPage('copilot-success-stories', 'Copilot Success Stories from Our Teams', knowledge.id);
    await prisma.module.deleteMany({ where: { page_id: p12.id } });
    await prisma.module.createMany({
        data: [
            { page_id: p12.id, type: 'TEXT', title: 'Champion Leaderboard', order: 0, content: `<div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px"><h3 style="color:#818cf8;margin-top:0">🏆 Top Copilot Champions – February 2026</h3><table style="width:100%;border-collapse:collapse"><tr style="border-bottom:1px solid #334155"><th style="padding:8px">Rank</th><th style="text-align:left;padding:8px">Name</th><th style="text-align:left;padding:8px">Department</th><th style="text-align:left;padding:8px">Hours Saved</th></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px;text-align:center">🥇</td><td style="padding:8px">Priya Sharma</td><td style="padding:8px">Finance</td><td style="padding:8px">12 hrs/month</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px;text-align:center">🥈</td><td style="padding:8px">Mark Chen</td><td style="padding:8px">Sales</td><td style="padding:8px">10 hrs/month</td></tr><tr><td style="padding:8px;text-align:center">🥉</td><td style="padding:8px">Sara Al-Rashid</td><td style="padding:8px">HR</td><td style="padding:8px">8 hrs/month</td></tr></table></div>` },
            { page_id: p12.id, type: 'TEXT', title: 'Finance Team Story', order: 1, content: `<h4>💰 Finance: "From 3 hours to 15 minutes"</h4><p>The Finance team used Copilot in Excel to automate the monthly variance report. What previously required 3 hours of manual data collation, formula checking, and chart creation now takes 15 minutes — including review time.</p><blockquote style="border-left:3px solid #10b981;padding:8px 16px">"Copilot didn't replace my job — it eliminated the parts I dreaded." — <em>Priya Sharma, Senior Financial Analyst</em></blockquote>` },
            { page_id: p12.id, type: 'TEXT', title: 'Feedback Form', order: 2, content: `<p>Share your own Copilot success story or improvement suggestion:</p><p><a href="/sections/contact-suggest" style="color:#818cf8;text-decoration:underline">→ Submit via the Suggestions Module</a></p>` },
        ]
    });
    console.log('  📄 Success Stories');

    // ── ADDITIONAL ADOPTION PAGES ──────────────────

    // Page 13: Enterprise-Grade Enhancements
    const p13 = await upsertPage('copilot-enterprise-enhancements', 'Enterprise-Grade Enhancements for Copilot Adoption', adoption.id);
    await prisma.module.deleteMany({ where: { page_id: p13.id } });
    await prisma.module.createMany({
        data: [
            { page_id: p13.id, type: 'TEXT', title: 'Enhancement Matrix', order: 0, content: `<table style="width:100%;border-collapse:collapse"><tr style="border-bottom:1px solid #334155"><th style="text-align:left;padding:8px">Feature</th><th style="text-align:left;padding:8px">Implementation</th><th style="text-align:left;padding:8px">Benefit</th></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">🏆 Champion Leaderboard</td><td style="padding:8px">Embedded Power BI or table view</td><td style="padding:8px">Gamification boosts adoption</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">📝 Monthly Prompt of the Month</td><td style="padding:8px">Simple TEXT module updated by Super Admin</td><td style="padding:8px">Keeps content dynamic</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">💬 Feedback Form</td><td style="padding:8px">Link to existing Suggestions module</td><td style="padding:8px">Drives continuous improvement</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">📥 Offline Cheat Sheets</td><td style="padding:8px">PDF marked "downloadable without login"</td><td style="padding:8px">Supports field teams</td></tr><tr><td style="padding:8px">🌙 Accessibility (Dark Mode, WCAG)</td><td style="padding:8px">Fully supported in Next.js stack</td><td style="padding:8px">Inclusive and compliant</td></tr></table>` },
            { page_id: p13.id, type: 'TEXT', title: 'How to Enable Each Feature', order: 1, content: `<ol><li><strong>Champion Leaderboard</strong> – Create a TEXT module in the Success Stories page with a monthly-updated table. Alternatively, embed a Power BI iframe.</li><li><strong>Prompt of the Month</strong> – Already implemented in the Prompt Library page. Super Admin updates the featured prompt monthly.</li><li><strong>Feedback Form</strong> – Link directly to <a href="/sections/contact-suggest" style="color:#818cf8">/sections/contact-suggest</a> from any page module.</li><li><strong>Offline Cheat Sheets</strong> – Upload PDFs as modules marked with public visibility. Users download via <code>/api/files/:id</code>.</li><li><strong>Dark Mode</strong> – Already built into the Antigravity frontend. Toggle available in user settings.</li></ol>` },
        ]
    });
    console.log('  📄 Enterprise-Grade Enhancements');

    // Page 14: Implementation Checklist
    const p14 = await upsertPage('copilot-implementation-checklist', 'Copilot KB Implementation Checklist (2–3 Days)', adoption.id);
    await prisma.module.deleteMany({ where: { page_id: p14.id } });
    await prisma.module.createMany({
        data: [
            { page_id: p14.id, type: 'TEXT', title: 'Implementation Steps', order: 0, content: `<ol><li><strong>Create 3 sections</strong> in Admin and define page order (Adoption, Training, Knowledge)</li><li><strong>Bulk-import all 14 sample pages</strong> using the provided seed script or JSON import file</li><li><strong>Upload 8–10 PDFs</strong> and embed 6–8 official Microsoft videos via URL modules</li><li><strong>Restrict visibility:</strong> Adoption (All), Training (Internal only — viewer + contributor)</li><li><strong>Add "Copilot Hub"</strong> as a top-level menu item with sub-navigation</li></ol>` },
            { page_id: p14.id, type: 'TEXT', title: 'Projected Outcomes (Microsoft Benchmarks)', order: 1, content: `<table style="width:100%;border-collapse:collapse"><tr style="border-bottom:1px solid #334155"><th style="text-align:left;padding:8px">Timeframe</th><th style="text-align:left;padding:8px">Key Metric</th><th style="text-align:left;padding:8px">Expected Result</th></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">Week 4</td><td style="padding:8px">Active Usage</td><td style="padding:8px">40% adoption</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">Week 12</td><td style="padding:8px">Consistent Use</td><td style="padding:8px">85% weekly active users</td></tr><tr style="border-bottom:1px solid #334155"><td style="padding:8px">Ongoing</td><td style="padding:8px">Productivity</td><td style="padding:8px">Avg. 45 min/week/user saved</td></tr><tr><td style="padding:8px">ROI Tracking</td><td style="padding:8px">Copilot Dashboard</td><td style="padding:8px">Measurable hours saved, content generated, meetings summarised</td></tr></table><p style="color:#94a3b8;font-size:14px;margin-top:12px">This package incorporates Microsoft's February 2026 Copilot documentation and proven enterprise adoption practices.</p>` },
        ]
    });
    console.log('  📄 Implementation Checklist');

    // ═══════════════════════════════════════════════
    // 5. MENUS (with Copilot Hub)
    // ═══════════════════════════════════════════════
    await prisma.menu.deleteMany({});
    const homeMenu = await prisma.menu.create({ data: { label: 'Home', route: '/', order: 0 } });
    const trainingMenu = await prisma.menu.create({ data: { label: 'Training', route: '/sections/training', order: 1 } });
    const knowledgeMenu = await prisma.menu.create({ data: { label: 'Knowledge', route: '/sections/knowledge', order: 2 } });
    const copilotHub = await prisma.menu.create({ data: { label: 'Copilot Hub', route: '/sections/adoption', order: 3 } });

    // Copilot Hub sub-menu
    await prisma.menu.create({ data: { parent_id: copilotHub.id, label: 'Adoption Roadmap', route: '/pages/copilot-adoption-roadmap', order: 0 } });
    await prisma.menu.create({ data: { parent_id: copilotHub.id, label: 'Why Copilot?', route: '/pages/why-copilot-business-value', order: 1 } });
    await prisma.menu.create({ data: { parent_id: copilotHub.id, label: 'Security & Privacy', route: '/pages/copilot-security-privacy', order: 2 } });
    await prisma.menu.create({ data: { parent_id: copilotHub.id, label: 'Enterprise Enhancements', route: '/pages/copilot-enterprise-enhancements', order: 3 } });
    await prisma.menu.create({ data: { parent_id: copilotHub.id, label: 'Implementation Checklist', route: '/pages/copilot-implementation-checklist', order: 4, roles_allowed: ['admin', 'super_admin'] } });

    // Training sub-menu
    await prisma.menu.create({ data: { parent_id: trainingMenu.id, label: 'Copilot Chat', route: '/pages/copilot-chat-getting-started', order: 0, roles_allowed: ['viewer', 'contributor', 'admin', 'super_admin'] } });
    await prisma.menu.create({ data: { parent_id: trainingMenu.id, label: 'Excel Mastery', route: '/pages/copilot-excel-mastery', order: 1, roles_allowed: ['viewer', 'contributor', 'admin', 'super_admin'] } });
    await prisma.menu.create({ data: { parent_id: trainingMenu.id, label: 'PowerPoint', route: '/pages/copilot-powerpoint', order: 2, roles_allowed: ['viewer', 'contributor', 'admin', 'super_admin'] } });
    await prisma.menu.create({ data: { parent_id: trainingMenu.id, label: 'Word', route: '/pages/copilot-word', order: 3, roles_allowed: ['viewer', 'contributor', 'admin', 'super_admin'] } });
    await prisma.menu.create({ data: { parent_id: trainingMenu.id, label: 'Role Playbooks', route: '/pages/copilot-role-playbooks', order: 4, roles_allowed: ['viewer', 'contributor', 'admin', 'super_admin'] } });

    // Knowledge sub-menu
    await prisma.menu.create({ data: { parent_id: knowledgeMenu.id, label: 'Prompt Library', route: '/pages/copilot-prompt-library', order: 0 } });
    await prisma.menu.create({ data: { parent_id: knowledgeMenu.id, label: 'Top 20 Use Cases', route: '/pages/copilot-top-use-cases', order: 1 } });
    await prisma.menu.create({ data: { parent_id: knowledgeMenu.id, label: 'Troubleshooting', route: '/pages/copilot-troubleshooting', order: 2 } });
    await prisma.menu.create({ data: { parent_id: knowledgeMenu.id, label: 'Success Stories', route: '/pages/copilot-success-stories', order: 3, roles_allowed: ['viewer', 'contributor', 'admin', 'super_admin'] } });

    await prisma.menu.create({ data: { label: 'Contact & Suggest', route: '/sections/contact-suggest', order: 4 } });
    console.log('✅ Menus created (Copilot Hub + Training + Knowledge sub-menus)');

    // ═══════════════════════════════════════════════
    console.log('\n🎉 Database seeded successfully!');
    console.log('   Login: admin@company.com / admin123');
    console.log('   14 Copilot Adoption pages with rich content modules');
    console.log('   Hierarchical menus: Copilot Hub, Training, Knowledge sub-menus');
}

main()
    .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
    .finally(() => prisma.$disconnect());
