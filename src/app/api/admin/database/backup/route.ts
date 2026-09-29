import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getTableConfig, type PgTable } from 'drizzle-orm/pg-core';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  users, barbershops, barbershopClosures, barbers, services, bookings, reviews,
  siteSettings, securityLogs, blockedIps, courses, courseVideos, coursePurchases, verificationTokens,
} from '@/lib/db/schema';
import { getClientIp, logSecurityEvent } from '@/lib/security';

// Parents before children so the INSERTs can be replayed in order.
const TABLES: PgTable[] = [
  users, barbershops, barbershopClosures, barbers, services, bookings, reviews,
  siteSettings, securityLogs, blockedIps, courses, courseVideos, coursePurchases, verificationTokens,
];

const quoteIdent = (name: string) => `"${name.replace(/"/g, '""')}"`;
const quoteText = (value: string) => `'${value.replace(/'/g, "''")}'`;

function toSqlLiteral(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Date) return quoteText(value.toISOString());
  if (typeof value === 'object') return `${quoteText(JSON.stringify(value))}::jsonb`;
  return quoteText(String(value));
}

/**
 * Data-only SQL export generated in TypeScript, so it works on Vercel (no
 * pg_dump binary). Replay it into a database created from the Drizzle schema.
 * Dev only: the dump contains password hashes and tokens.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if ((session.user as any).role !== 'dev') {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
  }

  try {
    const timestamp = new Date().toISOString();
    const out: string[] = [
      `-- Orphelia data export, ${timestamp}`,
      '-- Data only. Load into a database whose schema matches src/lib/db/schema.ts.',
      'BEGIN;',
      '',
    ];

    for (const table of TABLES) {
      const { name, columns } = getTableConfig(table);
      let rows: Record<string, unknown>[];
      try {
        rows = (await db.select().from(table)) as Record<string, unknown>[];
      } catch (error) {
        // e.g. a table whose migration has not been run yet
        out.push(`-- ${name}: skipped (${error instanceof Error ? error.message.split('\n')[0] : 'unreadable'})`, '');
        continue;
      }

      out.push(`-- ${name}: ${rows.length} row(s)`);
      if (rows.length > 0) {
        // Drizzle returns rows keyed by the TS property name; map them to column names.
        const tsKeys = Object.keys(table).filter((key) => columns.some((col) => col === (table as any)[key]));
        const columnList = tsKeys.map((key) => quoteIdent((table as any)[key].name)).join(', ');
        for (const row of rows) {
          const values = tsKeys.map((key) => toSqlLiteral(row[key])).join(', ');
          out.push(`INSERT INTO ${quoteIdent(name)} (${columnList}) VALUES (${values}) ON CONFLICT DO NOTHING;`);
        }
      }
      out.push('');
    }

    out.push('COMMIT;', '');

    await logSecurityEvent({
      type: 'data_export',
      userId: (session.user as any).id,
      email: session.user.email,
      ip: getClientIp(request.headers),
      details: 'Export SQL de la base téléchargé',
    });

    const filename = `orphelia-backup-${timestamp.replace(/[:.]/g, '-').slice(0, 19)}.sql`;
    return new NextResponse(out.join('\n'), {
      headers: {
        'Content-Type': 'application/sql; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json({ error: 'Échec de la génération de l’export' }, { status: 500 });
  }
}
