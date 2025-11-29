import dotenv from 'dotenv';
import connectDb from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import EmissionRecord from '../models/EmissionRecord.js';
import Report from '../models/Report.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Cleanup script to remove old/unused files and records
 * Usage: node scripts/cleanup.js [--dry-run] [--older-than-days=30]
 */
const main = async () => {
  try {
    const dryRun = process.argv.includes('--dry-run');
    const olderThanMatch = process.argv.find((arg) => arg.startsWith('--older-than-days='));
    const olderThanDays = olderThanMatch
      ? parseInt(olderThanMatch.split('=')[1], 10)
      : 90;

    if (dryRun) {
      console.log('DRY RUN MODE - No files will be deleted');
    }

    await connectDb();
    console.log(`Cleaning up records older than ${olderThanDays} days...`);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    // Find old emission records with file paths
    const oldRecords = await EmissionRecord.find({
      createdAt: { $lt: cutoffDate },
      rawFilePath: { $exists: true },
    });

    console.log(`Found ${oldRecords.length} old emission records`);

    let deletedFiles = 0;
    let deletedRecords = 0;

    for (const record of oldRecords) {
      if (record.rawFilePath && fs.existsSync(record.rawFilePath)) {
        if (!dryRun) {
          fs.unlinkSync(record.rawFilePath);
        }
        deletedFiles++;
        console.log(`${dryRun ? '[DRY RUN] Would delete' : 'Deleted'}: ${record.rawFilePath}`);
      }

      if (!dryRun) {
        await EmissionRecord.findByIdAndDelete(record._id);
        deletedRecords++;
      }
    }

    // Clean up old draft reports
    const oldDraftReports = await Report.find({
      status: 'draft',
      createdAt: { $lt: cutoffDate },
    });

    if (!dryRun) {
      await Report.deleteMany({
        _id: { $in: oldDraftReports.map((r) => r._id) },
      });
    }

    console.log(`${dryRun ? '[DRY RUN] Would delete' : 'Deleted'} ${oldDraftReports.length} old draft reports`);

    // Clean up uploads directory
    const uploadsDir = path.join(__dirname, '../uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      let deletedUploads = 0;

      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        const fileAge = Date.now() - stats.mtimeMs;
        const fileAgeDays = fileAge / (1000 * 60 * 60 * 24);

        if (fileAgeDays > olderThanDays) {
          if (!dryRun) {
            fs.unlinkSync(filePath);
          }
          deletedUploads++;
        }
      }

      console.log(
        `${dryRun ? '[DRY RUN] Would delete' : 'Deleted'} ${deletedUploads} old upload files`
      );
    }

    console.log('\nCleanup complete!');
    console.log(`  Files deleted: ${deletedFiles}`);
    console.log(`  Records deleted: ${deletedRecords}`);
    console.log(`  Draft reports deleted: ${oldDraftReports.length}`);

    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err.message);
    process.exit(1);
  }
};

main();

