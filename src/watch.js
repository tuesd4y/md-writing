import path from 'path';
import fs from 'fs';
import { mdToPdf } from 'md-to-pdf';
import chokidar from 'chokidar';

import defaults from './defaults';

let notesDir,
  pdfDir,
  htmlDir,
  style = defaults.style,
  theme,
  notesGlob;

/**
 * Ensure that the directory-part of a filepath exists
 * @param {string} filePath
 */
const ensurePathExists = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Compile a markdown file to html and pdf in the respective directories
 * @param {string} mdFile markdown file that was changed
 */
const compileMd = async (mdFile) => {
  const pdfFile = mdFile.replace(notesDir, pdfDir).replace('.md', '.pdf');
  const htmlFile = mdFile.replace(notesDir, htmlDir).replace('.md', '.html');

  ensurePathExists(pdfFile);
  ensurePathExists(htmlFile);

  // using pandoc instead of md-to-pdf mi

  await mdToPdf({ path: mdFile }, { dest: pdfFile, stylesheet: [style(theme)] });
  await mdToPdf({ path: mdFile }, { dest: htmlFile, stylesheet: [style(theme)], as_html: true });
  console.log(`compiled file to ${pdfFile} / ${htmlFile}`);
};

function setupArgs(args) {
  notesDir = args.notesDir || args.nd || defaults.notesDir;
  notesGlob = args.notesGlob || args.ng || `${notesDir}/**/*.md`;
  pdfDir = args.pdfDir || args.pd || defaults.pdfDir;
  htmlDir = args.htmlDir || args.hd || defaults.htmlDir;
  theme = args.theme || defaults.theme;
}

export function watchMd(args) {
  setupArgs(args);

  chokidar
    .watch(notesGlob, { ignoreInitial: true })
    .on('change', (path, stats) => compileMd(path))
    .on('add', (path, stats) => compileMd(path));
}
