import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(repo, 'dist-edgeone');
const manifest = JSON.parse(await readFile(path.join(repo, 'preview/v3/ASSET-MANIFEST.json'), 'utf8'));
const runtime = new Set(['index.html', 'styles.css', 'app.js', 'data.js', 'content.js', 'media.js']);
const copies = new Map();
const maxFileBytes = 25_000_000;
const maxFiles = 20_000;

// Validate the reviewed snapshot before replacing the generated directory.
for (const entry of manifest.files) {
  const sourcePath = path.resolve(repo, entry.path);
  if (!sourcePath.startsWith(repo) || /[\\:*?"<>|]/u.test(entry.path)) {
    throw new Error(`Unsupported asset path: ${entry.path}`);
  }
  const bytes = await readFile(sourcePath);
  const blobHash = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  if (bytes.length !== entry.bytes || blobHash !== entry.gitBlobSha1) {
    throw new Error(`Asset changed: ${entry.path}. Update ASSET-MANIFEST.json after reviewing the new source.`);
  }
  if (bytes.length > maxFileBytes) throw new Error(`Asset exceeds 25 MB: ${entry.path}`);
  copies.set(entry.path, sourcePath);

  // Keep original asset paths, plus page-relative assets for the new domain root.
  // At an origin root, the app's existing ../../ base resolves to that same root.
  if (entry.path.startsWith('preview/v3/')) {
    const relativePath = entry.path.slice('preview/v3/'.length);
    if (runtime.has(relativePath) || relativePath.startsWith('assets/')) {
      copies.set(relativePath, sourcePath);
    }
  }
}
for (const name of runtime) {
  if (!copies.has(name)) throw new Error(`Missing runtime file: ${name}`);
}
if (copies.size > maxFiles) throw new Error(`More than ${maxFiles} output files`);

await rm(output, { recursive: true, force: true });
let totalBytes = 0;
for (const [targetPath, sourcePath] of copies) {
  const target = path.join(output, targetPath);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(sourcePath, target);
  totalBytes += (await stat(target)).size;
}
console.log(JSON.stringify({
  sourceVersion: manifest.sourceVersion,
  sourceCommit: manifest.sourceCommit,
  verifiedSourceFiles: manifest.files.length,
  outputFiles: copies.size,
  outputBytes: totalBytes,
  outputDirectory: path.relative(repo, output),
}, null, 2));
