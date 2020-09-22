#!/usr/bin/env node

const chokidar = require('chokidar');
const { mdToPdf } = require('md-to-pdf');
const fs = require('fs');
const path = require('path');

const notesDir = '/Users/dev/docs/notes/';
const notesGlob = `${notesDir}/**/*.md`;
const pdfDir = '/Users/dev/docs/pdf-notes/';
const htmlDir = '/Users/dev/docs/html-notes/';

const stylesheet = (theme) => `/Users/dev/Library/Application Support/abnerworks.Typora/themes/${theme}.css`;
const theme = 'triply';

const log = console.log.bind(console);

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

	await mdToPdf({ path: mdFile }, { dest: pdfFile, stylesheet: [stylesheet(theme)] });
	await mdToPdf({ path: mdFile }, { dest: htmlFile, stylesheet: [stylesheet(theme)], as_html: true });
	log(`compiled file to ${pdfFile} / ${htmlFile}`);
};

chokidar
	.watch(notesGlob, { ignoreInitial: true })
	.on('change', (path, stats) => compileMd(path))
	.on('add', (path, stats) => compileMd(path));
