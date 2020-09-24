import path from 'path';
import fs from 'fs';
import { mdToPdf } from 'md-to-pdf';
import chokidar from 'chokidar';
import Glob from 'glob';
import * as d from 'debug';
import defaults from './defaults';

const debug = d.debug('cli');

let notesDir,
  pdfDir,
  htmlDir,
  style = defaults.style,
  theme,
  notesGlob;

function setupArgs(args) {
  notesDir = args.notesDir || args.nd || defaults.notesDir;
  notesGlob = args.notesGlob || args.ng || `${notesDir}/**/*.md`;
  pdfDir = args.pdfDir || args.pd || defaults.pdfDir;
  htmlDir = args.htmlDir || args.hd || defaults.htmlDir;
  theme = args.theme || defaults.theme;

  debug('Arg setup finished');
}

function getPdfFileName(mdFile) {
  return mdFile.replace(notesDir, pdfDir).replace('.md', '.pdf');
}

function getHtmlFileName(mdFile) {
  return mdFile.replace(notesDir, htmlDir).replace('.md', '.html');
}

/**
 * Ensure that the directory-part of a filepath exists
 * @param {string} filePath
 */
const ensurePathExists = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    debug(`${dir} didn't exist but was created`);
  }

  debug(`ensured ${dir} exists`);
};

/**
 * Handle an error from the pdf-to-latex compilation
 * @param err
 * @param {string} mdFile
 * @param {string} compiledFile
 */
function handleCompilationError(err, mdFile, compiledFile) {
  const format = compiledFile.endsWith('.pdf') ? 'pdf' : 'html';
  console.error(`failed to compile '${mdFile}' to '${format}'`);
}

/**
 * Compile a markdown file to html and pdf in the respective directories
 * @param {string} mdFile markdown file that was changed
 */
const compileMd = async (mdFile) => {
  debug(`Trying to compile ${mdFile}`);

  const pdfFile = getPdfFileName(mdFile);
  const htmlFile = getHtmlFileName(mdFile);

  ensurePathExists(pdfFile);
  ensurePathExists(htmlFile);

  // TODO: check if file already exists, and only overwrite if md file is newer than other files

  // try compiling to file to pdf & markdown
  const x = await mdToPdf({ path: mdFile }, { dest: pdfFile, stylesheet: [style(theme)] }).catch((err) =>
    handleCompilationError(err, mdFile, pdfFile),
  );
  const y = await mdToPdf(
    { path: mdFile },
    { dest: htmlFile, stylesheet: [style(theme)], as_html: true },
  ).catch((err) => handleCompilationError(err, mdFile, pdfFile));

  console.log(`compiled file to ${pdfFile} / ${htmlFile}`);
};

/**
 * Delete compiled versions (html and pdf) of md file
 * @param {string} mdFile
 */
function deleteCompilationOutputs(mdFile) {
  const pdfFile = getPdfFileName(mdFile);
  const htmlFile = getHtmlFileName(mdFile);

  if (fs.existsSync(htmlFile)) {
    fs.unlinkSync(htmlFile);
    debug(`deleted file ${htmlFile}`);
  }

  if (fs.existsSync(pdfFile)) {
    fs.unlinkSync(pdfFile);
    debug(`deleted file ${pdfFile}`);
  }
}

export function watchMd(args) {
  setupArgs(args);

  chokidar
      .watch(notesGlob, {ignoreInitial: true})
      .on('add', (path, stats) => compileMd(path))
      .on('unlink', (path) => deleteCompilationOutputs(path));
}

/**
 * Compile all markdown files into pdf / html
 * @param args
 */
export function compile(args) {
  setupArgs(args);

  Glob(notesGlob, {}, function (er, files) {
    if (er) {
      console.error(`Compiling failed, got error ${er}`);
      return;
    }
    if (files === undefined || files === [] || files === null || files.length === 0) {
      console.warn('Compiling failed, no files found');
      return;
    }

    for (const f of files) {
      compileMd(f).then((r) => debug(r));
    }
  });
}
