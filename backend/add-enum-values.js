const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addEnumValues() {
  try {
    console.log('Adding new enum values to database...\n');
    
    // Add new UserRole enum values one by one
    try {
      await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPERVISOR'`);
      console.log('✓ Added SUPERVISOR to UserRole');
    } catch (e) {
      console.log('  SUPERVISOR already exists or error:', e.message.substring(0, 100));
    }
    
    try {
      await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PIMPINAN_TINGGI_UTAMA'`);
      console.log('✓ Added PIMPINAN_TINGGI_UTAMA to UserRole');
    } catch (e) {
      console.log('  PIMPINAN_TINGGI_UTAMA already exists or error:', e.message.substring(0, 100));
    }
    
    try {
      await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PIMPINAN_TINGGI_MADYA'`);
      console.log('✓ Added PIMPINAN_TINGGI_MADYA to UserRole');
    } catch (e) {
      console.log('  PIMPINAN_TINGGI_MADYA already exists or error:', e.message.substring(0, 100));
    }
    
    try {
      await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PIMPINAN_TINGGI_PRATAMA'`);
      console.log('✓ Added PIMPINAN_TINGGI_PRATAMA to UserRole');
    } catch (e) {
      console.log('  PIMPINAN_TINGGI_PRATAMA already exists or error:', e.message.substring(0, 100));
    }
    
    try {
      await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'STAFF'`);
      console.log('✓ Added STAFF to UserRole');
    } catch (e) {
      console.log('  STAFF already exists or error:', e.message.substring(0, 100));
    }
    
    console.log('\n✓ Enum values added successfully');
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

addEnumValues();
