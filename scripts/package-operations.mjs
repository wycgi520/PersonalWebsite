import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { nodeFileTrace } = require('next/dist/compiled/@vercel/nft');
const { build } = require('esbuild');
const root = process.cwd();
const destination = path.resolve(root, process.argv[2] || '.deploy-bundle');
if (!destination.startsWith(root + path.sep)) throw new Error('Bundle must remain inside workspace');
await fs.mkdir(path.join(destination, 'operations'), {recursive: true});
await build({entryPoints: ['scripts/admin.ts'], bundle: true, platform: 'node', target: 'node24', format: 'cjs',
  outfile: path.join(destination, 'operations/admin.cjs'), external: ['@prisma/client']});
const cli = path.join(path.dirname(require.resolve('prisma/package.json')), 'build/index.js');
const {fileList} = await nodeFileTrace([cli], {base: root, processCwd: root});
for (const file of fileList) {
  const source = path.join(root, file); const target = path.join(destination, file);
  await fs.mkdir(path.dirname(target), {recursive: true});
  // Rebase pnpm links into the bundle; Windows junctions otherwise point to the checkout.
  const stat = await fs.lstat(source);
  if (stat.isSymbolicLink()) {
    const realTarget = await fs.realpath(source);
    if (!realTarget.startsWith(root + path.sep)) throw new Error('Dependency resolves outside workspace');
    const bundledTarget = path.join(destination, path.relative(root, realTarget));
    await fs.mkdir(path.dirname(bundledTarget), {recursive: true});
    const existing = await fs.lstat(target).catch(() => null);
    if (existing?.isSymbolicLink()) await fs.unlink(target);
    if (!existing || existing.isSymbolicLink()) await fs.symlink(path.relative(path.dirname(target), bundledTarget), target, process.platform === 'win32' ? 'junction' : 'dir');
  } else {
    await fs.copyFile(source, target);
  }
}
const engines = path.dirname(require.resolve('@prisma/engines/package.json', {paths: [path.dirname(cli)]}));
await fs.cp(engines, path.join(destination, path.relative(root, engines)), {recursive: true});
await fs.cp('prisma', path.join(destination, 'prisma'), {recursive: true});
await fs.cp('content', path.join(destination, 'content'), {recursive: true});
// Keep CLI invocation independent of the pnpm store hash.
await fs.writeFile(path.join(destination, 'operations/migrate.cjs'), `const {spawnSync} = require('node:child_process');
const path = require('node:path');
const result = spawnSync(process.execPath, [path.resolve(__dirname, '../${path.relative(root, cli).replaceAll('\\', '/')}'), ...process.argv.slice(2)], {stdio: 'inherit'});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
`);
