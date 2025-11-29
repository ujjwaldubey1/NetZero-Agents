import dotenv from 'dotenv';
import connectDb from '../config/db.js';
import { getOrCreateCurrentReport } from '../services/report.service.js';

dotenv.config();

/**
 * Generate a report for a specific owner and period
 * Usage: node scripts/generateReport.js <ownerId> <period>
 * Example: node scripts/generateReport.js 507f1f77bcf86cd799439011 2025-Q4
 */
const main = async () => {
  try {
    const ownerId = process.argv[2];
    const period = process.argv[3];

    if (!ownerId || !period) {
      console.error('Usage: node scripts/generateReport.js <ownerId> <period>');
      console.error('Example: node scripts/generateReport.js 507f1f77bcf86cd799439011 2025-Q4');
      process.exit(1);
    }

    await connectDb();
    console.log(`Generating report for owner ${ownerId}, period ${period}...`);

    const report = await getOrCreateCurrentReport({ ownerId, period });

    console.log('Report generated successfully:');
    console.log(`  ID: ${report._id}`);
    console.log(`  Period: ${report.period}`);
    console.log(`  Status: ${report.status}`);
    console.log(`  Scope Totals:`, JSON.stringify(report.scopeTotals, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Error generating report:', err.message);
    process.exit(1);
  }
};

main();

