/**
 * Misses Trollz - one-file offline build.
 *
 * Runs after `vite build` and folds dist/index.html, its CSS and its JS into a
 * single file, dist/MissesTrollz.html. A nurse downloads that one file and
 * double clicks it: it opens in the browser with no install, no server and no
 * internet. The script fails loudly if anything is left pointing at another
 * file, because a file:// page cannot load it.
 */
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(process.argv[2] || 'dist');
const out = path.join(dist, 'MissesTrollz.html');
let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

const read = (ref) => fs.readFileSync(path.join(dist, ref.replace(/^\.?\//, '')), 'utf8');

// Stylesheets become <style>.
html = html.replace(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (_, href) => `<style>${read(href)}</style>`);
// Module preloads are not needed once the code is inline.
html = html.replace(/<link\b[^>]*rel="modulepreload"[^>]*>/g, '');
// The entry module becomes an inline module script at the end of <body>, so
// #root exists when it runs. "</script" inside the code is escaped.
const scripts = [];
html = html.replace(/<script\b[^>]*type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g, (_, src) => {
  scripts.push(read(src).replace(/<\/script/gi, '<\\/script'));
  return '';
});
if (scripts.length !== 1) throw new Error(`expected one entry script, found ${scripts.length}`);
// A replacer function, never a replacement string: minified code is full of
// `$&` and `$'` sequences that a string replacement would expand.
html = html.replace('</body>', () => `<script type="module">${scripts[0]}</script>\n</body>`);

const leftovers = [...html.matchAll(/\s(?:src|href)="(\.?\/[^"#][^"]*|assets\/[^"]*)"/g)].map((m) => m[1]);
if (leftovers.length) throw new Error(`still points at other files: ${leftovers.join(', ')}`);
const chunks = fs.readdirSync(path.join(dist, 'assets')).filter((f) => f.endsWith('.js'));
if (chunks.length !== 1) throw new Error(`expected one JS chunk, found ${chunks.join(', ')}: a split chunk cannot load from file://`);

fs.writeFileSync(out, html);
console.log(`wrote ${path.relative(process.cwd(), out)} (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
