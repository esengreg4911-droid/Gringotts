const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { spawn } = require('child_process');

const root = path.resolve(__dirname, '..');
const envText = fs.readFileSync(path.join(root, '.env.local'), 'utf8');
const token = envText.match(/^TMDB_READ_ACCESS_TOKEN=(.+)$/m)?.[1].trim();
if (!token) throw new Error('TMDB_READ_ACCESS_TOKEN is missing from .env.local');

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'data.js'), 'utf8'), context);
const items = context.window.DATA;
const outputPath = path.join(root, 'tmdb-en-results.json');
const curlConfig = path.join(os.tmpdir(), `gringotts-tmdb-${process.pid}.conf`);
fs.writeFileSync(curlConfig, `header = "Authorization: Bearer ${token}"\nheader = "Accept: application/json"\n`, { mode: 0o600 });

const normalize = (value = '') => value.toLowerCase().replace(/&/g, ' and ').replace(/[^\p{L}\p{N}]+/gu, '');
const seasonParts = (title) => {
  const match = title.match(/^(.*?)\s+S(\d+)$/);
  return match ? { base: match[1], season: Number(match[2]) } : { base: title, season: null };
};

function curlJson(url, attempt = 1) {
  return new Promise((resolve, reject) => {
    const child = spawn('curl.exe', ['--silent', '--show-error', '--fail', '--max-time', '35', '--config', curlConfig, '--url', url], {
      windowsHide: true
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('close', async (code) => {
      if (code === 0) {
        try { resolve(JSON.parse(stdout)); } catch (error) { reject(error); }
      } else if (attempt < 4) {
        await new Promise((done) => setTimeout(done, attempt * 700));
        try { resolve(await curlJson(url, attempt + 1)); } catch (error) { reject(error); }
      } else {
        reject(new Error(`curl failed (${code}): ${stderr.trim()}`));
      }
    });
  });
}

async function mapLimit(values, limit, mapper) {
  const results = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= values.length) return;
      results[index] = await mapper(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, worker));
  return results;
}

function choose(candidates, item, mediaType) {
  const parts = seasonParts(item.title);
  const wanted = normalize(parts.base);
  return (candidates || []).map((candidate) => {
    const title = mediaType === 'movie' ? candidate.title : candidate.name;
    const original = mediaType === 'movie' ? candidate.original_title : candidate.original_name;
    const date = mediaType === 'movie' ? candidate.release_date : candidate.first_air_date;
    const year = Number((date || '').slice(0, 4)) || 0;
    let score = normalize(title) === wanted ? 100 : normalize(original) === wanted ? 95 : 0;
    if (parts.season === null || parts.season === 1) {
      const difference = Math.abs(year - Number(item.year));
      score += difference === 0 ? 35 : difference === 1 ? 18 : difference <= 3 ? 5 : -Math.min(25, difference);
    }
    return { candidate, score, year };
  }).sort((a, b) => b.score - a.score)[0] || null;
}

(async function main() {
const groupImdbIds = new Map();
for (const item of items.filter((entry) => entry.type === 'series')) {
  const base = seasonParts(item.title).base;
  if (!groupImdbIds.has(base)) groupImdbIds.set(base, new Set());
  groupImdbIds.get(base).add(item.imdb_id);
}

const lookupGroups = new Map();
for (const item of items) {
  const mediaType = item.type === 'film' ? 'movie' : 'tv';
  const key = `${mediaType}|${item.imdb_id || seasonParts(item.title).base}`;
  if (!lookupGroups.has(key)) lookupGroups.set(key, { key, mediaType, item });
}

let lookupDone = 0;
const lookups = await mapLimit([...lookupGroups.values()], 8, async ({ key, mediaType, item }) => {
  let best = null;
  if (item.imdb_id) {
    const url = `https://api.themoviedb.org/3/find/${encodeURIComponent(item.imdb_id)}?external_source=imdb_id&language=en-US`;
    const found = await curlJson(url);
    best = choose(mediaType === 'movie' ? found.movie_results : found.tv_results, item, mediaType);
    if (best) best.score = Math.max(150, best.score);
  }
  if (!best) {
    const parts = seasonParts(item.title);
    const query = encodeURIComponent(parts.base);
    const yearKey = mediaType === 'movie' ? 'year' : 'first_air_date_year';
    const search = await curlJson(`https://api.themoviedb.org/3/search/${mediaType}?query=${query}&language=en-US&${yearKey}=${item.year}`);
    best = choose(search.results, item, mediaType);
  }
  lookupDone++;
  if (lookupDone % 25 === 0 || lookupDone === lookupGroups.size) console.log(`Matched ${lookupDone} / ${lookupGroups.size} unique titles`);
  return [key, best];
});
const lookupMap = new Map(lookups);

let detailDone = 0;
const results = await mapLimit(items, 8, async (item) => {
  if (Number(item.id) === 12102) {
    const special = await curlJson('https://api.themoviedb.org/3/tv/46296/season/0?language=en-US');
    detailDone++;
    return {
      id: 12102, title: item.title, year: Number(item.year), type: item.type,
      tmdbId: 46296, season: 0, matchedTitle: 'Spartacus: Gods of the Arena',
      matchedYear: 2011, matchScore: 150, overview: String(special.overview || '').trim(),
      source: 'https://www.themoviedb.org/tv/46296/season/0', usedShowFallback: false
    };
  }
  const mediaType = item.type === 'film' ? 'movie' : 'tv';
  const parts = seasonParts(item.title);
  const key = `${mediaType}|${item.imdb_id || parts.base}`;
  const best = lookupMap.get(key);
  const candidate = best?.candidate;
  const tmdbId = Number(candidate?.id) || 0;
  let overview = String(candidate?.overview || '').trim();
  let source = tmdbId ? `https://www.themoviedb.org/${mediaType}/${tmdbId}` : '';
  let usedShowFallback = false;

  const groupUsesSingleShow = parts.season !== null && groupImdbIds.get(parts.base)?.size === 1;
  if (tmdbId && groupUsesSingleShow) {
    try {
      const season = await curlJson(`https://api.themoviedb.org/3/tv/${tmdbId}/season/${parts.season}?language=en-US`);
      const seasonOverview = String(season.overview || '').trim();
      if (seasonOverview) overview = seasonOverview;
      else usedShowFallback = true;
      source = `https://www.themoviedb.org/tv/${tmdbId}/season/${parts.season}`;
    } catch {
      usedShowFallback = true;
    }
  }

  detailDone++;
  if (detailDone % 25 === 0 || detailDone === items.length) console.log(`Fetched ${detailDone} / ${items.length} descriptions`);
  return {
    id: Number(item.id), title: item.title, year: Number(item.year), type: item.type,
    tmdbId, season: parts.season, matchedTitle: mediaType === 'movie' ? candidate?.title : candidate?.name,
    matchedYear: Number(((mediaType === 'movie' ? candidate?.release_date : candidate?.first_air_date) || '').slice(0, 4)) || 0,
    matchScore: best?.score || 0, overview, source, usedShowFallback
  };
});

fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
fs.rmSync(curlConfig, { force: true });
console.log(`Saved ${results.length} records to ${outputPath}`);
})().catch((error) => {
  fs.rmSync(curlConfig, { force: true });
  console.error(error.message);
  process.exitCode = 1;
});
