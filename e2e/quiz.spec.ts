import { test,expect,type Page } from "@playwright/test";
import { AXES } from "../src/domain/axes.ts";
import { assess,type Answers,type AssessmentResult } from "../src/domain/assessment.ts";
import { STORAGE_KEY, encodeSession } from "../src/domain/session.ts";
import { questionsFor } from "../src/domain/questions.ts";
import { answersForProfile,SYNTHETIC_SCENARIOS } from "../src/domain/synthetic.ts";
import { CATALOG } from "../src/domain/catalog.ts";
import { RECOMMENDATION_CATALOG } from "../src/data/recommendation-catalog.ts";
import { recommend } from "../src/core/recommendations.ts";

test("recomendações por traço, fontes e spoilers preservam o snapshot",async({page})=>{
 await ready(page);
 const wanda=CATALOG.find(c=>c.id==="scarlet-witch")!;
 const answers=answersForProfile(wanda.profile,"full"),result=assess(answers,"full");
 const raw=encodeSession({phase:"result",mode:"full",index:39,answers,history:[result]});
 await page.evaluate(({key,value})=>localStorage.setItem(key,value),{key:STORAGE_KEY,value:raw});
 await page.reload();await checkResult(page,result);
 const section=page.getByRole("region",{name:"Explore sua personalidade no universo Marvel"});
 await expect(section).toBeVisible();
 await expect(section.getByRole("heading",{name:"WandaVision",exact:true})).toHaveCount(0);
 const before=await page.evaluate(key=>localStorage.getItem(key),STORAGE_KEY);
 await section.getByRole("checkbox").check();
 const expected=recommend(result,wanda.id,RECOMMENDATION_CATALOG,{includeSpoilers:true});
 const items=expected.slots.flatMap(s=>s.recommendation ? [s.recommendation] : []);
 await expect(section.locator("[data-work-id]")).toHaveCount(items.length);
 for(const item of items){
  const card=section.locator(`[data-work-id="${item.work.id}"]`);
  await expect(card.getByRole("heading",{name:item.work.title,exact:true})).toBeVisible();
  await card.getByText("Por que esta história combina com seu perfil?",{exact:true}).click();
  await expect(card.getByText(item.reasons[0].explanation,{exact:true})).toBeVisible();
  const official=item.work.links.find(l=>l.official);
  if(official)await expect(card.getByRole("link",{name:/Abrir referência oficial/})).toHaveAttribute("href",official.url);
 }
 expect(await page.evaluate(key=>localStorage.getItem(key),STORAGE_KEY)).toBe(before);
 await noOverflow(page);await page.reload();
 await expect(section.getByRole("checkbox")).not.toBeChecked();
 await checkResult(page,result);
});

async function ready(page:Page) {
 await page.goto("/");
 await expect(page.getByRole("button",{name:/Modo rápido/})).toBeEnabled();
}
async function noOverflow(page:Page) {
 expect(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth+1)).toBe(true);
}

for(const width of [320,375,768,1024,1440]){
 test(`redesign responsivo: home, pergunta e resultado em ${width}px`,async({page},testInfo)=>{
  await page.setViewportSize({width,height:1000});
  await page.emulateMedia({reducedMotion:"reduce"});
  await ready(page);await noOverflow(page);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link",{name:"Pular para o conteúdo"})).toBeFocused();
  await page.keyboard.press("Enter");await expect(page.locator("main")).toBeFocused();
  await page.screenshot({path:testInfo.outputPath(`home-${width}.png`),fullPage:true});
  await page.getByRole("button",{name:/Modo rápido/}).click();
  await expect(page.getByRole("button",{name:/Próxima situação/})).toBeDisabled();
  await page.getByRole("radio").nth(2).check();
  await expect(page.getByRole("radio").nth(2)).toBeChecked();
  await expect(page.locator(".question-content")).toHaveCSS("animation-name","none");
  for(const button of await page.getByRole("button").all()){
   const box=await button.boundingBox();expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  await noOverflow(page);
  await page.screenshot({path:testInfo.outputPath(`quiz-${width}.png`),fullPage:true});
  const answers=answersForProfile(SYNTHETIC_SCENARIOS[0].profile,"quick");
  const result=assess(answers,"quick");
  const raw=encodeSession({phase:"result",mode:"quick",index:15,answers,history:[result]});
  await page.evaluate(({key,value})=>localStorage.setItem(key,value),{key:STORAGE_KEY,value:raw});
  await page.reload();await checkResult(page,result);
  await expect(page.locator(".category-card")).toHaveCount(3);
  await page.getByText("Comparação com o segundo colocado",{exact:true}).click();
  await expect(page.getByText(/A redução líquida no erro/)).toBeVisible();
  await noOverflow(page);
  await page.screenshot({path:testInfo.outputPath(`result-${width}.png`),fullPage:true});
  await page.getByRole("button",{name:/Continuar para 40/}).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow","16");
  await noOverflow(page);
 });
}
async function answerRange(page:Page,answers:Answers,from:number,to:number,mode:"quick"|"full") {
 const questions=questionsFor(mode);
 for(let i=from;i<to;i++){
  const q=questions[i];
  await expect(page.getByRole("heading",{level:1})).toHaveAttribute("data-question-id",q.id);
  await page.getByRole("radio").nth(answers[q.id]-1).check();
  await page.getByRole("button",{name:/Próxima situação|Ver resultado/}).click();
 }
}
async function checkResult(page:Page,expected:AssessmentResult) {
 await expect(page.getByRole("heading",{level:1})).toContainText(expected.matches[0].character.name);
 await expect(page.getByRole("meter")).toHaveCount(8 + 8*expected.matches.length);
 for(const axis of AXES){
  const row=page.getByTestId("axis-"+axis.id);
  await expect(row.getByRole("meter",{name:axis.label,exact:true})).toHaveAttribute("value",String(expected.profile[axis.id]));
  await expect(row.locator("strong")).toHaveText(expected.profile[axis.id].toFixed(1)+" / 100");
  for(const match of expected.matches){
   await expect(row.getByRole("meter",{name:axis.label+" / "+match.character.name,exact:true}))
    .toHaveAttribute("value",String(match.character.profile[axis.id]));
  }
 }
 for(const match of expected.matches){
  const winner=page.getByTestId("winner-"+match.character.id);
  await expect(winner.locator(".stat-value")).toHaveText(match.compatibility.toFixed(1)+"%");
  await expect(winner.locator(".badge")).toContainText(match.character.classification);
 }
 await expect(page.getByRole("region",{name:"Interpretação da compatibilidade"})).toBeVisible();
 const stored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),STORAGE_KEY);
 expect(stored.session.history.at(-1).profile).toEqual(expected.profile);
 expect(stored.session.history.at(-1).matches.map((m:{character:{id:string}})=>m.character.id))
  .toEqual(expected.matches.map(m=>m.character.id));
 await expect(page.getByText(/Batman|Mulher-Maravilha|Superman/)).toHaveCount(0);
 await noOverflow(page);
}
test("início, modos e dimensões do viewport",async({page},testInfo)=>{
 const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
 await ready(page);
 await expect(page.getByRole("button",{name:/Modo completo/})).toBeVisible();
 await expect(page.getByRole("region",{name:"Os oito eixos"})).toBeVisible();
 await noOverflow(page);
 await page.screenshot({path:testInfo.outputPath("inicio.png"),fullPage:true});
 expect(errors).toEqual([]);
});
test("navegação, seleção, teclado, foco e atualização preservam progresso",async({page})=>{
 await ready(page);await page.getByRole("button",{name:/Modo rápido/}).click();
 await expect(page.getByRole("button",{name:/Próxima situação/})).toBeDisabled();
 await page.getByRole("radio").first().focus();await page.keyboard.press("ArrowRight");
 await expect(page.getByRole("radio").nth(1)).toBeChecked();
 await page.getByRole("button",{name:/Próxima situação/}).click();
 await expect(page.getByRole("heading",{level:1})).toHaveAttribute("data-question-id","empathy-1");
 await expect(page.getByRole("heading",{level:1})).toBeFocused();
 await page.getByRole("radio").nth(3).check();
 await page.getByRole("button",{name:/Voltar/}).click();
 await expect(page.getByRole("radio").nth(1)).toBeChecked();
 await page.getByRole("radio").first().check();
 await page.getByRole("button",{name:/Próxima situação/}).click();
 await page.reload();
 await expect(page.getByRole("heading",{level:1})).toHaveAttribute("data-question-id","empathy-1");
 await expect(page.getByRole("radio").nth(3)).toBeChecked();
 await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow","1");
 await noOverflow(page);
});
test("rápido até completo, snapshots, gráficos e resultados após reload",async({page},testInfo)=>{
 const scenario=SYNTHETIC_SCENARIOS.find(s=>s.id==="compassionate")!;
 const all=answersForProfile(scenario.profile,"full");
 // The quick prefix is identical to the full-mode answers, not independently synthesized.
 const quick=Object.fromEntries(questionsFor("quick").map(q=>[q.id,all[q.id]])) as Answers;
 await ready(page);await page.getByRole("button",{name:/Modo rápido/}).click();
 await answerRange(page,quick,0,16,"quick");
 const quickResult=assess(quick,"quick");await checkResult(page,quickResult);
 await page.reload();await checkResult(page,quickResult);
 await page.getByRole("button",{name:/Continuar para 40/}).click();
 await expect(page.getByRole("heading",{level:1})).toHaveAttribute("data-question-id","strategy-3");
 await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow","16");
 await expect(page.getByRole("radio",{checked:true})).toHaveCount(0);
 await page.reload();
 await expect(page.getByRole("heading",{level:1})).toHaveAttribute("data-question-id","strategy-3");
 const prefix=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).session.answers,STORAGE_KEY);
 expect(prefix).toEqual(quick);
 await answerRange(page,all,16,40,"full");
 const fullResult=assess(all,"full");await checkResult(page,fullResult);
 await page.reload();await checkResult(page,fullResult);
 const history=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).session.history,STORAGE_KEY);
 expect(history).toHaveLength(2);expect(history[0]).toEqual(JSON.parse(JSON.stringify(quickResult)));
 await page.screenshot({path:testInfo.outputPath("resultado-completo.png"),fullPage:true});
});
test("modo completo direto e reinício removem só o progresso do HeroAxes atual",async({page})=>{
 await ready(page);
 await page.evaluate(()=>localStorage.setItem("unrelated","keep"));
 await page.getByRole("button",{name:/Modo completo/}).click();
 await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax","40");
 await page.getByRole("radio").last().check();
 await page.reload();await expect(page.getByRole("radio").last()).toBeChecked();
 await page.getByRole("button",{name:/Reiniciar e apagar progresso/}).click();
 await expect(page.getByRole("button",{name:/Modo rápido/})).toBeEnabled();
 expect(await page.evaluate(key=>localStorage.getItem(key),STORAGE_KEY)).toBeNull();
 expect(await page.evaluate(()=>localStorage.getItem("unrelated"))).toBe("keep");
 await page.reload();
 await expect(page.getByRole("button",{name:/Modo rápido/})).toBeEnabled();
 await page.getByRole("button",{name:/Modo rápido/}).click();
 await expect(page.getByRole("radio",{checked:true})).toHaveCount(0);
});
test("JSON corrompido é rejeitado, sem recuperar seleção indevida",async({page})=>{
 await ready(page);
 await page.evaluate(key=>localStorage.setItem(key,"{broken"),STORAGE_KEY);
 await page.reload();
 await expect(page.getByRole("status")).toContainText("inválido ou incompatível");
 await page.getByRole("button",{name:/Modo rápido/}).click();
 await expect(page.getByRole("radio",{checked:true})).toHaveCount(0);
 await page.getByRole("radio").nth(2).check();
 await page.reload();await expect(page.getByRole("radio").nth(2)).toBeChecked();
});
test("versão inválida não é aplicada e não derruba a interface",async({page})=>{
 await ready(page);await page.getByRole("button",{name:/Modo rápido/}).click();
 await page.getByRole("radio").last().check();
 await page.evaluate(key=>{
  const envelope=JSON.parse(localStorage.getItem(key)!);envelope.schemaVersion=999;
  localStorage.setItem(key,JSON.stringify(envelope));
 },STORAGE_KEY);
 await page.reload();
 await expect(page.getByRole("status")).toContainText("inválido ou incompatível");
 await expect(page.getByRole("button",{name:/Modo rápido/})).toBeEnabled();
});
test("storage bloqueado permite continuar em memória com aviso",async({page})=>{
 await page.addInitScript(()=>{
  Object.defineProperty(window,"localStorage",{get(){throw new DOMException("blocked","SecurityError");}});
 });
 await ready(page);await expect(page.getByRole("status")).toContainText("indisponível");
 await page.getByRole("button",{name:/Modo rápido/}).click();
 await page.getByRole("radio").first().check();
 await page.getByRole("button",{name:/Próxima situação/}).click();
 await expect(page.getByRole("heading",{level:1})).toHaveAttribute("data-question-id","empathy-1");
 await expect(page.getByRole("status")).toContainText("Não foi possível salvar");
});
