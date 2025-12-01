const fs = require('fs');
const path = require('path');

// Configuration
const BASE_DIR = path.resolve(__dirname, '..');
const SOURCE_DIR = path.resolve(__dirname, '..', '..', 'pdf-sop');
const TARGET_BASE_DIR = path.join(BASE_DIR, 'static', 'sop', 'documents');
const JSON_DATA_PATH = path.join(__dirname, 'extracted-sop-data-v2.json');
const UPDATED_JSON_PATH = path.join(__dirname, 'extracted-sop-data-updated.json');

// Category code to directory mapping
const CATEGORY_MAPPING = {
    'CAT-IT-001': 'it',
    'CAT-ADM-001': 'administrative',
    'CAT-STAT-001': 'statistics',
    'CAT-PUR-001': 'procurement',
    'CAT-ARSIP-001': 'archives',
    'CAT-KEU-001': 'finance',
    'CAT-INV-001': 'inventory',
    'CAT-MONEV-001': 'monitoring',
    'CAT-SDM-001': 'hrm',
    'CAT-001': 'general'
};

// Statistics tracking
const stats = {
    totalFiles: 0,
    movedFiles: 0,
    failedFiles: 0,
    skippedFiles: 0,
    errors: [],
    categoryCounts: {}
};

/**
 * Ensure directory exists, create if it doesn't
 */
function ensureDirectoryExists(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`✓ Created directory: ${dirPath}`);
        }
        return true;
    } catch (error) {
        console.error(`✗ Failed to create directory ${dirPath}:`, error.message);
        return false;
    }
}

/**
 * Move a single file from source to destination
 */
function moveFile(sourcePath, destPath) {
    try {
        // Ensure destination directory exists
        const destDir = path.dirname(destPath);
        if (!ensureDirectoryExists(destDir)) {
            return false;
        }

        // Check if source file exists
        if (!fs.existsSync(sourcePath)) {
            console.log(`⚠ Source file not found: ${sourcePath}`);
            return false;
        }

        // Check if destination file already exists
        if (fs.existsSync(destPath)) {
            console.log(`⚠ Destination file already exists: ${destPath}`);
            return false;
        }

        // Move the file
        fs.renameSync(sourcePath, destPath);
        console.log(`✓ Moved: ${path.basename(sourcePath)} → ${path.relative(TARGET_BASE_DIR, destPath)}`);
        return true;

    } catch (error) {
        console.error(`✗ Failed to move file ${sourcePath}:`, error.message);
        stats.errors.push({
            source: sourcePath,
            destination: destPath,
            error: error.message
        });
        return false;
    }
}

/**
 * Get target directory path for a category code
 */
function getTargetDirectory(categoryCode) {
    const subdir = CATEGORY_MAPPING[categoryCode];
    if (!subdir) {
        console.log(`⚠ Unknown category code: ${categoryCode}, using 'general'`);
        return path.join(TARGET_BASE_DIR, 'general');
    }
    return path.join(TARGET_BASE_DIR, subdir);
}

/**
 * Process SOP data and move files
 */
async function processSOPData() {
    try {
        console.log('🚀 Starting PDF file organization process...\n');
        console.log(`📁 Source directory: ${SOURCE_DIR}`);
        console.log(`📁 Target base directory: ${TARGET_BASE_DIR}\n`);

        // Read JSON data
        if (!fs.existsSync(JSON_DATA_PATH)) {
            throw new Error(`JSON data file not found: ${JSON_DATA_PATH}`);
        }

        const jsonData = JSON.parse(fs.readFileSync(JSON_DATA_PATH, 'utf8'));
        console.log(`📄 Loaded ${jsonData.length} SOP records from JSON file\n`);

        // Process each SOP record
        for (let i = 0; i < jsonData.length; i++) {
            const sop = jsonData[i];
            stats.totalFiles++;

            try {
                // Extract file information
                const sourceFilePath = sop.pdfFilePath;
                if (!sourceFilePath) {
                    console.log(`⚠ Record ${i + 1}: No pdfFilePath found`);
                    stats.skippedFiles++;
                    continue;
                }

                // Handle both relative and absolute paths
                const sourceFileName = path.basename(sourceFilePath);
                const sourceFullPath = path.join(SOURCE_DIR, sourceFileName);

                // Get target directory based on category code
                const categoryCode = sop.categoryCode;
                const targetDir = getTargetDirectory(categoryCode);

                // Track category counts
                const categoryName = path.basename(targetDir);
                stats.categoryCounts[categoryName] = (stats.categoryCounts[categoryName] || 0) + 1;

                // Create target file path
                const targetFilePath = path.join(targetDir, sourceFileName);

                console.log(`[${i + 1}/${jsonData.length}] Processing: ${sourceFileName}`);
                console.log(`  Category: ${categoryCode} → ${categoryName}`);

                // Move the file
                if (moveFile(sourceFullPath, targetFilePath)) {
                    stats.movedFiles++;
                    // Update the PDF path in JSON to reflect new location
                    sop.pdfFilePath = path.relative(path.resolve(__dirname, '..'), targetFilePath);
                } else {
                    stats.failedFiles++;
                }

            } catch (error) {
                console.error(`✗ Error processing record ${i + 1}:`, error.message);
                stats.failedFiles++;
                stats.errors.push({
                    recordIndex: i,
                    sopNumber: sop.sopNumber,
                    error: error.message
                });
            }

            // Add progress indicator every 50 files
            if ((i + 1) % 50 === 0) {
                console.log(`\n📊 Progress: ${i + 1}/${jsonData.length} files processed\n`);
            }
        }

        // Save updated JSON data
        try {
            fs.writeFileSync(UPDATED_JSON_PATH, JSON.stringify(jsonData, null, 2));
            console.log(`\n✅ Updated JSON data saved to: ${UPDATED_JSON_PATH}`);
        } catch (error) {
            console.error(`✗ Failed to save updated JSON:`, error.message);
        }

        // Generate final report
        generateReport();

    } catch (error) {
        console.error('💥 Fatal error during processing:', error.message);
        process.exit(1);
    }
}

/**
 * Generate and display summary report
 */
function generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PDF FILE ORGANIZATION REPORT');
    console.log('='.repeat(60));

    console.log(`\n📁 SUMMARY:`);
    console.log(`   Total SOP records processed: ${stats.totalFiles}`);
    console.log(`   Files successfully moved: ${stats.movedFiles}`);
    console.log(`   Files failed to move: ${stats.failedFiles}`);
    console.log(`   Files skipped: ${stats.skippedFiles}`);

    const successRate = ((stats.movedFiles / stats.totalFiles) * 100).toFixed(1);
    console.log(`   Success rate: ${successRate}%`);

    if (Object.keys(stats.categoryCounts).length > 0) {
        console.log(`\n📂 FILES BY CATEGORY:`);
        Object.entries(stats.categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .forEach(([category, count]) => {
                console.log(`   ${category.padEnd(15)}: ${count} files`);
            });
    }

    if (stats.errors.length > 0) {
        console.log(`\n❌ ERRORS (${stats.errors.length}):`);
        stats.errors.slice(0, 10).forEach((error, index) => {
            console.log(`   ${index + 1}. ${error.error}`);
            if (error.source) console.log(`      Source: ${error.source}`);
            if (error.sopNumber) console.log(`      SOP: ${error.sopNumber}`);
        });

        if (stats.errors.length > 10) {
            console.log(`   ... and ${stats.errors.length - 10} more errors`);
        }
    }

    console.log('\n' + '='.repeat(60));

    if (stats.failedFiles === 0) {
        console.log('🎉 All files processed successfully!');
    } else {
        console.log(`⚠️  ${stats.failedFiles} files encountered issues. Please review the errors above.`);
    }

    console.log('='.repeat(60));
}

// Main execution
if (require.main === module) {
    // Validate directories
    if (!fs.existsSync(SOURCE_DIR)) {
        console.error(`💥 Source directory not found: ${SOURCE_DIR}`);
        process.exit(1);
    }

    if (!fs.existsSync(TARGET_BASE_DIR)) {
        console.error(`💥 Target base directory not found: ${TARGET_BASE_DIR}`);
        process.exit(1);
    }

    // Start processing
    processSOPData()
        .then(() => {
            console.log('\n✨ Process completed!');
            process.exit(stats.failedFiles > 0 ? 1 : 0);
        })
        .catch((error) => {
            console.error('💥 Unhandled error:', error);
            process.exit(1);
        });
}

module.exports = {
    processSOPData,
    CATEGORY_MAPPING,
    moveFile,
    ensureDirectoryExists
};