import { validateBriefing, validateArchive, sectionLabels } from './data.js';

const main = document.querySelector('#main');
const dateFormat = new Intl.DateTimeFormat('it-IT', { dateStyle: 'full', timeZone: 'Europe/Copenhagen' });
const sourceFormat = new Intl.DateTimeFormat('it-IT', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', timeZone:'Europe/Copenhagen', timeZoneName:'short' });
document.querySelector('#today').textContent = dateFormat.format(new Date());
document.querySelector('#today').dateTime = new Date().toISOString();

function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function link(text, href) { const node = el('a', text); node.href = href; return node; }
function stamp(value) {
  const node = el('time', value.length === 10 ? dateFormat.format(new Date(`${value}T12:00:00Z`)) : sourceFormat.format(new Date(value)));
  node.dateTime = value;
  return node;
}
async function readJSON(path) {
  const response = await fetch(path, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
function sourceLine(item) {
  const row = el('div', '', 'sources');
  row.append(link(item.source, item.url));
  if (item.published) row.append(stamp(item.published));
  for (const source of item.additional_sources || []) row.append(link(source.name, source.url));
  return row;
}
function picture(image) {
  const figure = el('figure');
  const img = el('img'); img.src = image.url; img.alt = image.alt; img.loading = 'lazy'; img.decoding = 'async';
  img.width = image.width || 1200; img.height = image.height || 800;
  const caption = el('figcaption');
  if (image.caption) caption.append(el('span', `${image.caption} `));
  caption.append(link(image.credit, image.source_url), document.createTextNode(' · '), link(image.license, image.license_url));
  img.addEventListener('error', () => { img.remove(); caption.prepend(document.createTextNode('Immagine non disponibile. ')); }, { once:true });
  figure.append(img, caption); return figure;
}
function article(item, lead = false) {
  const node = el('article', '', lead ? 'story lead' : 'story');
  const copy = el('div', '', 'story-copy');
  copy.append(el('p', item.category, 'category'), el('h3', item.title), el('p', item.summary));
  if (item.why_it_matters) {
    const why = el('p', '', 'why'); why.append(el('strong', 'Perché conta. '), document.createTextNode(item.why_it_matters)); copy.append(why);
  }
  for (const [key, label] of [['statements','Dichiarazioni'], ['analysis','Analisi'], ['limitations','Limiti delle evidenze']]) {
    if (item[key]) { const para = el('p', '', 'attribution'); para.append(el('strong', `${label}. `), document.createTextNode(item[key])); copy.append(para); }
  }
  copy.append(sourceLine(item)); node.append(copy);
  if (item.image) node.append(picture(item.image));
  return node;
}
function heading(title, count) {
  const row = el('div', '', 'section-heading'); row.append(el('h2', title));
  if (count) row.append(el('span', `${count} ${count === 1 ? 'lettura' : 'letture'}`, 'count')); return row;
}
function section(title, items, id, lead = false) {
  const node = el('section', '', 'news-section'); node.id = id; node.setAttribute('aria-label', title); node.append(heading(title, items.length));
  const grid = el('div', '', 'stories'); items.forEach((item,i) => grid.append(article(item, lead && i === 0))); node.append(grid); return node;
}
function renderBriefing(data, archived) {
  validateBriefing(data);
  const demo = data.status === 'demo';
  document.title = `${demo ? 'Anteprima editoriale' : data.date ? `Briefing del ${data.date}` : 'Il briefing personale'} — Daily News`;
  main.replaceChildren();
  if (demo) { const notice = el('aside', 'Anteprima di impaginazione: questi testi spiegano il profilo editoriale, non sono notizie. Le immagini sono d’archivio.', 'notice'); notice.append(link('Torna al briefing', './')); main.append(notice); }
  if (archived) { const notice = el('aside', 'Stai leggendo un’edizione d’archivio.', 'notice'); notice.append(link('Vai all’ultima edizione', './')); main.append(notice); }
  const intro = el('section', '', 'intro');
  const line = el('div', '', 'intro-line'); line.append(el('p', demo ? 'UNA PAUSA PER CAPIRE' : 'IL MONDO, CON UN PO’ DI CONTESTO', 'eyebrow'));
  if (data.updated) { const update = el('p', '', 'updated'); update.append(document.createTextNode('Ultimo aggiornamento: '), stamp(data.updated)); line.append(update); }
  intro.append(line, el('h1', data.title || 'Il briefing di oggi'), el('p', data.summary, 'deck'));
  if (data.date && !demo) intro.append(el('p', dateFormat.format(new Date(`${data.date}T12:00:00Z`)), 'updated'));
  const nav = el('nav', '', 'section-nav'); nav.setAttribute('aria-label', 'In questa edizione');
  for (const [key,label] of Object.entries(sectionLabels)) if (data.sections[key]?.length) nav.append(link(label, `#${key}`));
  if (nav.children.length) intro.append(nav);
  main.append(intro);
  if (data.top_stories.length) main.append(section('Oggi in breve', data.top_stories, 'oggi', true));
  for (const [key,label] of Object.entries(sectionLabels)) if (data.sections[key]?.length) main.append(section(label, data.sections[key], key));
  if (data.watchlist.length) {
    const node = el('section', '', 'news-section'); node.append(heading('Da tenere d’occhio'));
    const list = el('ul', '', 'watchlist');
    for (const item of data.watchlist) { const li = el('li'); li.append(el('h3', item.title), el('p', item.summary), sourceLine(item)); list.append(li); }
    node.append(list); main.append(node);
  }
  if (!data.top_stories.length && !Object.values(data.sections).some(items => items.length) && !data.watchlist.length) {
    const empty = el('section', '', 'empty');
    empty.append(el('p', 'NESSUNA EDIZIONE PUBBLICATA', 'eyebrow'), el('h2', 'Le notizie possono aspettare. Le fonti, no.'), el('p', 'Il primo briefing sarà disponibile dopo la selezione e la verifica delle fonti. Qui troverai soltanto ciò che merita davvero il tuo tempo.'), link('Esplora l’anteprima editoriale', '?preview=1'));
    main.append(empty);
  }
}
async function renderArchive() {
  const data = await readJSON('data/archive/index.json'); validateArchive(data);
  document.title = 'Archivio — Daily News'; main.replaceChildren();
  const intro = el('section', '', 'intro'); intro.append(el('p', 'LE EDIZIONI PRECEDENTI', 'eyebrow'), el('h1', 'Un giorno alla volta.'), el('p', 'I briefing passati, con le fonti e il contesto del momento.', 'deck')); main.append(intro);
  const list = el('ul', '', 'archive-list');
  for (const date of [...data.dates].sort().reverse()) { const li = el('li'); const a = link(dateFormat.format(new Date(`${date}T12:00:00Z`)), `?date=${date}`); a.append(el('span', 'Leggi il briefing →')); li.append(a); list.append(li); }
  if (!data.dates.length) { const empty = el('section', '', 'empty'); empty.append(el('h2', 'L’archivio comincia con la prima edizione.'), el('p', 'Le edizioni pubblicate compariranno qui, dalla più recente.'), link('Torna al briefing', './')); main.append(empty); }
  else main.append(list);
}
async function start() {
  const params = new URLSearchParams(location.search); const date = params.get('date'); const archive = params.get('view') === 'archive';
  document.querySelector(archive || date ? '#archive-link' : '#home-link').setAttribute('aria-current', 'page');
  try {
    if (archive) await renderArchive();
    else {
      if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Data non valida');
      const data = await readJSON(date ? `data/archive/${date}.json` : params.get('preview') === '1' ? 'data/example.json' : 'data/latest.json');
      if (date && data.date !== date) throw new Error('Edizione non corrispondente');
      renderBriefing(data, Boolean(date));
    }
  } catch (error) {
    console.error('Briefing non disponibile:', error.message);
    const box = el('section', '', 'error'); box.setAttribute('role','alert');
    box.append(el('h1', 'Questa edizione non è disponibile.'), el('p', 'Il contenuto potrebbe non essere stato pubblicato oppure non essere raggiungibile. Riprova tra poco o consulta le altre edizioni.'), link('Torna al briefing', './'), document.createTextNode(' · '), link('Consulta l’archivio', '?view=archive'));
    main.replaceChildren(box);
  } finally { main.setAttribute('aria-busy','false'); }
}
start();
