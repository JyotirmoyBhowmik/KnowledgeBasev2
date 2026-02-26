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
    console.log('✅ Sections: Home, Training, Knowledge, Adoption, Contact & Suggest');

    // ═══════════════════════════════════════════════
    // 4. Default Settings
    // ═══════════════════════════════════════════════
    await prisma.setting.upsert({
        where: { key: 'site_brand_icon' },
        create: { key: 'site_brand_icon', value: '🚀' },
        update: {},
    });
    await prisma.setting.upsert({
        where: { key: 'favicon' },
        create: { key: 'favicon', value: 'favicon.ico' },
        update: {},
    });
    console.log('✅ Base settings configured');

    console.log('\n🎉 Database seeded successfully!');
    console.log('   Login: admin@company.com / admin123');
}

main()
    .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
    .finally(() => prisma.$disconnect());
