import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { AXES, AXIS_WEIGHTS, assertProfile, describeAxis, type Profile } from "../src/domain/axes.ts";
import { CATALOG, ALLOWED_CHARACTERS, validateCatalog } from "../src/domain/catalog.ts";
import { QUESTIONS, questionsFor, validateQuestions, answerOptions, type Answer, type Mode } from "../src/domain/questions.ts";
import { assess, calculateAxes, compatibility, continueToFull, normalizeResponse, questionnaireConfidence, rankCharacters, resultAxisRows, type Answers } from "../src/domain/assessment.ts";

function uniform(value: number): Profile { return Object.fromEntries(AXES.map(a=>[a.id,value])) as Profile; }
function responses(profile: Profile, mode: Mode = "full"): Answers {
 return Object.fromEntries(questionsFor(mode).map(q=>{
  const raw = q.polarity===1 ? profile[q.axis] : 100-profile[q.axis];
  return [q.id,(Math.round(raw/25)+1) as Answer];
 }));
}
test("allowlist exata de 24 identidades Marvel, sem DC",()=>{
 assert.equal(CATALOG.length,24);
 assert.deepEqual(CATALOG.map(c=>c.id).sort(),Object.keys(ALLOWED_CHARACTERS).sort());
 assert.ok(CATALOG.every(c=>c.publisher==="Marvel" && c.continuity.includes("Terra-616")));
 assert.ok(!JSON.stringify(CATALOG).match(/batman|wonder-woman|superman|Mulher-Maravilha/i));
 assert.ok(Object.isFrozen(CATALOG));
 for (const c of CATALOG) { assertProfile(c.profile); assert.equal(Object.keys(c.rationale).length,8); }
});
test("importação rejeita publisher forjado, substituição, nome trocado, duplicatas e catálogo parcial",()=>{
 const copy = ()=>structuredClone([...CATALOG]);
 const dc = copy(); Object.assign(dc[0],{id:"batman",name:"Batman",publisher:"Marvel"});
 assert.throws(()=>validateCatalog(dc));
 const wrongName=copy();wrongName[0].name="Batman";assert.throws(()=>validateCatalog(wrongName));
 const publisher=copy();Object.assign(publisher[0],{publisher:"DC"});assert.throws(()=>validateCatalog(publisher));
 const duplicate=copy();duplicate[1]=duplicate[0];assert.throws(()=>validateCatalog(duplicate));
 assert.throws(()=>validateCatalog(CATALOG.slice(1)));
 const bad=copy();bad[0].profile.empathy=NaN;assert.throws(()=>validateCatalog(bad));
 const rationale=copy();rationale[0].rationale.empathy="";assert.throws(()=>validateCatalog(rationale));
 assert.throws(()=>validateCatalog(null));
});
test("perfis rejeitam chaves extras, faltantes e valores inválidos",()=>{
 assert.throws(()=>assertProfile({...uniform(50),power:10}));
 const missing: Partial<Profile> = uniform(50);delete missing.risk;assert.throws(()=>assertProfile(missing));
 for(const value of [-1,101,NaN,Infinity])assert.throws(()=>assertProfile(uniform(value)));
});
test("16 fundamentais e 24 adicionais, oito eixos comuns e prefixo preservado",()=>{
 validateQuestions(QUESTIONS);
 assert.equal(questionsFor("quick").length,16);assert.equal(questionsFor("full").length,40);
 assert.deepEqual(questionsFor("full").slice(0,16),questionsFor("quick"));
 for(const axis of AXES){
  const items=QUESTIONS.filter(q=>q.axis===axis.id);
  assert.equal(items.length,5);assert.equal(items.filter(q=>q.core).length,2);
  assert.deepEqual(items.filter(q=>q.core).map(q=>q.polarity),[1,-1]);
 }
 for(const q of QUESTIONS){assert.equal(answerOptions(q).length,5);assert.equal(answerOptions(q)[0].value,1);assert.equal(answerOptions(q)[4].value,5);}
 assert.throws(()=>validateQuestions(QUESTIONS.slice(1)));
 assert.throws(()=>validateQuestions(QUESTIONS.map((q,i)=>i===0 ? {...q,weight:0}:q)));
});
test("neutralidade igual a 50 em ambos os modos",()=>{
 for(const mode of ["quick","full"] as const)assert.deepEqual(calculateAxes(responses(uniform(50),mode),mode),uniform(50));
});
test("extremos 0 e 100 em todos os eixos e modos",()=>{
 for(const mode of ["quick","full"] as const)for(const value of [0,100])
  assert.deepEqual(calculateAxes(responses(uniform(value),mode),mode),uniform(value));
});
test("polaridade invertida e escala 1–5",()=>{
 assert.equal(normalizeResponse(1,1),0);assert.equal(normalizeResponse(5,1),100);
 assert.equal(normalizeResponse(1,-1),100);assert.equal(normalizeResponse(5,-1),0);
 assert.equal(normalizeResponse(3,-1),50);
 for(const value of [0,6,2.5,NaN])assert.throws(()=>normalizeResponse(value,1));
});
test("sem respostas: eixos ausentes são null, matching não é permitido",()=>{
 assert.deepEqual(Object.values(calculateAxes({},"quick")),Array(8).fill(null));
 assert.throws(()=>assess({},"quick"),/Conclua/);
 const partial=calculateAxes({"strategy-1":5},"quick");
 assert.equal(partial.strategy,100);assert.equal(partial.empathy,null);
 assert.throws(()=>assess({"strategy-1":5},"quick"),/Conclua/);
 assert.throws(()=>calculateAxes({unknown:3},"quick"));
 assert.throws(()=>calculateAxes({"strategy-1":null} as unknown as Answers,"quick"));
 assert.throws(()=>calculateAxes({"strategy-1":6} as unknown as Answers,"quick"));
});
test("média ponderada usa respostas invertidas, sem somar eixos a 100",()=>{
 const answers=responses(uniform(50),"quick");
 const edited={...answers,"strategy-1":5,"strategy-2":3} as Answers;
 assert.equal(calculateAxes(edited,"quick").strategy,75);
 assert.equal(Object.values(calculateAxes(answers,"quick")).reduce<number>((s,v)=>s+(v??0),0),400);
});
test("compatibilidade idêntica, distância máxima, simetria e pesos",()=>{
 const neutral=uniform(50);
 assert.equal(compatibility(neutral,neutral),100);
 assert.equal(compatibility(uniform(0),uniform(100)),0);
 assert.equal(compatibility(uniform(0),neutral),compatibility(neutral,uniform(0)));
 const changed={...neutral,strategy:100};
 assert.ok(Math.abs(compatibility(neutral,changed)-(100-Math.sqrt(2500/8)))<1e-10);
 assert.ok(compatibility(neutral,changed,{...AXIS_WEIGHTS,strategy:5})<compatibility(neutral,changed));
 assert.throws(()=>compatibility(neutral,changed,{...AXIS_WEIGHTS,strategy:0}));
 assert.throws(()=>compatibility(neutral,changed,{...AXIS_WEIGHTS,risk:NaN}));
});
test("perfil de cada personagem é seu próprio melhor matching",()=>{
 for(const character of CATALOG){
  const ranking=rankCharacters(character.profile);
  assert.equal(ranking.find(r=>r.character.id===character.id)?.compatibility,100);
  assert.equal(ranking[0].compatibility,100);
 }
});
test("perfis sintéticos têm relações comportamentais coerentes",()=>{
 const cases = [
  {p:{strategy:100,empathy:50,autonomy:100,impulsivity:0,dominance:75,cooperation:50,risk:50,flexibility:75}, near:"doctor-strange",far:"hulk"},
  {p:{strategy:75,empathy:100,autonomy:75,impulsivity:25,dominance:25,cooperation:100,risk:75,flexibility:75},near:"captain-america",far:"red-skull"},
  {p:{strategy:25,empathy:50,autonomy:100,impulsivity:100,dominance:50,cooperation:25,risk:100,flexibility:25},near:"hulk",far:"kingpin"},
  {p:{strategy:100,empathy:0,autonomy:100,impulsivity:25,dominance:100,cooperation:25,risk:75,flexibility:25},near:"red-skull",far:"spider-man"},
 ];
 for(const c of cases){
  const result=assess(responses(c.p),"full");
  assert.deepEqual(result.profile,c.p);
  const score=(id:string)=>result.ranking.find(r=>r.character.id===id)!.compatibility;
  assert.ok(score(c.near)>score(c.far),c.near+" deveria estar mais próximo");
 }
});
test("resultado determinístico e desempate estável por ID",()=>{
 const answers=responses(uniform(50));
 assert.deepEqual(assess(answers,"full"),assess({...answers},"full"));
 const ranked=rankCharacters(uniform(50));
 assert.deepEqual(ranked,rankCharacters(uniform(50)));
 for(let i=1;i<ranked.length;i++)if(ranked[i].compatibility===ranked[i-1].compatibility)
  assert.ok(ranked[i-1].character.id<ranked[i].character.id);
});
test("confiança descritiva é separada da compatibilidade",()=>{
 const quick=assess(responses(uniform(50),"quick"),"quick");
 const full=assess(responses(uniform(50)),"full");
 assert.deepEqual(quick.profile,full.profile);
 assert.equal(quick.matches[0].compatibility,full.matches[0].compatibility);
 assert.equal(quick.confidence.coverage,1);assert.equal(quick.confidence.depth,.4);assert.equal(full.confidence.depth,1);
 const missing=questionnaireConfidence({},"quick");
 assert.equal(missing.coverage,0);assert.equal(missing.consistency,null);
 const inconsistent=Object.fromEntries(questionsFor("quick").map(q=>[q.id,5])) as Answers;
 assert.equal(questionnaireConfidence(inconsistent,"quick").consistency,0);
 // Neutral or consistent answers do not prove accuracy.
 assert.equal(quick.confidence.consistency,1);
});
test("continuação mantém respostas iniciais e inicia na pergunta 17",()=>{
 const answers=responses(uniform(75),"quick");
 const original=structuredClone(answers);
 const quick=assess(answers,"quick");const serialized=JSON.stringify(quick);
 const continuation=continueToFull(answers);
 assert.equal(continuation.nextIndex,16);assert.equal(continuation.mode,"full");
 assert.deepEqual(continuation.answers,original);
 const all={...responses(uniform(25)),...continuation.answers};
 const full=assess(all,"full");
 assert.equal(Object.keys(full.answers).length,40);
 for(const [id,value] of Object.entries(original))assert.equal(full.answers[id],value);
 assert.equal(JSON.stringify(quick),serialized);
 assert.ok(Object.isFrozen(quick.profile));
 assert.equal(quick.versions.catalog,full.versions.catalog);
 assert.throws(()=>continueToFull({}));
});
test("snapshot inclui versões, pesos, perguntas, catálogo e resultado sem reinterpretação",()=>{
 const result=assess(responses(uniform(50)),"full");
 const stored=JSON.parse(JSON.stringify(result));
 assert.deepEqual(stored,result);assert.equal(stored.schemaVersion,1);
 assert.equal(stored.definition.catalog.length,24);assert.equal(stored.definition.questions.length,40);
 assert.deepEqual(stored.weights,AXIS_WEIGHTS);
});
test("rótulos, gráficos e descrições usam os mesmos eixos do resultado",()=>{
 const result=assess(responses({strategy:100,empathy:75,autonomy:50,impulsivity:25,dominance:0,cooperation:100,risk:25,flexibility:75}),"full");
 const rows=resultAxisRows(result);
 assert.equal(rows.length,8);
 for(const row of rows){
  const definition=AXES.find(a=>a.id===row.id)!;
  assert.equal(row.value,result.profile[row.id]);assert.equal(row.label,definition.label);
  assert.equal(row.description,describeAxis(row.id,result.profile[row.id]));
  assert.equal(row.characterValues[0].value,result.matches[0].character.profile[row.id]);
 }
 assert.equal(describeAxis("impulsivity",0),"Pausa antes de reagir");
 assert.equal(describeAxis("dominance",100),"Controle concentrado");
 assert.equal(describeAxis("empathy",50),"Equilíbrio entre os dois polos");
 assert.throws(()=>describeAxis("risk",101));
 const page=readFileSync(new URL("../src/components/results.tsx",import.meta.url),"utf8");
 assert.ok(page.includes("resultAxisRows(result)"));assert.ok(page.includes("value={axis.value}"));
 assert.ok(page.includes("max={100}"));assert.ok(!page.includes("Math.random"));
});

test("chaves herdadas não substituem atributos próprios obrigatórios",()=>{
 const inherited=Object.assign(Object.create(uniform(50)),Object.fromEntries(AXES.map((_,i)=>["extra"+i,50])));
 assert.throws(()=>assertProfile(inherited));
 assert.throws(()=>compatibility(uniform(50),uniform(50),inherited));
});
test("desempate ordena perfis realmente equidistantes por ID",()=>{
 const left=CATALOG[0],right=CATALOG[1];
 const midpoint=Object.fromEntries(AXES.map(axis=>[axis.id,(left.profile[axis.id]+right.profile[axis.id])/2])) as Profile;
 const ranked=rankCharacters(midpoint);
 const leftIndex=ranked.findIndex(r=>r.character.id===left.id);
 const rightIndex=ranked.findIndex(r=>r.character.id===right.id);
 assert.equal(ranked[leftIndex].compatibility,ranked[rightIndex].compatibility);
 assert.ok(right.id < left.id ? rightIndex < leftIndex : leftIndex < rightIndex);
});
test("interpretação preserva polos do snapshot e limites 40/60",()=>{
 const original=assess(responses(uniform(100)),"full");
 const snapshot=structuredClone(original);
 Object.assign(snapshot.definition.axes[0],{high:"Polo preservado da versão anterior"});
 assert.equal(resultAxisRows(snapshot)[0].description,"Polo preservado da versão anterior");
 assert.equal(describeAxis("strategy",40),"Equilíbrio entre os dois polos");
 assert.equal(describeAxis("strategy",60),"Equilíbrio entre os dois polos");
 assert.equal(describeAxis("strategy",39),AXES[0].low);
 assert.equal(describeAxis("strategy",61),AXES[0].high);
});
