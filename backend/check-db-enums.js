const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabaseEnums() {
  try {
    console.log('Checking current database enum types...\n');
    
    // Check UserRole enum values
    const userRoles = await prisma.$queryRaw`
      SELECT e.enumlabel 
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname = 'UserRole'
      ORDER BY e.enumsortorder;
    `;
    console.log('Current UserRole enum values:');
    userRoles.forEach(r => console.log('  -', r.enumlabel));
    
    // Check SOPStatus enum values
    const sopStatuses = await prisma.$queryRaw`
      SELECT e.enumlabel 
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname = 'SOPStatus'
      ORDER BY e.enumsortorder;
    `;
    console.log('\nCurrent SOPStatus enum values:');
    sopStatuses.forEach(r => console.log('  -', r.enumlabel));
    
    // Check if there are any SOPs
    const sopCount = await prisma.sOPDocument.count();
    console.log('\nTotal SOPs in database:', sopCount);
    
    // Check if there are any users
    const userCount = await prisma.user.count();
    console.log('Total Users in database:', userCount);
    
    console.log('\n✓ Check complete');
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkDatabaseEnums();
