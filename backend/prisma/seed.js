const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Departments
  console.log('Creating departments (upsert to avoid duplicates)...');
  const departmentSeed = [
    { code: 'IPDS', name: 'Integrasi Pengolahan dan Diseminasi Statistik', description: 'Divisi IPDS BPS' },
    { code: 'SOSIAL', name: 'Statistik Sosial', description: 'Divisi Statistik Sosial' },
    { code: 'PRODUKSI', name: 'Statistik Produksi', description: 'Divisi Statistik Produksi' },
    { code: 'DISTRIBUSI', name: 'Statistik Distribusi', description: 'Divisi Statistik Distribusi dan Jasa' },
    { code: 'NERWILIS', name: 'Neraca Wilayah dan Analisis Statistik', description: 'Divisi Neraca Wilayah dan Analisis Statistik' }
  ];

  const departments = [];
  for (const d of departmentSeed) {
    const dept = await prisma.department.upsert({
      where: { code: d.code },
      update: {},
      create: d
    });
    departments.push(dept);
  }

  console.log(`✅ Ensured ${departments.length} departments`);

  // Create Categories
  console.log('Creating categories (upsert to avoid duplicates)...');
  const categorySeed = [
    { type: 'PROCESS_TYPE', code: 'PROC_OPERATIONAL', name: 'Prosedur Operasional', description: 'SOP untuk kegiatan operasional harian', color: '#2196F3', icon: 'mdi-cog', order: 1 },
    { type: 'PROCESS_TYPE', code: 'PROC_STRATEGIC', name: 'Prosedur Strategis', description: 'SOP untuk kegiatan strategis organisasi', color: '#9C27B0', icon: 'mdi-strategy', order: 2 },
    { type: 'PROCESS_TYPE', code: 'PROC_SUPPORT', code: 'PROC_SUPPORT', name: 'Prosedur Pendukung', description: 'SOP untuk kegiatan pendukung', color: '#4CAF50', icon: 'mdi-lifebuoy', order: 3 },
    { type: 'SURVEY_TYPE', code: 'SURVEY_SENSUS', name: 'Sensus', description: 'SOP untuk kegiatan sensus', color: '#FF5722', icon: 'mdi-counter', order: 1 },
    { type: 'SURVEY_TYPE', code: 'SURVEY_KHUSUS', name: 'Survei Khusus', description: 'SOP untuk survei khusus', color: '#FF9800', icon: 'mdi-clipboard-text', order: 2 },
    { type: 'COMPLEXITY', code: 'COMPLEXITY_SIMPLE', name: 'Sederhana', description: 'SOP dengan tingkat kesulitan sederhana', color: '#4CAF50', icon: 'mdi-numeric-1-circle', order: 1 },
    { type: 'COMPLEXITY', code: 'COMPLEXITY_MODERATE', name: 'Menengah', description: 'SOP dengan tingkat kesulitan menengah', color: '#FFC107', icon: 'mdi-numeric-2-circle', order: 2 },
    { type: 'COMPLEXITY', code: 'COMPLEXITY_COMPLEX', name: 'Kompleks', description: 'SOP dengan tingkat kesulitan tinggi', color: '#F44336', icon: 'mdi-numeric-3-circle', order: 3 }
  ];

  const categories = [];
  for (const c of categorySeed) {
    const cat = await prisma.category.upsert({
      where: { code: c.code },
      update: {},
      create: c
    });
    categories.push(cat);
  }

  console.log(`✅ Ensured ${categories.length} categories`);

  // Create Admin User
  console.log('Creating admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@bps.go.id',
      password: hashedPassword,
      fullName: 'Administrator System',
      nip: '199001012020121001',
      role: 'ADMIN',
      status: 'ACTIVE',
      departmentId: departments[0].id,
      phoneNumber: '081234567890'
    }
  });

  console.log(`✅ Ensured admin user: ${adminUser.email}`);

  // Create Manager User
  const managerUser = await prisma.user.upsert({
    where: { username: 'manager' },
    update: {},
    create: {
      username: 'manager',
      email: 'manager@bps.go.id',
      password: hashedPassword,
      fullName: 'Manager IPDS',
      nip: '199102022020122002',
      role: 'SUPERVISOR',
      status: 'ACTIVE',
      departmentId: departments[0].id,
      phoneNumber: '081234567891'
    }
  });

  console.log(`✅ Ensured manager user: ${managerUser.email}`);

  // Create Sample SOP
  console.log('Creating sample SOP...');
  const sampleSOP = await prisma.sOPDocument.create({
    data: {
      sopNumber: 'SOP/BPS/2025/001',
      title: 'Prosedur Pengumpulan Data Survei',
      description: 'Standar Operasional Prosedur untuk kegiatan pengumpulan data survei di lapangan',
      purpose: 'Memberikan panduan standar dalam melakukan pengumpulan data survei agar data yang diperoleh akurat dan konsisten',
      scope: 'Berlaku untuk seluruh petugas lapangan BPS dalam kegiatan survei',
      status: 'DRAFT',
      complexity: 'MODERATE',
      departmentId: departments[0].id,
      effectiveDate: new Date('2025-01-01'),
      reviewDate: new Date('2025-12-31'),
      tags: ['survei', 'pengumpulan data', 'lapangan'],
      keywords: ['survei', 'data', 'petugas lapangan', 'kuesioner'],
      versionNumber: 1,
      createdById: adminUser.id
    }
  });

  // Create SOP Version
  const sopVersion = await prisma.sOPVersion.create({
    data: {
      sopId: sampleSOP.id,
      versionNumber: 1,
      majorVersion: 1,
      minorVersion: 0,
      content: JSON.stringify({
        sections: [
          { title: 'Tujuan', content: 'Memberikan panduan standar...' },
          { title: 'Ruang Lingkup', content: 'Berlaku untuk seluruh petugas...' },
          { title: 'Definisi', content: 'Pengertian istilah-istilah...' }
        ]
      }),
      changeLog: 'Initial version',
      changeReason: 'Pembuatan SOP baru',
      isPublished: false,
      createdById: adminUser.id
    }
  });

  // Link current version to SOP
  await prisma.sOPDocument.update({
    where: { id: sampleSOP.id },
    data: { currentVersionId: sopVersion.id }
  });

  // Add categories to SOP
  await prisma.sOPCategory.createMany({
    data: [
      { sopId: sampleSOP.id, categoryId: categories[0].id },
      { sopId: sampleSOP.id, categoryId: categories[3].id },
      { sopId: sampleSOP.id, categoryId: categories[5].id }
    ]
  });

  console.log(`✅ Created sample SOP: ${sampleSOP.sopNumber}`);

  // Create Audit Log
  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entityType: 'SOPDocument',
      entityId: sampleSOP.id,
      sopId: sampleSOP.id,
      userId: adminUser.id,
      description: 'Created new SOP document',
      ipAddress: '127.0.0.1',
      userAgent: 'System/Seed'
    }
  });

  console.log('✅ Created audit log');

  console.log('');
  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📝 Login credentials:');
  console.log('   Admin - email: admin@bps.go.id, password: admin123');
  console.log('   Manager - email: manager@bps.go.id, password: admin123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
