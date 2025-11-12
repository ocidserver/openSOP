const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateEnumValues() {
  try {
    console.log('Starting enum value migration...\n');
    
    // Update MANAGER to SUPERVISOR
    const managersUpdated = await prisma.$executeRaw`
      UPDATE users 
      SET role = 'SUPERVISOR'::text::"UserRole"
      WHERE role = 'MANAGER'::text::"UserRole"
    `;
    console.log(`✓ Updated ${managersUpdated} MANAGER users to SUPERVISOR`);
    
    // Update REVIEWER to STAFF
    const reviewersUpdated = await prisma.$executeRaw`
      UPDATE users 
      SET role = 'STAFF'::text::"UserRole"
      WHERE role = 'REVIEWER'::text::"UserRole"
    `;
    console.log(`✓ Updated ${reviewersUpdated} REVIEWER users to STAFF`);
    
    console.log('\n✓ Enum value migration complete');
    console.log('Now you can run: npx prisma migrate dev\n');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

migrateEnumValues();
