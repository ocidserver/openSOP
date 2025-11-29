/**
 * Extract SOP Metadata from SQLite Database
 * Converts sop_v3_hybrid.db data to Prisma seed format
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../sop_v3_hybrid.db');
const outputPath = path.join(__dirname, '../prisma/seed-from-db.js');

console.log('📖 Reading SQLite database:', dbPath);
console.log('');

// Open database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Database opened successfully');
});

// Get all table names
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
  if (err) {
    console.error('❌ Error reading tables:', err.message);
    db.close();
    process.exit(1);
  }

  console.log('\n📊 Tables found:');
  tables.forEach(table => console.log(`   - ${table.name}`));
  console.log('');

  // Read data from each table
  let allData = {
    tables: {},
    metadata: {
      extractedAt: new Date().toISOString(),
      totalTables: tables.length,
      totalRecords: 0
    }
  };

  let processed = 0;

  tables.forEach(table => {
    const tableName = table.name;

    // Get table schema
    db.all(`PRAGMA table_info(${tableName})`, [], (err, columns) => {
      if (err) {
        console.error(`❌ Error reading schema for ${tableName}:`, err.message);
        return;
      }

      console.log(`\n📋 Table: ${tableName}`);
      console.log('   Columns:', columns.map(c => `${c.name} (${c.type})`).join(', '));

      // Get all data
      db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
        if (err) {
          console.error(`❌ Error reading data from ${tableName}:`, err.message);
        } else {
          allData.tables[tableName] = {
            columns: columns,
            rows: rows,
            count: rows.length
          };
          allData.metadata.totalRecords += rows.length;
          console.log(`   Records: ${rows.length}`);

          // Show sample data
          if (rows.length > 0) {
            console.log('   Sample:', JSON.stringify(rows[0], null, 2).substring(0, 200) + '...');
          }
        }

        processed++;

        // When all tables are processed, generate seed file
        if (processed === tables.length) {
          generateSeedFile(allData);
          db.close();
        }
      });
    });
  });
});

function generateSeedFile(data) {
  console.log('\n\n🔧 Generating seed file...');
  console.log(`   Total records: ${data.metadata.totalRecords}`);

  let seedContent = `/**
 * Generated Seed Data from sop_v3_hybrid.db
 * Extracted at: ${data.metadata.extractedAt}
 * Total Tables: ${data.metadata.totalTables}
 * Total Records: ${data.metadata.totalRecords}
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Extracted Data
const extractedData = ${JSON.stringify(data.tables, null, 2)};

async function main() {
  console.log('🌱 Seeding from extracted SOP metadata...');

  // TODO: Map SQLite data to Prisma models
  // The extracted data structure is:
  ${Object.keys(data.tables).map(tableName => `  // - ${tableName}: ${data.tables[tableName].count} records`).join('\n')}

  console.log('');
  console.log('📊 Extracted Data Summary:');
  ${Object.keys(data.tables).map(tableName => `  console.log('   ${tableName}: ${data.tables[tableName].count} records');`).join('\n')}
  console.log('');

  // Example: Create departments from extracted data
  // Adjust mapping based on actual table structure
  
  console.log('⚠️  Manual mapping required!');
  console.log('   Review the extracted data and map to Prisma models');
  console.log('   in backend/prisma/seed.js');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Export for manual inspection
module.exports = { extractedData };
`;

  fs.writeFileSync(outputPath, seedContent, 'utf8');
  console.log(`\n✅ Seed file generated: ${outputPath}`);

  // Also save raw JSON for inspection
  const jsonPath = path.join(__dirname, '../prisma/extracted-data.json');
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Raw data saved: ${jsonPath}`);

  console.log('\n📝 Next steps:');
  console.log('   1. Review extracted-data.json to understand the structure');
  console.log('   2. Map SQLite tables to Prisma models in seed.js');
  console.log('   3. Run: npm run prisma:seed');
  console.log('');
}
