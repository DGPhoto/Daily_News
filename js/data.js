export const sectionLabels = Object.freeze({italia:'Italia',europa:'Europa',danimarca:'Danimarca',geopolitica:'Geopolitica e sicurezza',ai:'Intelligenza artificiale',psicologia:'Psicologia e ADHD',antropologia:'Antropologia ed evoluzione umana',clima_spazio:'Clima e spazio',motogp:'Moto e MotoGP',fotografia_cultura:'Fotografia e cultura'});
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const text = value => typeof value === 'string' && value.trim().length > 0;
const url = value => { try { return ['https:','http:'].includes(new URL(value).protocol); } catch { return false; } };
export function validDate(value) { return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value; }
const timestamp = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(value) && validDate(value.slice(0,10)) && Number.isFinite(Date.parse(value));
export function validateArchive(data) { assert(data && Array.isArray(data.dates), 'Archivio non valido'); assert(data.dates.every(validDate), 'Data di archivio non valida'); assert(new Set(data.dates).size === data.dates.length, 'Date duplicate in archivio'); return data; }
export function validateBriefing(data) {
  assert(data && ['draft','published','demo'].includes(data.status), 'Status richiesto: draft, published o demo');
  assert(data.date === null || validDate(data.date), 'Data non valida');
  assert(data.updated === null || timestamp(data.updated), 'Timestamp con fuso obbligatorio');
  if (data.status === 'published') assert(validDate(data.date) && timestamp(data.updated), 'Data e aggiornamento richiesti per pubblicare');
  assert(text(data.summary), 'Sommario richiesto');
  assert(Array.isArray(data.top_stories) && Array.isArray(data.watchlist), 'Liste di notizie non valide');
  assert(data.sections && typeof data.sections === 'object' && !Array.isArray(data.sections), 'Sezioni non valide');
  for (const [key,items] of Object.entries(data.sections)) assert(Object.hasOwn(sectionLabels,key) && Array.isArray(items), `Sezione non valida: ${key}`);
  const stories = [...data.top_stories,...Object.values(data.sections).flat()];
  const urls = new Set();
  for (const item of [...stories,...data.watchlist]) {
    assert(item && text(item.title) && text(item.summary) && text(item.source) && url(item.url), 'Titolo, sintesi e fonte con URL HTTP(S) richiesti');
    if (data.status === 'published') assert(validDate(item.published) || timestamp(item.published), 'Data della fonte richiesta');
    else if (item.published != null) assert(validDate(item.published) || timestamp(item.published), 'Data della fonte non valida');
    assert(!urls.has(item.url), 'Fonte principale duplicata nella stessa edizione'); urls.add(item.url);
    if (item.additional_sources !== undefined) { assert(Array.isArray(item.additional_sources), 'Fonti aggiuntive non valide'); for (const source of item.additional_sources) assert(source && text(source.name) && url(source.url), 'Fonte aggiuntiva non valida'); }
    for (const key of ['statements','analysis','limitations']) if (item[key] !== undefined) assert(text(item[key]), `${key} deve essere testo`);
    if (item.image) { const image = item.image; assert(text(image.alt) && text(image.credit) && text(image.license) && url(image.source_url) && url(image.license_url), 'Immagine: alt, credito, fonte e licenza richiesti'); assert(url(image.url) || /^assets\/[a-zA-Z0-9_./-]+$/.test(image.url) && !image.url.includes('..'), 'URL immagine non valido'); }
  }
  for (const item of stories) assert(text(item.category) && text(item.why_it_matters), 'Categoria e rilevanza richieste');
  if (data.status === 'draft') assert(!stories.length && !data.watchlist.length, 'Una bozza iniziale non deve contenere notizie');
  return data;
}
