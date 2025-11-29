// Quick stats script
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getStats() {
  console.log('\n📊 Database Statistics:\n');
  
  const totalSOPs = await prisma.sOPDocument.count();
  console.log(`Total SOPs: ${totalSOPs}`);
  
  const byStatus = await prisma.sOPDocument.groupBy({
    by: ['status'],
    _count: true
  });
  
  console.log('\nBy Status:');
  byStatus.forEach(s => {
    console.log(`  ${s.status}: ${s._count}`);
  });
  
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { sopCategories: true }
      }
    }
  });
  
  console.log('\nBy Category:');
  categories.forEach(cat => {
    if (cat._count.sopCategories > 0) {
      console.log(`  ${cat.name}: ${cat._count.sopCategories} SOPs`);
    }
  });
  
  const departments = await prisma.department.findMany({
    include: {
      _count: {
        select: { sopDocuments: true }
      }
    }
  });
  
  console.log('\nBy Department:');
  departments.forEach(dept => {
    console.log(`  ${dept.name}: ${dept._count.sopDocuments} SOPs`);
  });
  
  await prisma.$disconnect();
}

getStats().catch(console.error);
