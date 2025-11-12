const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEnums() {
  try {
    console.log('Checking for records with old enum values...\n');
    
    // Check SOPs with old status values
    const oldStatusQuery = await prisma.$queryRaw`
      SELECT id, sop_number, status 
      FROM sop_documents 
      WHERE status IN ('IN_REVIEW', 'IN_APPROVAL')
      LIMIT 10
    `;
    console.log('SOPs with old status values:', oldStatusQuery.length);
    if (oldStatusQuery.length > 0) {
      console.log('Sample records:', oldStatusQuery);
    }
    
    // Check users with old role values
    const oldRoleQuery = await prisma.$queryRaw`
      SELECT id, username, role 
      FROM "User" 
      WHERE role IN ('MANAGER', 'REVIEWER')
      LIMIT 10
    `;
    console.log('\nUsers with old role values:', oldRoleQuery.length);
    if (oldRoleQuery.length > 0) {
      console.log('Sample records:', oldRoleQuery);
    }
    
    console.log('\n✓ Check complete');
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkEnums();
