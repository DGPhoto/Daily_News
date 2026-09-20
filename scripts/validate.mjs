import { readFile, readdir } from 'node:fs/promises';
import { validateBriefing, validateArchive } from '../js/data.js';
const read = async path => JSON.parse(await readFile(new URL(`../${path}`,import.meta.url),'utf8'));
try {
  const latest=validateBriefing(await read('data/latest.json'));
  const demo=validateBriefing(await read('data/example.json'));
  const index=validateArchive(await read('data/archive/index.json'));
  if(demo.status!=='demo'||latest.status==='demo') throw Error('Demo non separata');
  const files=(await readdir(new URL('../data/archive/',import.meta.url))).filter(n=>n.endsWith('.json')&&n!=='index.json');
  if(files.length!==index.dates.length) throw Error('Indice e archivio non corrispondono');
  for(const date of index.dates){const d=validateBriefing(await read(`data/archive/${date}.json`));if(d.date!==date||d.status!=='published')throw Error('Edizione storica non valida');}
  if(latest.status==='published'){
    if(latest.date!==[...index.dates].sort().at(-1))throw Error('latest non è la data più recente');
    if(JSON.stringify(latest)!==JSON.stringify(await read(`data/archive/${latest.date}.json`)))throw Error('latest e archivio diversi');
  }
  console.log(`Contenuti validi, ${index.dates.length} edizioni archiviate.`);
}catch(e){console.error(e.message);process.exitCode=1;}
