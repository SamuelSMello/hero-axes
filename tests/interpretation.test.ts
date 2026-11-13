import test from "node:test";
import assert from "node:assert/strict";
import { assess, compatibility } from "../src/domain/assessment.ts";
import { AXES, type Profile } from "../src/domain/axes.ts";
import { interpretCharacter, interpretResult } from "../src/domain/interpretation.ts";
import { answersForProfile } from "../src/domain/synthetic.ts";
import { decodeSession, encodeSession, transition } from "../src/domain/session.ts";
const profile = Object.fromEntries(AXES.map(a=>[a.id,50])) as Profile;
const result = assess(answersForProfile(profile,"quick"),"quick");
test("explicação neutra usa valores e orientação reais, sem atribuir o editorial ao usuário",()=>{
 const text=interpretResult(result);
 assert.deepEqual(text.primary.similarities.map(a=>a.id),["strategy","dominance","impulsivity"]);
 assert.deepEqual(text.primary.differences.map(a=>a.id),["empathy","autonomy"]);
 assert.match(text.primary.similarities[0].explanation,/você 50.0\/100 \(Equilíbrio/);
 assert.match(text.primary.similarities[0].explanation,/Planejamento variável/);
 assert.equal(text.categories.find(c=>c.classification==="vilão")!.matches[0].character.classification,"vilão");
});
test("contribuições reconciliam RMS e diferença entre primeiro e segundo",()=>{
 const text=interpretResult(result), first=result.ranking[0], second=result.ranking[1];
 const mse=text.primary.axes.reduce((s,a)=>s+a.contribution,0);
 assert.ok(Math.abs(100-Math.sqrt(mse)-first.compatibility)<1e-10);
 assert.ok(Math.abs(text.comparison!.gain-((100-second.compatibility)**2-(100-first.compatibility)**2))<1e-9);
 assert.ok(text.comparison!.contributions.some(a=>a.advantage<0));
});
test("pesos mudam contribuição, empates seguem ordem e limites preservam polos",()=>{
 const character={...result.ranking[0].character,profile:{...profile,impulsivity:0,dominance:100}};
 const custom={...result,profile:{...profile,impulsivity:100,dominance:0},weights:{...result.weights,impulsivity:4}};
 const text=interpretCharacter(custom,character);
 assert.equal(text.differences[0].id,"impulsivity");
 assert.match(text.axes[3].explanation,/Reação imediata/);
 assert.match(text.axes[4].explanation,/Decisão distribuída/);
 assert.deepEqual(text.similarities.map(a=>a.id),["strategy","empathy","autonomy"]);
 const identical=interpretCharacter({...result,profile:character.profile},character);
 assert.ok(identical.axes.every(a=>a.contribution===0));
 assert.throws(()=>interpretCharacter({...result,weights:{...result.weights,risk:0}},character));
 assert.throws(()=>interpretCharacter({...result,profile:{...profile,risk:101}},character));
});
test("empate de ranking não declara vencedor e não confunde cobertura",()=>{
 const first=result.ranking[0];
 const tied={...result,ranking:[first,{...result.ranking[1],compatibility:first.compatibility}]};
 assert.match(interpretResult(tied).comparison!.explanation,/Empate matemático/);
 assert.equal(result.confidence.coverage,1);
 assert.ok(compatibility(result.profile,first.character.profile)<100);
});
test("snapshot anterior continua idêntico após interpretar, restaurar e continuar",()=>{
 const session={phase:"result" as const,mode:"quick" as const,index:15,answers:result.answers,history:[result]};
 const raw=encodeSession(session), restored=decodeSession(raw);
 assert.deepEqual(interpretResult(restored.history[0]),interpretResult(result));
 assert.equal(encodeSession(restored),raw);
 const next=transition(restored,{type:"continue"});
 assert.equal(next.index,16);assert.equal(next.mode,"full");assert.deepEqual(next.history,session.history);
 assert.deepEqual(next.answers,result.answers);
});
test("limites 40/60 são equilibrados e polos vêm do snapshot",()=>{
 for(const [value,expected] of [[0,"Pausa antes de reagir"],[39.99,"Pausa antes de reagir"],[40,"Equilíbrio entre os dois polos"],[60,"Equilíbrio entre os dois polos"],[60.01,"Reação imediata"],[100,"Reação imediata"]] as const){
  const snapshot={...result,profile:{...profile,impulsivity:value}};
  assert.ok(interpretCharacter(snapshot,result.ranking[0].character).axes[3].explanation.includes(expected));
 }
 const snapshot={...result,definition:{...result.definition,axes:result.definition.axes.map(a=>({...a,low:"Polo armazenado"}))},profile:{...profile,impulsivity:0}};
 // A historical editorial label is intentionally outside today's literal label types.
 assert.match(interpretResult(snapshot as unknown as typeof result).primary.axes[3].explanation,/Polo armazenado/);
});
test("empate com perfis equidistantes e ausência de segundo colocado",()=>{
 const [a,b]=result.ranking;
 const midpoint=Object.fromEntries(AXES.map(axis=>[axis.id,(a.character.profile[axis.id]+b.character.profile[axis.id])/2])) as Profile;
 const ranking=[a,b].map(r=>({...r,compatibility:compatibility(midpoint,r.character.profile)}));
 assert.equal(ranking[0].compatibility,ranking[1].compatibility);
 assert.equal(interpretResult({...result,profile:midpoint,ranking}).comparison!.tied,true);
 assert.equal(interpretResult({...result,ranking:[a]}).comparison,null);
});
