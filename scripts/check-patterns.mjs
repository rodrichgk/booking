#!/usr/bin/env node
/**
 * Guardrail: hard-blocks known-dangerous patterns from re-entering the codebase.
 * Runs in CI (and can be run locally: `npm run guard`). Exits non-zero on any
 * violation so a bad pattern fails the build instead of shipping.
 *
 * Blocks:
 *   1. Debug API endpoints (src/app/api/debug*) — these have historically been
 *      unauthenticated data/credential leaks.
 *   2. Hardcoded shared-secret auth gates (e.g. `secret !== 'debug-2026'`) —
 *      auth must go through the session, not a string baked into source.
 *   3. Committed backup files (*.bak) — dead code belongs in git history, not HEAD.
 */
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', '.vercel', 'coverage', 'dist', 'build']);
const violations = [];

const SECRET_GATE = /\bsecret\b\s*(===|!==)\s*['"][^'"]+['"]/i;

function toPosix(p) {
  return p.split(sep).join('/');
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      walk(full);
    } else {
      checkFile(full);
    }
  }
}

function checkFile(fullPath) {
  const rel = toPosix(relative(ROOT, fullPath));

  if (rel.endsWith('.bak')) {
    violations.push(`Committed backup file (delete it — git remembers): ${rel}`);
    return;
  }

  if (/^src\/app\/api\/debug/i.test(rel)) {
    violations.push(`Debug API endpoint is not allowed: ${rel}`);
    return;
  }

  if (!/\.(ts|tsx|mjs|js|jsx)$/.test(rel)) return;
  // Don't lint this guard script against its own example regex.
  if (rel === 'scripts/check-patterns.mjs') return;

  const content = readFileSync(fullPath, 'utf8');
  if (SECRET_GATE.test(content)) {
    violations.push(`Hardcoded secret auth gate in ${rel} — gate on the session/role, not a baked-in string.`);
  }
}

walk(ROOT);

if (violations.length > 0) {
  console.error('\n[31m✗ Pattern guard failed:[0m');
  for (const v of violations) console.error(`  - ${v}`);
  console.error(`\n${violations.length} violation(s). Fix them or adjust scripts/check-patterns.mjs if intentional.\n`);
  process.exit(1);
}

console.log('[32m✓ Pattern guard passed.[0m');
