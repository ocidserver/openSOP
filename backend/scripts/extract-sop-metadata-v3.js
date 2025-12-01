const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Path ke database SQLite
const DB_PATH = path.join(__dirname, '../../sop_v3_hybrid.db');
const OUTPUT_PATH = path.join(__dirname, 'extracted-sop-data-v2.json');

console.log('Extracting SOP data from SQLite database...');
console.log('Database path:', DB_PATH);

// Buat koneksi ke database
const db = new sqlite3.Database(DB_PATH);

// Query untuk mendapatkan semua data SOP dengan struktur yang benar
const query = `
  SELECT
    id,
    nama_file,
    nomor_sop,
    judul,
    tanggal_pembuatan,
    tanggal_revisi,
    tanggal_efektif,
    pengesahan,
    dasar_hukum,
    kualifikasi_pelaksana,
    keterkaitan,
    peringatan,
    peralatan,
    pencatatan_pendataan,
    judul_tabel,
    extraction_method,
    format_type,
    quality_score,
    validation_status,
    validated_by,
    validated_at,
    is_fully_validated
  FROM sop
  ORDER BY id
`;

db.all(query, [], (err, rows) => {
  if (err) {
    console.error('Error extracting data:', err);
    process.exit(1);
  }

  console.log(`Found ${rows.length} SOP records`);

  // Process data untuk mapping ke field PostgreSQL
  const processedSOPs = rows.map((sop, index) => {
    // Generate SOP number jika tidak ada
    let sopNumber = sop.nomor_sop;
    if (!sopNumber) {
      sopNumber = `SOP/BPS/2025/${String(index + 1).padStart(3, '0')}`;
    }

    // Determine status based on data
    let status = 'ACTIVE'; // Default status since these are approved SOPs
    if (sop.is_fully_validated === 1 && sop.validated_at) {
      status = 'ACTIVE';
    } else {
      status = 'APPROVED';
    }

    // Determine complexity (default to MODERATE for now)
    let complexity = 'MODERATE';
    if (sop.judul) {
      const title = sop.judul.toLowerCase();
      if (title.includes('kompleks') || title.includes('detail')) {
        complexity = 'COMPLEX';
      } else if (title.includes('sederhana') || title.includes('umum')) {
        complexity = 'SIMPLE';
      }
    }

    // Parse legal basis
    let legalBasis = null;
    if (sop.dasar_hukum) {
      try {
        if (typeof sop.dasar_hukum === 'string') {
          // If it's a JSON string, parse it
          if (sop.dasar_hukum.startsWith('[') || sop.dasar_hukum.startsWith('{')) {
            legalBasis = JSON.parse(sop.dasar_hukum).join('\n');
          } else {
            legalBasis = sop.dasar_hukum;
          }
        } else if (Array.isArray(sop.dasar_hukum)) {
          legalBasis = sop.dasar_hukum.join('\n');
        } else {
          legalBasis = String(sop.dasar_hukum);
        }
      } catch (e) {
        legalBasis = String(sop.dasar_hukum);
      }
    }

    // Parse related SOPs
    let references = [];
    if (sop.keterkaitan) {
      try {
        if (typeof sop.keterkaitan === 'string') {
          // Extract SOP numbers from text
          const sopMatches = sop.keterkaitan.match(/SOP-\d+\/\d+\/\d+/g);
          if (sopMatches) {
            references = sopMatches;
          }
        }
      } catch (e) {
        references = [];
      }
    }

    // Generate keywords from title and related SOPs
    const title = sop.judul || '';
    const keywords = [];

    // Extract keywords from title
    const titleWords = title.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    keywords.push(...titleWords);

    // Add category keywords
    if (title.includes('Statistik')) keywords.push('statistik', 'survey');
    if (title.includes('Pengadaan')) keywords.push('procurement', 'pengadaan');
    if (title.includes('Keuangan')) keywords.push('keuangan', 'anggaran');
    if (title.includes('Administrasi')) keywords.push('administrasi', 'surat');
    if (title.includes('IT') || title.includes('Sistem')) keywords.push('it', 'teknologi');
    if (title.includes('Arsip')) keywords.push('arsip', 'kearsipan');
    if (title.includes('Monitoring')) keywords.push('monitoring', 'evaluasi');

    // Determine category based on title and content
    let categoryType = 'DEPARTMENT';
    let categoryName = 'Umum';
    let categoryCode = 'CAT-001';

    const content = `${sop.judul || ''} ${sop.kualifikasi_pelaksana || ''}`.toLowerCase();

    if (content.includes('statistik') || content.includes('survey') || content.includes('susenas') || content.includes('sensus')) {
      categoryType = 'SURVEY_TYPE';
      categoryName = 'Statistik & Survei';
      categoryCode = 'CAT-STAT-001';
    } else if (content.includes('pengadaan') || content.includes('procurement') || content.includes('tender') || content.includes('pemilihan')) {
      categoryType = 'PROCESS_TYPE';
      categoryName = 'Pengadaan Barang/Jasa';
      categoryCode = 'CAT-PUR-001';
    } else if (content.includes('administrasi') || content.includes('surat') || content.includes('naskah') || content.includes('disposisi')) {
      categoryType = 'DEPARTMENT';
      categoryName = 'Administrasi Umum';
      categoryCode = 'CAT-ADM-001';
    } else if (content.includes('it') || content.includes('komputer') || content.includes('sistem') || content.includes('server') || content.includes('jaringan')) {
      categoryType = 'DEPARTMENT';
      categoryName = 'Teknologi Informasi';
      categoryCode = 'CAT-IT-001';
    } else if (content.includes('arsip') || content.includes('kearsipan') || content.includes('dokumen')) {
      categoryType = 'DEPARTMENT';
      categoryName = 'Kearsipan';
      categoryCode = 'CAT-ARSIP-001';
    } else if (content.includes('keuangan') || content.includes('anggaran') || content.includes('pembayaran') || content.includes('spj')) {
      categoryType = 'DEPARTMENT';
      categoryName = 'Keuangan';
      categoryCode = 'CAT-KEU-001';
    } else if (content.includes('persediaan') || content.includes('barang') || content.includes('inventaris')) {
      categoryType = 'DEPARTMENT';
      categoryName = 'Manajemen Persediaan';
      categoryCode = 'CAT-INV-001';
    } else if (content.includes('monitoring') || content.includes('evaluasi') || content.includes('kinerja')) {
      categoryType = 'DEPARTMENT';
      categoryName = 'Monitoring & Evaluasi';
      categoryCode = 'CAT-MONEV-001';
    } else if (content.includes('pegawa') || content.includes('sdm') || content.includes('kompetensi')) {
      categoryType = 'DEPARTMENT';
      categoryName = 'SDM';
      categoryCode = 'CAT-SDM-001';
    }

    // Parse dates
    let effectiveDate = null;
    let createdDate = null;

    if (sop.tanggal_efektif) {
      try {
        // Format Indonesian date: "02 Juni 2025"
        const monthMap = {
          'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
          'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08',
          'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
        };

        const dateStr = sop.tanggal_efektif.replace(/(\d+)\s+(\w+)\s+(\d+)/, (match, day, month, year) => {
          return `${year}-${monthMap[month]}-${day.padStart(2, '0')}`;
        });

        effectiveDate = new Date(dateStr);
      } catch (e) {
        console.warn(`Could not parse effective date for SOP ${sopNumber}: ${sop.tanggal_efektif}`);
      }
    }

    if (sop.tanggal_pembuatan) {
      try {
        const monthMap = {
          'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
          'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08',
          'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
        };

        const dateStr = sop.tanggal_pembuatan.replace(/(\d+)\s+(\w+)\s+(\d+)/, (match, day, month, year) => {
          return `${year}-${monthMap[month]}-${day.padStart(2, '0')}`;
        });

        createdDate = new Date(dateStr);
      } catch (e) {
        console.warn(`Could not parse creation date for SOP ${sopNumber}: ${sop.tanggal_pembuatan}`);
      }
    }

    // Calculate review date (1 year after effective date)
    let reviewDate = null;
    if (effectiveDate) {
      reviewDate = new Date(effectiveDate);
      reviewDate.setFullYear(reviewDate.getFullYear() + 1);
    }

    // Get PDF file path
    let pdfFilePath = null;
    const pdfFileName = sop.nama_file;
    if (pdfFileName) {
      const pdfPath = path.join(__dirname, '../../pdf-sop', pdfFileName);
      if (fs.existsSync(pdfPath)) {
        pdfFilePath = `pdf-sop/${pdfFileName}`;
      }
    }

    // Generate purpose from title
    let purpose = null;
    if (sop.judul) {
      purpose = `SOP ini disusun untuk mengatur prosedur ${sop.judul.toLowerCase()} agar dapat dilaksanakan secara konsisten dan terstandar.`;
    }

    return {
      // Basic SOP Info
      sopNumber: sopNumber,
      title: sop.judul || `SOP ${sopNumber}`,
      description: `Standar Operasional Prosedur untuk ${sop.judul || 'proses bisnis'}`,
      purpose: purpose,
      scope: 'Berlaku untuk seluruh unit kerja di lingkungan BPS Provinsi Bengkulu',
      status: status,
      complexity: complexity,

      // Organization - Default to IPDS
      departmentId: 'dept-001',
      departmentName: 'IPDS (Integrasi Pengolahan dan Diseminasi Data)',

      // Version Control
      versionNumber: 1,

      // Dates
      effectiveDate: effectiveDate,
      reviewDate: reviewDate,
      expiryDate: null,

      // Metadata
      tags: [categoryName, 'BPS Bengkulu'],
      keywords: [...new Set(keywords)], // Remove duplicates
      references: references,
      involvedActorIds: [],

      // Additional Information
      legalBasis: legalBasis,
      executorQualification: sop.kualifikasi_pelaksana || null,
      equipment: sop.peralatan || null,
      warnings: sop.peringatan || null,
      recordKeeping: sop.pencatatan_pendataan || null,

      // File Path
      pdfFilePath: pdfFilePath,

      // Tracking
      viewCount: 0,
      downloadCount: 0,

      // Metadata for seeding
      originalId: sop.id,
      originalFileName: sop.nama_file,
      originalCreatedDate: createdDate,
      originalUpdatedDate: sop.validated_at ? new Date(sop.validated_at) : createdDate,
      qualityScore: sop.quality_score || 100,
      extractionMethod: sop.extraction_method || 'V3 Hybrid',
      formatType: sop.format_type || 'Format A Hybrid',

      // Category mapping
      categoryType: categoryType,
      categoryName: categoryName,
      categoryCode: categoryCode,

      // Approval info
      pengesahan: sop.pengesahan || null,
      validatedBy: sop.validated_by || null,
      validatedAt: sop.validated_at || null,
      isFullyValidated: sop.is_fully_validated || 0
    };
  });

  // Save extracted data
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(processedSOPs, null, 2), 'utf8');

  console.log(`Successfully extracted ${processedSOPs.length} SOP records`);
  console.log(`Data saved to: ${OUTPUT_PATH}`);

  // Create summary statistics
  const summary = {
    totalSOPs: processedSOPs.length,
    statusCounts: {},
    complexityCounts: {},
    categoryCounts: {},
    departmentCounts: {},
    qualityScoreStats: {
      min: Math.min(...processedSOPs.map(s => s.qualityScore || 0)),
      max: Math.max(...processedSOPs.map(s => s.qualityScore || 0)),
      avg: processedSOPs.reduce((sum, s) => sum + (s.qualityScore || 0), 0) / processedSOPs.length
    },
    withPdfFiles: processedSOPs.filter(s => s.pdfFilePath).length
  };

  processedSOPs.forEach(sop => {
    // Count by status
    summary.statusCounts[sop.status] = (summary.statusCounts[sop.status] || 0) + 1;

    // Count by complexity
    summary.complexityCounts[sop.complexity] = (summary.complexityCounts[sop.complexity] || 0) + 1;

    // Count by category
    summary.categoryCounts[sop.categoryName] = (summary.categoryCounts[sop.categoryName] || 0) + 1;

    // Count by department
    summary.departmentCounts[sop.departmentName] = (summary.departmentCounts[sop.departmentName] || 0) + 1;
  });

  console.log('\n=== SOP DATA SUMMARY ===');
  console.log(`Total SOPs: ${summary.totalSOPs}`);
  console.log(`SOPs with PDF files: ${summary.withPdfFiles}`);
  console.log(`Average Quality Score: ${summary.qualityScoreStats.avg.toFixed(2)}`);

  console.log('\nStatus Distribution:');
  Object.entries(summary.statusCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });

  console.log('\nComplexity Distribution:');
  Object.entries(summary.complexityCounts).forEach(([complexity, count]) => {
    console.log(`  ${complexity}: ${count}`);
  });

  console.log('\nCategory Distribution:');
  Object.entries(summary.categoryCounts).forEach(([category, count]) => {
    console.log(`  ${category}: ${count}`);
  });

  // Save summary
  const summaryPath = path.join(__dirname, 'sop-extraction-summary-v2.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
  console.log(`\nSummary saved to: ${summaryPath}`);

  db.close();
});