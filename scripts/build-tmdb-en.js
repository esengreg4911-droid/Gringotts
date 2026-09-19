const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const inputPath = path.join(root, 'tmdb-en-results.json');
const zhInputPath = path.join(root, 'tmdb-zh-results.json');
const outputPath = path.join(root, 'tmdb-descriptions.js');
const reportPath = path.join(root, 'tmdb-en-report.txt');
const rows = JSON.parse(fs.readFileSync(inputPath, 'utf8').replace(/^\uFEFF/, ''));
const zhRows = JSON.parse(fs.readFileSync(zhInputPath, 'utf8').replace(/^\uFEFF/, ''));
const zhById = new Map(zhRows.map((row) => [String(row.id), row.zh]));

const usable = rows.filter((row) => row.overview && row.matchScore >= 90);
const needsReview = rows.filter((row) => !row.overview || row.matchScore < 90);
const payload = Object.fromEntries(usable.map((row) => [String(row.id), {
  en: row.overview,
  zh: zhById.get(String(row.id)) || row.overview,
  source: row.source,
  tmdbId: row.tmdbId,
  season: row.season
}]));

const source = `// Generated from TMDB's English-language API with Chinese translations that preserve proper nouns.\n` +
  `window.TMDB_DESCRIPTIONS = ${JSON.stringify(payload, null, 2)};\n\n` +
  `window.DATA.forEach(function (item) {\n` +
  `  var entry = window.TMDB_DESCRIPTIONS[String(item.id)];\n` +
  `  if (!entry) return;\n` +
  `  item.description_en = entry.en;\n` +
  `  item.description_zh = entry.zh;\n` +
  `  item.description_source_en = entry.source;\n` +
  `  item.description_source_zh = entry.source;\n` +
  `  item.description_source_name_en = 'TMDB';\n` +
  `  item.description_source_name_zh = 'TMDB';\n` +
  `});\n`;

fs.writeFileSync(outputPath, source, 'utf8');

const report = [
  `TMDB English import`,
  `Imported: ${usable.length}/${rows.length}`,
  `Needs review: ${needsReview.length}`,
  '',
  ...needsReview.map((row) =>
    `${row.id}\t${row.title}\t${row.year}\tmatch=${row.matchedTitle || '-'} (${row.matchedYear || '-'})\tscore=${row.matchScore}\t${row.overview ? (row.usedShowFallback ? 'show fallback' : 'ok') : 'missing overview'}`
  )
].join('\n');
fs.writeFileSync(reportPath, report + '\n', 'utf8');
console.log(report);
