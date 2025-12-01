const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Path ke database SQLite
const DB_PATH = path.join(__dirname, '../../sop_v3_hybrid.db');

console.log('Checking SQLite database structure...');
console.log('Database path:', DB_PATH);

// Buat koneksi ke database
const db = new sqlite3.Database(DB_PATH);

// 1. Cek semua tabel
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
  if (err) {
    console.error('Error getting tables:', err);
    process.exit(1);
  }

  console.log('\n=== TABLES IN DATABASE ===');
  tables.forEach(table => {
    console.log(`- ${table.name}`);
  });

  // 2. Cek struktur tabel SOP (jika ada)
  const sopTable = tables.find(t => t.name.toLowerCase().includes('sop'));
  if (sopTable) {
    console.log(`\n=== STRUCTURE OF TABLE ${sopTable.name} ===`);

    db.all(`PRAGMA table_info(${sopTable.name})`, [], (err, columns) => {
      if (err) {
        console.error('Error getting table structure:', err);
        db.close();
        return;
      }

      console.log('Columns:');
      columns.forEach(col => {
        console.log(`  ${col.name} (${col.type})${col.notnull ? ' NOT NULL' : ''}${col.dflt_value ? ` DEFAULT ${col.dflt_value}` : ''}`);
      });

      // 3. Cek beberapa sample data
      console.log(`\n=== SAMPLE DATA FROM ${sopTable.name} ===`);
      db.all(`SELECT * FROM ${sopTable.name} LIMIT 5`, [], (err, rows) => {
        if (err) {
          console.error('Error getting sample data:', err);
          db.close();
          return;
        }

        console.log('Sample rows:');
        rows.forEach((row, index) => {
          console.log(`\nRow ${index + 1}:`);
          Object.entries(row).forEach(([key, value]) => {
            const displayValue = value && value.length > 50 ? `${value.substring(0, 50)}...` : value;
            console.log(`  ${key}: ${displayValue}`);
          });
        });

        // 4. Count total records
        db.get(`SELECT COUNT(*) as total FROM ${sopTable.name}`, [], (err, result) => {
          if (!err) {
            console.log(`\nTotal records in ${sopTable.name}: ${result.total}`);
          }
          db.close();
        });
      });
    });
  } else {
    console.log('\nNo SOP table found in database');
    db.close();
  }
});