import test from "node:test";
import assert from "node:assert/strict";
import { AXES,type Profile } from "../src/domain/axes.ts";
import { CATALOG } from "../src/domain/catalog.ts";
import { assess,calculateAxes,rankCharacters } from "../src/domain/assessment.ts";
import { questionsFor } from "../src/domain/questions.ts";
import { answersForProfile,catalogReachability,rawAuditAnswers,SYNTHETIC_SCENARIOS } from "../src/domain/synthetic.ts";
import { matchingDiagnostics } from "../src/domain/result-diagnostics.ts";
test("24 personagens têm testemunhas realizáveis nos dois modos, não só perfis impossíveis",()=>{
 for(const mode of ["quick","full"] as const){
  const rows=catalogReachability(mode);
  assert.equal(rows.length,24);
  for(const row of rows){
   assert.equal(row.reachable,true,row.id+" em "+mode);
   assert.equal(Object.keys(row.answers).length,questionsFor(mode).length);
   assert.ok(Object.values(row.answers).every(v=>Number.isInteger(v)&&v>=1&&v<=5));
  }
 }
});
test("síntese respeita a resolução de 12,5 no rápido e 5 no completo",()=>{
 for(const mode of ["quick","full"] as const)for(const c of CATALOG){
  const p=calculateAxes(answersForProfile(c.profile,mode),mode) as Profile;
  const halfStep=mode==="quick"?6.25:2.5;
  for(const a of AXES)assert.ok(Math.abs(p[a.id]-c.profile[a.id])<=halfStep);
 }
});
test("12 cenários distintos, perfis calculados e ranking são reproduzíveis",()=>{
 assert.equal(SYNTHETIC_SCENARIOS.length,12);
 assert.equal(new Set(SYNTHETIC_SCENARIOS.map(s=>JSON.stringify(s.profile))).size,12);
 for(const mode of ["quick","full"] as const)for(const scenario of SYNTHETIC_SCENARIOS){
  const answers=answersForProfile(scenario.profile,mode);
  const result=assess(answers,mode);
  assert.deepEqual(result.profile,calculateAxes(answers,mode));
  assert.deepEqual(result,assess({...answers},mode));
  assert.ok(result.ranking.every(r=>CATALOG.some(c=>c.id===r.character.id)));
 }
});
test("respostas independentes e todas as posições mantêm indicadores distintos",()=>{
 for(const mode of ["quick","full"] as const){
  const answers=rawAuditAnswers(17,mode);
  assert.deepEqual(answers,rawAuditAnswers(17,mode));
  const result=assess(answers,mode);
  assert.equal(result.confidence.coverage,1);
  assert.equal(result.confidence.depth,mode==="quick"?.4:1);
  assert.notEqual(result.confidence.consistency! * 100,result.matches[0].compatibility);
 }
 for(const value of [1,2,3,4,5] as const){
  const answers=Object.fromEntries(questionsFor("quick").map(q=>[q.id,value]));
  assert.deepEqual(Object.values(calculateAxes(answers,"quick")),Array(8).fill(50));
 }
});
test("perfil neutro é Scarlet Witch por geometria do catálogo, com lacuna explícita em autonomia",()=>{
 const profile=SYNTHETIC_SCENARIOS[0].profile;
 const result=assess(answersForProfile(profile,"full"),"full");
 assert.equal(result.matches[0].character.id,"scarlet-witch");
 assert.ok(Math.abs(result.matches[0].compatibility-77.92059783418038)<1e-9);
 const diagnostic=matchingDiagnostics(result);
 assert.ok(diagnostic.outside.some(a=>a.axis==="autonomy"&&a.min===75&&a.value===50));
 assert.equal(result.confidence.consistency,1);
 assert.notEqual(result.matches[0].compatibility,100);
});
test("preferência por orientação e baixo risco não é confundida com centralização",()=>{
 const scenario=SYNTHETIC_SCENARIOS.find(s=>s.id==="cautious-collaborator")!;
 const result=assess(answersForProfile(scenario.profile,"full"),"full");
 assert.equal(result.profile.autonomy,20);assert.equal(result.profile.dominance,10);
 assert.equal(result.profile.risk,10);
 const outside=matchingDiagnostics(result).outside.map(a=>a.axis);
 assert.ok(outside.includes("autonomy"));assert.ok(outside.includes("risk"));
});
test("mudanças locais de um item afetam só o eixo declarado e deixam o ranking matemático válido",()=>{
 const answers=answersForProfile(SYNTHETIC_SCENARIOS[0].profile,"full");
 const original=calculateAxes(answers,"full");
 for(const q of questionsFor("full")){
  const changed=calculateAxes({...answers,[q.id]:5},"full");
  for(const a of AXES)if(a.id!==q.axis)assert.equal(changed[a.id],original[a.id]);
  const ranked=rankCharacters(changed as Profile);
  assert.ok(ranked.every(r=>r.compatibility>=0&&r.compatibility<=100));
 }
});
