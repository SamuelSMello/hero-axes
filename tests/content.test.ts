import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { AXES } from "../src/domain/axes.ts";
import { CATALOG } from "../src/domain/catalog.ts";
import { QUESTIONS,questionsFor,QUESTIONNAIRE_VERSION } from "../src/domain/questions.ts";
test("as 16 perguntas fundamentais preservam conteúdo, IDs, ordem, peso e polaridade",()=>{
 const hash=createHash("sha256").update(JSON.stringify(questionsFor("quick"))).digest("hex");
 assert.equal(hash,"aa3c94cb160677a6264ece36d72974916d01f45dafc0ccbf8dadb0278d1d58d3");
 assert.deepEqual(questionsFor("full").slice(0,16),questionsFor("quick"));
 assert.equal(QUESTIONNAIRE_VERSION,"behavioral-1.1.0");
});
test("os 40 dilemas não mencionam personagens e cobrem 2+3 por eixo",()=>{
 const seen=new Set<string>();
 for(const q of QUESTIONS){
  assert.ok(!seen.has(q.text));seen.add(q.text);
  assert.ok(!/Batman|Thor|Loki|Hulk|Stark|Wakanda|Vingadores|aranha/i.test(q.text+q.left+q.right));
 }
 for(const a of AXES){
  assert.equal(QUESTIONS.filter(q=>q.axis===a.id&&q.core).length,2);
  assert.equal(QUESTIONS.filter(q=>q.axis===a.id&&!q.core).length,3);
 }
});
test("catálogo mantém todas as pontuações da sprint anterior e identidade editorial",()=>{
 const expected:Record<string,number[]>={
  "iron-man":[90,55,90,60,75,60,85,80],"captain-america":[85,90,80,25,45,95,80,60],
  "spider-man":[65,95,75,65,20,70,80,90],thor:[55,75,80,75,65,80,95,55],hulk:[20,60,95,95,55,25,95,30],
  "doctor-strange":[95,65,90,20,75,55,75,80],"black-panther":[95,80,85,20,70,80,60,75],
  "black-widow":[90,65,85,25,40,75,75,90],hawkeye:[70,80,80,65,30,85,85,80],
  "scarlet-witch":[55,85,80,65,40,70,75,70],wolverine:[65,65,95,80,35,60,95,45],
  daredevil:[80,90,90,60,45,55,90,40],"doctor-doom":[98,20,98,35,100,25,70,55],
  thanos:[95,10,95,30,95,15,90,35],ultron:[90,5,95,45,100,10,80,65],loki:[90,45,95,55,70,40,85,95],
  magneto:[90,55,95,55,90,60,85,50],"red-skull":[90,0,90,45,100,15,65,20],
  "green-goblin":[85,10,90,90,95,20,95,60],kingpin:[95,20,90,25,95,40,45,60],
  kang:[98,15,95,30,95,25,90,80],hela:[85,15,90,30,95,30,60,35],
  mysterio:[90,20,80,55,75,35,65,90],killmonger:[90,30,95,65,90,45,90,45],
 };
 assert.deepEqual(CATALOG.map(c=>c.id).sort(),Object.keys(expected).sort());
 for(const c of CATALOG)assert.deepEqual(AXES.map(a=>c.profile[a.id]),expected[c.id]);
});
test("Sprint 4B preserva domínio, interpretação, sessão e dependências byte a byte",()=>{
 const baseline=JSON.parse(readFileSync(new URL("./fixtures/sprint4b-contracts.json",import.meta.url),"utf8")) as Record<string,string>;
 for(const [file,hash] of Object.entries(baseline)){
  const content=readFileSync(new URL("../"+file,import.meta.url));
  assert.equal(createHash("sha256").update(content).digest("hex"),hash,file+" foi alterado");
 }
});
