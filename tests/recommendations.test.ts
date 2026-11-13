import test from "node:test";
import assert from "node:assert/strict";
import { assess, type AssessmentResult } from "../src/domain/assessment.ts";
import { CATALOG } from "../src/domain/catalog.ts";
import { AXES, type Profile } from "../src/domain/axes.ts";
import { answersForProfile } from "../src/domain/synthetic.ts";
import { recommend, MAX_SHARED_DISTANCE } from "../src/core/recommendations.ts";
import type { RecommendationCatalog } from "../src/core/recommendation-types.ts";
import { RECOMMENDATION_CATALOG as catalog } from "../src/data/recommendation-catalog.ts";
const wanda=CATALOG.find(c=>c.id==="scarlet-witch")!;
const result=assess(answersForProfile(wanda.profile,"full"),"full");
const chosen=(r:ReturnType<typeof recommend>)=>r.slots.flatMap(s=>s.recommendation ? [s.recommendation] : []);
function snapshot(profile:Profile):AssessmentResult{return {...result,profile};}

test("catálogo tem relações e evidências rastreáveis para os 24 personagens",()=>{
 for(const entries of [catalog.works,catalog.evidence,catalog.sources])assert.equal(new Set(entries.map(e=>e.id)).size,entries.length);
 for(const c of CATALOG){
  assert.ok(catalog.evidence.some(e=>e.characterId===c.id && e.review==="source-verified"));
  const own=assess(answersForProfile(c.profile,"full"),"full");
  assert.ok(chosen(recommend(own,c.id,catalog,{includeSpoilers:true})).length,c.id);
 }
 for(const w of catalog.works){
  assert.ok(Number.isInteger(w.year));assert.ok(w.reference);assert.ok(w.sources.length);
  for(const p of w.participants){assert.ok(CATALOG.some(c=>c.id===p.characterId));assert.ok(p.incarnation);assert.ok(p.sourceIds.length);}
  for(const id of w.sources)assert.ok(catalog.sources.some(s=>s.id===id && s.checkedOn && s.url.startsWith("https://")));
 }
 for(const e of catalog.evidence){
  const work=catalog.works.find(w=>w.id===e.workId)!;
  assert.ok(work.participants.some(p=>p.characterId===e.characterId));
  assert.ok(e.manifestation && e.rationale && e.locator && e.sourceIds.length);
  assert.ok(e.sourceIds.every(id=>work.sources.includes(id)));
  assert.ok(AXES.some(a=>a.id===e.axis));
 }
});
test("seleção é determinística, independente da ordem e não modifica snapshots ou catálogo",()=>{
 const before=JSON.stringify({result,catalog});
 const a=recommend(result,wanda.id,catalog,{includeSpoilers:true});
 const reordered={...catalog,works:[...catalog.works].reverse(),evidence:[...catalog.evidence].reverse(),sources:[...catalog.sources].reverse()};
 assert.deepEqual(a,recommend(JSON.parse(JSON.stringify(result)),wanda.id,reordered,{includeSpoilers:true}));
 assert.equal(JSON.stringify({result,catalog}),before);
 assert.equal(new Set(chosen(a).map(c=>c.work.storyKey)).size,chosen(a).length);
});
test("cada motivo exige proximidade, mesmo polo, peso real e evidência do personagem",()=>{
 for(const character of CATALOG){
  const own=assess(answersForProfile(character.profile,"full"),"full");
  for(const item of chosen(recommend(own,character.id,catalog,{includeSpoilers:true})))for(const r of item.reasons){
   const axis=r.evidence.axis;
   assert.equal(r.evidence.characterId,character.id);
   assert.equal(r.evidence.workId,item.work.id);
   assert.ok(Math.abs(r.userValue-r.characterValue)<=MAX_SHARED_DISTANCE);
   assert.equal(r.evidence.pole,"high");assert.ok(r.userValue>60 && r.characterValue>60);
   assert.ok(r.explanation.includes(r.userValue.toFixed(1)));
   assert.equal(r.userValue,own.profile[axis]);
  }
 }
});
test("neutro, polos opostos, catálogo vazio e versão não revisada têm fallback explícito",()=>{
 const neutral=Object.fromEntries(AXES.map(a=>[a.id,50])) as Profile;
 for(const selected of [recommend(snapshot(neutral),wanda.id,catalog),recommend(result,wanda.id,{...catalog,works:[]}),recommend({...result,versions:{...result.versions,algorithm:"future"}},wanda.id,catalog)]){
  assert.equal(chosen(selected).length,0);assert.ok(selected.slots.every(s=>s.fallback));
 }
 const opposite={...result.profile,empathy:0,risk:0,cooperation:0,flexibility:0};
 assert.equal(chosen(recommend(snapshot(opposite),wanda.id,catalog,{includeSpoilers:true})).length,0);
});
test("spoilers importantes ficam ocultos inclusive quando a associação revela a trama",()=>{
 const hidden=chosen(recommend(result,wanda.id,catalog));
 assert.ok(!hidden.some(c=>c.work.id==="wandavision"));
 assert.ok(chosen(recommend(result,wanda.id,catalog,{includeSpoilers:true})).some(c=>c.work.id==="wandavision"));
 for(const c of hidden){assert.notEqual(c.work.spoilers,"major");assert.ok(c.reasons.every(r=>r.evidence.spoilers!=="major"));}
 const hela=CATALOG.find(c=>c.id==="hela")!;
 const own=assess(answersForProfile(hela.profile,"full"),"full");
 const onlyFilm={...catalog,works:catalog.works.filter(w=>w.id==="ragnarok-film")};
 assert.equal(chosen(recommend(own,hela.id,onlyFilm)).length,0,"Spoiler da evidência é filtrado mesmo com obra marcada apenas como premissa");
 assert.equal(chosen(recommend(own,hela.id,onlyFilm,{includeSpoilers:true})).length,1);
});
test("participação sem traço, cameo, revisão pendente e fonte ausente não geram indicação",()=>{
 const only=(patch:Partial<RecommendationCatalog>)=>({...catalog,...patch});
 for(const edited of [only({evidence:[]}),only({works:catalog.works.map(w=>({...w,review:"pending"}))}),only({works:catalog.works.map(w=>({...w,participants:w.participants.map(p=>({...p,role:"cameo"}))}))}),only({sources:[]}),only({evidence:catalog.evidence.map(e=>({...e,review:"pending"}))})]){
  assert.equal(chosen(recommend(result,wanda.id,edited,{includeSpoilers:true})).length,0);
 }
 const killmonger=CATALOG.find(c=>c.id==="killmonger")!;
 const own=assess(answersForProfile(killmonger.profile,"full"),"full");
 assert.ok(!chosen(recommend(own,killmonger.id,catalog,{includeSpoilers:true})).some(c=>c.work.id==="killmonger-plot"));
 assert.ok(!chosen(recommend(own,killmonger.id,{...catalog,works:catalog.works.filter(w=>w.id==="panther-film")},{includeSpoilers:true})).length);
});
test("limite de distância é inclusivo, limites 40/60 são neutros e pesos não se confundem com polos",()=>{
 const onlyDoor={...catalog,works:catalog.works.filter(w=>w.id==="last-door")};
 assert.equal(chosen(recommend(snapshot({...result.profile,empathy:70}),wanda.id,onlyDoor)).length,1);
 assert.equal(chosen(recommend(snapshot({...result.profile,empathy:69.99}),wanda.id,onlyDoor)).length,0);
 for(const empathy of [40,60])assert.equal(chosen(recommend(snapshot({...result.profile,empathy}),wanda.id,onlyDoor)).length,0);
 const weighted={...result,weights:{...result.weights,empathy:4}};
 const r=chosen(recommend(weighted,wanda.id,onlyDoor))[0].reasons[0];
 const total=Object.values(weighted.weights).reduce((s,v)=>s+v,0);
 assert.equal(r.weightedError,4*(weighted.profile.empathy-wanda.profile.empathy)**2/total);
 assert.ok(chosen(recommend(weighted,wanda.id,onlyDoor))[0].score>chosen(recommend(result,wanda.id,onlyDoor))[0].score);
});
test("empates usam ID estável, diversidade premia novo eixo e reedições não repetem a história",()=>{
 const base=catalog.works.find(w=>w.id==="last-door")!;
 const evidence=catalog.evidence.find(e=>e.workId===base.id)!;
 const fixture:RecommendationCatalog={...catalog,works:[{...base,id:"a",storyKey:"same"},{...base,id:"b",storyKey:"same"},{...base,id:"c",storyKey:"another"}],evidence:[{...evidence,id:"a",workId:"a"},{...evidence,id:"b",workId:"b"},{...evidence,id:"c",workId:"c",axis:"risk"}]};
 const r=recommend(result,wanda.id,fixture);
 assert.deepEqual(chosen(r).map(c=>c.work.id),["a","c"]);
 assert.equal(r.slots[0].recommendation,null);
 // A competing new story with the same axis loses to c's new-axis bonus.
 const withExtra={...fixture,works:[...fixture.works,{...base,id:"aa",storyKey:"third"}],evidence:[...fixture.evidence,{...evidence,id:"aa",workId:"aa"}]};
 assert.equal(recommend(result,wanda.id,withExtra).slots[2].recommendation!.work.id,"c");
});
test("motor aceita polo baixo apenas quando ambos os valores e a evidência o sustentam",()=>{
 const doom=CATALOG.find(c=>c.id==="doctor-doom")!;
 const own=assess(answersForProfile(doom.profile,"full"),"full");
 const work=catalog.works.find(w=>w.id==="one-world-doom")!;
 const evidence=catalog.evidence.find(e=>e.workId===work.id)!;
 // Artificial evidence to exercise generic low-pole handling, not editorial catalogue content.
 const fixture={...catalog,works:[work],evidence:[{...evidence,axis:"empathy" as const,pole:"low" as const}]};
 const r=chosen(recommend(own,doom.id,fixture))[0].reasons[0];
 assert.match(r.explanation,/Distanciamento afetivo/);
 assert.equal(chosen(recommend({...own,profile:{...own.profile,empathy:80}},doom.id,fixture)).length,0);
});
