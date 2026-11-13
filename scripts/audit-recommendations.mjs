import {readFile,writeFile} from "node:fs/promises";
import {RECOMMENDATION_CATALOG as catalog} from "../src/data/recommendation-catalog.ts";
import {CATALOG} from "../src/domain/catalog.ts";
import {assess} from "../src/domain/assessment.ts";
import {answersForProfile} from "../src/domain/synthetic.ts";
import {recommend} from "../src/core/recommendations.ts";
const confirmed=catalog.works.filter(w=>w.review==="source-verified");
const coverage=CATALOG.map(c=>{
 const evidence=catalog.evidence.filter(e=>e.characterId===c.id && e.review==="source-verified");
 const works=confirmed.filter(w=>evidence.some(e=>e.workId===w.id));
 const result=assess(answersForProfile(c.profile,"full"),"full");
 return {id:c.id,name:c.name,works:works.map(w=>w.id),withSpoilers:recommend(result,c.id,catalog,{includeSpoilers:true}),withoutSpoilers:recommend(result,c.id,catalog)};
});
const report={catalogVersion:catalog.version,engineVersion:coverage[0].withSpoilers.engineVersion,counts:{works:catalog.works.length,confirmed:confirmed.length,evidence:catalog.evidence.length,sources:catalog.sources.length,characters:coverage.filter(c=>c.works.length).length,pending:catalog.pending.length},coverage:coverage.map(c=>({id:c.id,works:c.works,withoutSpoilers:c.withoutSpoilers.slots.map(s=>({slot:s.kind,work:s.recommendation?.work.id??null})),withSpoilers:c.withSpoilers.slots.map(s=>({slot:s.kind,work:s.recommendation?.work.id??null}))}))};
let md="# Catálogo de recomendações — Sprint 4C\n\n";
md+="Curadoria "+catalog.version+". Conferência de fontes em 2026-11-13; não equivale a leitura integral ou revisão editorial independente. Fontes indexadas são identificadas no código; várias páginas Marvel retornam 403 na abertura direta. Interpretações são do HeroAxes, não das fontes.\n\n";
md+="## Relações confirmadas por personagem\n\nObra confirmada não garante recomendação: é preciso proximidade no mesmo polo, evidência aprovada e permissão para spoilers. Coleções sobrepostas não contam como duas histórias distintas.\n\n|Personagem|Obras com evidência revisada|\n|---|---|\n";
for(const c of coverage)md+=`|${c.name}|${c.works.map(id=>confirmed.find(w=>w.id===id).title).join("; ")}|\n`;
md+="\n## Obras confirmadas e referências\n\n|ID / obra|Tipo / continuidade|Ano do material original|Recorte|Fontes verificadas|\n|---|---|---|---|---|\n";
for(const w of confirmed)md+=`|${w.id} / ${w.title}|${w.type} / ${w.continuity}|${w.year}|${w.reference}|${w.sources.map(id=>{const s=catalog.sources.find(s=>s.id===id);return `[${s.publisher}: ${s.title}](${s.url})`;}).join("; ")}|\n`;
md+="\n## Pendentes de curadoria ou excluídas\n\n|Personagem|Mídia / candidata|Motivo|\n|---|---|---|\n";
for(const p of catalog.pending)md+=`|${CATALOG.find(c=>c.id===p.characterId).name}|${p.media}${p.candidateTitle ? " / "+p.candidateTitle : ""}|${p.reason}|\n`;
md+="\nNão se completam vagas com aparições ou obras sem evidência. Fontes secundárias (Guardian Devil, registro GCD de Mysterio e recap de WandaVision) têm menor peso. O registro Iron Man Annual #5 foi excluído como evidência de agência de Erik; seu ano/participação não bastam.\n";
const outputs={"RECOMMENDATIONS_CATALOG.md":md,"RECOMMENDATIONS_AUDIT.json":JSON.stringify(report,null,2)+"\n"};
for(const [name,content]of Object.entries(outputs)){
 const path=new URL("../docs/"+name,import.meta.url);
 if(process.argv.includes("--check")){if(await readFile(path,"utf8")!==content)throw Error(name+" desatualizado");}
 else await writeFile(path,content);
}
console.log(JSON.stringify(report.counts));
