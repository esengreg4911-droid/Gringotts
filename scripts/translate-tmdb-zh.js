const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

const root = path.resolve(__dirname, '..');
const inputPath = path.join(root, 'tmdb-en-results.json');
const outputPath = path.join(root, 'tmdb-zh-results.json');
const rows = JSON.parse(fs.readFileSync(inputPath, 'utf8').replace(/^\uFEFF/, ''));

const sentenceStarters = new Set(`
  a an the this that these those it its he his she her they their we our i my
  across after although amid before because despite during while when as at by for from in into of on over since through throughout to under with without
  and but eventually however meanwhile now once shortly still soon then
  based born caught faced forced haunted held imprisoned living located raised set sent tasked trapped wounded
  determined desperate eager enraged following hoping obsessed seeking struggling trying working
  follow follows join joins meet meets discover discovers explore explores watch watches witness witnesses
  one two three four five six seven eight nine ten years months days decades young old
  count emperor musician ranger spanning
`.trim().split(/\s+/));

const neverProtect = new Set(`
  african american asian australian austrian belgian brazilian british canadian chinese danish dutch english european
  french german greek indian irish italian japanese jewish korean mexican norwegian polish portuguese romanian russian
  scottish spanish swedish swiss turkish vietnamese
  captain colonel commander count detective doctor emperor general inspector lieutenant musician officer professor ranger
  reverend sergeant sir
  january february march april may june july august september october november december
  monday tuesday wednesday thursday friday saturday sunday
`.trim().split(/\s+/));

const manualTranslations = new Map([
  [12403, '第三季，刚刚升入英格兰足球超级联赛的 AFC Richmond 遭到外界嘲笑，媒体普遍预测他们会排名垫底。被誉为“神奇小子”的 Nate 已前往西汉姆联，为 Rupert 工作。Nate 离开 Richmond 时闹得很不愉快，Roy Kent 随后与 Beard 一同出任助理教练。Ted 一边承受工作压力，一边继续处理家里的个人问题。Rebecca 专注于击败 Rupert，Keeley 则开始掌管自己的公关机构。球队内外似乎都在分崩离析，但 Team Lasso 仍准备全力以赴。']
]);

const localizedTerms = new Map(Object.entries({
  "Pittsburgh's Trauma Medical Center": '匹兹堡创伤医疗中心',
  'Pittsburgh Trauma Medical Center': '匹兹堡创伤医疗中心',
  "America's": '美国的',
  'America’s': '美国的',
  "Britain's": '英国的',
  'Britain’s': '英国的',
  "Baltimore's": '巴尔的摩的',
  "Rome's": '罗马的',
  'Lower East Side of Manhattan': '曼哈顿下东区',
  'United States of America': '美国',
  'International Space Station': '国际空间站',
  'Gotham City Police Department': 'Gotham City 警察局',
  'Fox River State Penitentiary': 'Fox River 州立监狱',
  'Royal Geographical Society': '皇家地理学会',
  'Pittsburgh': '匹兹堡',
  'New York City': '纽约市',
  'Atlantic City': '大西洋城',
  'Kansas City': '堪萨斯城',
  'Washington DC': '华盛顿特区',
  'West Baltimore': '西巴尔的摩',
  'Yorkshire Dales': '约克郡谷地',
  'Sahara Desert': '撒哈拉沙漠',
  'Lake Michigan': '密歇根湖',
  'Chicago River': '芝加哥河',
  'San Pedro': '圣佩德罗',
  'South Dakota': '南达科他州',
  'New England': '新英格兰',
  'North Sea': '北海',
  'United States': '美国',
  'Soviet Union': '苏联',
  'New York': '纽约',
  'Los Angeles': '洛杉矶',
  'Las Vegas': '拉斯维加斯',
  'Sioux Falls': '苏福尔斯',
  'Albuquerque': '阿尔伯克基',
  'Alexandria': '亚历山大',
  'Baltimore': '巴尔的摩',
  'Hollywood': '好莱坞',
  'Minnesota': '明尼苏达州',
  'Normandy': '诺曼底',
  'Pennsylvania': '宾夕法尼亚州',
  'Oxfordshire': '牛津郡',
  'Westminster': '威斯敏斯特',
  'Washington': '华盛顿',
  'Yorkshire': '约克郡',
  'Brooklyn': '布鲁克林',
  'Chernobyl': '切尔诺贝利',
  'Chicago': '芝加哥',
  'Duluth': '德卢斯',
  'Florida': '佛罗里达州',
  'Germany': '德国',
  'Glasgow': '格拉斯哥',
  'Indiana': '印第安纳州',
  'London': '伦敦',
  'Louisiana': '路易斯安那州',
  'Manchester City': '曼城',
  'Miami': '迈阿密',
  'Montana': '蒙大拿州',
  'Omaha': '奥马哈',
  'Oxford': '牛津',
  'Toronto': '多伦多',
  'Virginia': '弗吉尼亚州',
  'Warsaw': '华沙',
  'England': '英格兰',
  'Britain': '英国',
  'America': '美国',
  'Europe': '欧洲',
  'Egypt': '埃及',
  'Sicily': '西西里',
  'Italy': '意大利',
  'Cuba': '古巴',
  'Japan': '日本',
  'Seoul': '首尔',
  'Vietnam': '越南',
  'Rome': '罗马',
  'Gaul': '高卢',
  'Capua': '卡普亚',
  'Earth': '地球',
  'Mars': '火星',
  'World War II': '第二次世界大战',
  'World War I': '第一次世界大战',
  'First World War': '第一次世界大战',
  'Great Patriotic War': '伟大卫国战争',
  'Vietnam War': '越南战争',
  'Cold War': '冷战',
  'Civil War': '内战',
  'Great Depression': '大萧条',
  'Roman Republic': '罗马共和国',
  'Roman Senate': '罗马元老院',
  'Solar System': '太阳系',
  'Asteroid Belt': '小行星带',
  'Inner Planets': '内行星',
  'D-Day': '诺曼底登陆日',
  'Great Wall': '长城',
  'White House': '白宫',
  'City Hall': '市政厅',
  'National Park': '国家公园',
  'Department of Defense': '国防部',
  'Department  of Diagnostics': '诊断科',
  'Cowley Police Station': 'Cowley 警察局',
  'Mission Control': '任务控制中心',
  'LAPD': '洛杉矶警察局',
  'NYPD': '纽约市警察局',
  'FBI': '联邦调查局',
  'CIA': '中央情报局',
  'DEA': '缉毒局',
  'NASA': '美国国家航空航天局',
  'U.N.': '联合国',
  'L.A.': '洛杉矶',
  'D.C.': '华盛顿特区',
  'U.S。': '美国',
  'U.S.': '美国',
  'U.S': '美国',
  'USA': '美国',
  'US': '美国',
  'UK': '英国',
  'USSR': '苏联',
  'RAF': '英国皇家空军',
  'Nazis': '纳粹',
  'Nazi': '纳粹',
  'Sioux': '苏族',
  'Premier League': '英格兰足球超级联赛',
  'West Ham United': '西汉姆联',
  'PR': '公关'
}));

function localizeCommonTerms(text) {
  let result = text;
  const terms = [...localizedTerms].sort((a, b) => b[0].length - a[0].length);
  for (const [source, target] of terms) {
    const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(`(?<![A-Za-z])${escaped}(?![A-Za-z]|\\.[A-Za-z])`, 'g'), target);
  }
  return result
    .replace(/([\u3400-\u9fff])\s+(?=[\u3400-\u9fff])/g, '$1')
    .replace(/([，。！？；：、])\s+(?=[\u3400-\u9fff])/g, '$1');
}

const lowerCaseWords = new Set();
for (const row of rows) {
  for (const match of row.overview.matchAll(/\b[a-z][a-z'’-]{2,}\b/g)) {
    lowerCaseWords.add(match[0].toLowerCase());
  }
}

function addExactRanges(text, value, ranges, priority) {
  if (!value || value.length < 2) return;
  let start = 0;
  while ((start = text.indexOf(value, start)) !== -1) {
    ranges.push({ start, end: start + value.length, priority });
    start += value.length;
  }
}

function isSentenceStart(text, index) {
  const before = text.slice(0, index).trimEnd();
  return !before || /[.!?]\s*$/.test(before);
}

function protectedRanges(row) {
  const text = row.overview;
  const ranges = [];
  addExactRanges(text, row.title, ranges, 3);
  addExactRanges(text, row.matchedTitle, ranges, 3);

  const word = String.raw`(?:(?:Dr|Mr|Mrs|Ms|St|Jr|Sr|Det|Prof|Capt|Sgt|Lt|Gen)\.|[A-Z](?:\.[A-Z])+\.?|[A-Z][A-Za-zÀ-ÖØ-öø-ÿ'’\-]*|[A-Z]{2,}|[IVX]{2,})`;
  const connector = String.raw`(?:of|the|de|del|la|van|von|da|dos|di|du|le)`;
  const multi = new RegExp(String.raw`\b${word}(?:\s+(?:${connector}\s+)*${word})+\b`, 'g');
  for (const match of text.matchAll(multi)) {
    let value = match[0];
    let start = match.index;
    const first = value.match(/^[A-Za-zÀ-ÖØ-öø-ÿ'’.\-]+/)?.[0] || '';
    const firstKey = first.toLowerCase().split('-')[0];
    if (sentenceStarters.has(firstKey) || neverProtect.has(firstKey)) {
      const trimmed = value.slice(first.length).replace(/^\s+/, '');
      start += value.length - trimmed.length;
      value = trimmed;
    }
    if (value) ranges.push({ start, end: start + value.length, priority: 2 });
  }

  for (const match of text.matchAll(/(?:\b[A-Z](?:\.[A-Z])+\.(?=\s|$)|\b(?:[A-Z](?:\.[A-Z])+|[A-Z]{2,}|[A-Z][A-Za-zÀ-ÖØ-öø-ÿ'’\-]{1,})\b)/g)) {
    const value = match[0];
    const start = match.index;
    const lower = value.toLowerCase();
    const atStart = isSentenceStart(text, start);
    if (neverProtect.has(lower.split('-')[0])) continue;
    if (atStart && (sentenceStarters.has(lower) || lowerCaseWords.has(lower))) continue;
    ranges.push({ start, end: start + value.length, priority: 1 });
  }

  ranges.sort((a, b) => a.start - b.start || b.priority - a.priority || b.end - a.end);
  const selected = [];
  for (const range of ranges) {
    const overlap = selected.find((item) => range.start < item.end && range.end > item.start);
    if (!overlap) selected.push(range);
  }
  return selected.sort((a, b) => a.start - b.start);
}

function protect(row) {
  const ranges = protectedRanges(row);
  const names = [];
  const tokens = [];
  let cursor = 0;
  let text = '';
  for (const range of ranges) {
    text += row.overview.slice(cursor, range.start);
    const name = row.overview.slice(range.start, range.end);
    const safeName = name.replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_+|_+$/g, '');
    const token = `ZXQPN${String(names.length).padStart(3, '0')}_${safeName}_QXZ`;
    names.push(name);
    tokens.push(token);
    text += token;
    cursor = range.end;
  }
  text += row.overview.slice(cursor);
  return { text, names, tokens };
}

function restore(text, names, tokens) {
  let result = text;
  names.forEach((name, index) => {
    if (tokens[index]) result = result.replaceAll(tokens[index], name);
    const looseToken = new RegExp(`ZXQPN${String(index).padStart(3, '0')}_[\\s\\S]*?_QXZ`, 'g');
    result = result.replace(looseToken, name);
  });
  return result
    .replace(/\s+([，。！？；：、])/g, '$1')
    .replace(/([（【])\s+/g, '$1')
    .replace(/\s+([）】])/g, '$1')
    .replace(/[—–]+/g, '，')
    .replace(/([a-z]{2,})\.(?=\s|$)/g, '$1。')
    .replace(/\b(Dr|Mr|Mrs|Ms|St|Jr|Sr|Det|Prof|Capt|Sgt|Lt|Gen)。/g, '$1.')
    .trim();
}

function translatedText(payload) {
  if (!Array.isArray(payload?.[0])) throw new Error('Unexpected translation response');
  return payload[0].map((part) => part[0] || '').join('');
}

async function translate(row) {
  const { text, names, tokens } = protect(row);
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', 'en');
  url.searchParams.set('tl', 'zh-CN');
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', text);

  let lastError;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const { stdout } = await execFileAsync('pwsh.exe', [
        '-NoLogo', '-NoProfile', '-NonInteractive', '-Command',
        '$ProgressPreference="SilentlyContinue"; (Invoke-WebRequest -UseBasicParsing -Uri $env:TMDB_TRANSLATE_URL).Content'
      ], {
        env: { ...process.env, TMDB_TRANSLATE_URL: url.toString() },
        maxBuffer: 1024 * 1024
      });
      const zh = restore(translatedText(JSON.parse(stdout.trim())), names, tokens);
      if (/ZXQPN\d+_/.test(zh)) throw new Error('Unrestored proper-name placeholder');
      return { id: row.id, zh: localizeCommonTerms(manualTranslations.get(row.id) || zh), protectedNames: names };
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 800));
    }
  }
  throw new Error(`Translation failed for item ${row.id}: ${lastError?.message}`);
}

async function main() {
  if (process.argv.includes('--repair')) {
    const existing = JSON.parse(fs.readFileSync(outputPath, 'utf8').replace(/^\uFEFF/, ''));
    for (const row of existing) row.zh = localizeCommonTerms(manualTranslations.get(row.id) || restore(row.zh, row.protectedNames, []));
    fs.writeFileSync(outputPath, JSON.stringify(existing, null, 2) + '\n', 'utf8');
    console.log(`Repaired ${existing.length} translations in ${outputPath}`);
    return;
  }
  const translated = new Array(rows.length);
  let next = 0;
  let complete = 0;
  const workers = Array.from({ length: 6 }, async () => {
    while (next < rows.length) {
      const index = next++;
      translated[index] = await translate(rows[index]);
      complete += 1;
      if (complete % 25 === 0 || complete === rows.length) {
        console.log(`Translated ${complete} / ${rows.length}`);
      }
    }
  });
  await Promise.all(workers);
  fs.writeFileSync(outputPath, JSON.stringify(translated, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
