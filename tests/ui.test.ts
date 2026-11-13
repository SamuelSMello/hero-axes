import test from "node:test";
import assert from "node:assert/strict";
import { registerUiTestLoader } from "../scripts/register-ui-test-loader.mjs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { assess } from "../src/domain/assessment.ts";
import { AXES, type Profile } from "../src/domain/axes.ts";
import { answersForProfile, SYNTHETIC_SCENARIOS } from "../src/domain/synthetic.ts";
import { interpretResult } from "../src/domain/interpretation.ts";
import { CATALOG } from "../src/domain/catalog.ts";
import { RECOMMENDATION_CATALOG } from "../src/data/recommendation-catalog.ts";
import { recommend } from "../src/core/recommendations.ts";

// Exercise real React markup without a browser or additional dependencies.
const hook=registerUiTestLoader();
const {Results}=await import("../src/components/results.tsx");
const {Button,QuizOption,Progress}=await import("../src/components/ui.tsx");
hook.deregister();
function attributes(tag:string){return Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));}

test("React renderiza meters com os mesmos valores calculados nos dois modos e 12 perfis",()=>{
 for(const mode of ["quick","full"] as const)for(const scenario of SYNTHETIC_SCENARIOS){
  const result=assess(answersForProfile(scenario.profile,mode),mode);
  const raw=JSON.stringify(result);
  const html=renderToStaticMarkup(createElement(Results,{result,heading:null}));
  const meters=[...html.matchAll(/<meter\b[^>]*>/g)].map(m=>attributes(m[0]));
  assert.equal(meters.length,8+8*result.matches.length);
  for(const axis of AXES){
   assert.equal(meters.find(m=>m["aria-label"]===axis.label)?.value,String(result.profile[axis.id]));
   for(const match of result.matches){
    assert.equal(meters.find(m=>m["aria-label"]===axis.label+" / "+match.character.name)?.value,String(match.character.profile[axis.id]));
   }
  }
  for(const category of interpretResult(result).categories)for(const match of category.matches){
   assert.ok(html.includes(match.character.name));
   assert.ok(html.includes(match.compatibility.toFixed(1)+"%"));
  }
  assert.equal(JSON.stringify(result),raw,"Renderização não deve alterar o snapshot");
 }
});
test("empates gerais mantêm todos os vencedores visíveis e análise identificada",()=>{
 const profile=Object.fromEntries(AXES.map(a=>[a.id,50])) as Profile;
 const result=assess(answersForProfile(profile,"quick"),"quick");
 // Synthetic display fixture; scoring and persisted real results are unchanged.
 const tied={...result,matches:result.ranking.slice(0,2)};
 const html=renderToStaticMarkup(createElement(Results,{result:tied,heading:null}));
 assert.equal((html.match(/class="card winner-card"/g)||[]).length,2);
 assert.ok(html.includes("Empate matemático"));
 assert.ok(html.includes("primeiro na ordem de exibição"));
 assert.ok(!html.includes("<img"));
});
test("estados de botões, alternativas e progresso preservam semântica nativa",()=>{
 const button=renderToStaticMarkup(createElement(Button,{loading:true},"Restaurando"));
 assert.match(button,/disabled=""/);assert.match(button,/aria-busy="true"/);
 const option=renderToStaticMarkup(createElement(QuizOption,{number:1,label:"Alternativa A",name:"q1",checked:true,onChange:()=>{}}));
 assert.match(option,/type="radio"/);assert.match(option,/checked=""/);assert.match(option,/is-selected/);
 const progress=renderToStaticMarkup(createElement(Progress,{value:16,max:40}));
 assert.match(progress,/aria-valuenow="16"/);assert.match(progress,/aria-valuemax="40"/);assert.match(progress,/width:40%/);
});
test("seção de histórias renderiza só os candidatos calculados sem spoilers e sem imagens",()=>{
 const wanda=CATALOG.find(c=>c.id==="scarlet-witch")!;
 const result=assess(answersForProfile(wanda.profile,"full"),"full");
 const selection=recommend(result,wanda.id,RECOMMENDATION_CATALOG);
 const html=renderToStaticMarkup(createElement(Results,{result,heading:null}));
 const displayed=[...html.matchAll(/data-work-id="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(displayed,selection.slots.flatMap(s=>s.recommendation ? [s.recommendation.work.id] : []));
 assert.ok(html.includes("Explore sua personalidade no universo Marvel"));
 assert.ok(!displayed.includes("wandavision"));assert.ok(!html.includes("<img"));
 assert.ok(html.includes("Curadoria marvel-stories-1.0.0"));
});
