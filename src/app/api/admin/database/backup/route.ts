import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserRole = (session.user as any).role;
    
    // Only dev users can create backups
    if (currentUserRole !== 'dev') {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    // Create backup timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupFilename = `booking-backup-${timestamp}.sql`;
    const backupPath = path.join(process.cwd(), 'backups', backupFilename);

    // Ensure backups directory exists
    const backupsDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    // Get database connection details from environment
    const dbUrl = process.env.POSTGRES_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: 'Database URL not configured' }, { status: 500 });
    }

    // Parse connection details (simplified - in production, use a proper URL parser)
    const urlParts = dbUrl.split('@');
    const authPart = urlParts[0].replace('postgresql://', '');
    const hostPart = urlParts[1];
    const [user, password] = authPart.split(':');
    const [host, dbName] = hostPart.split('/');

    // Create PostgreSQL backup
    const backupCommand = `PGPASSWORD="${password}" pg_dump -h ${host} -U ${user} -d ${dbName} > "${backupPath}"`;
    
    try {
      await execAsync(backupCommand);
    } catch (error) {
      console.error('Backup command failed:', error);
      return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
    }

    // Check if backup file was created
    if (!fs.existsSync(backupPath)) {
      return NextResponse.json({ error: 'Backup file was not created' }, { status: 500 });
    }

    // Read the backup file
    const backupData = fs.readFileSync(backupPath, 'utf8');

    // Clean up the backup file after reading
    fs.unlinkSync(backupPath);

    // Return the backup as a downloadable file
    return new NextResponse(backupData, {
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="${backupFilename}"`,
      },
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
