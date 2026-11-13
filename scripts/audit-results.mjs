import { mkdir,writeFile,readFile } from "node:fs/promises";
import { AXES } from "../src/domain/axes.ts";
import { CATALOG,CATALOG_VERSION } from "../src/domain/catalog.ts";
import { ALGORITHM_VERSION,calculateAxes,rankCharacters } from "../src/domain/assessment.ts";
import { QUESTIONNAIRE_VERSION } from "../src/domain/questions.ts";
import { catalogReachability,distributionAudit,answersForProfile,SYNTHETIC_SCENARIOS } from "../src/domain/synthetic.ts";
const report={
 versions:{algorithm:ALGORITHM_VERSION,questionnaire:QUESTIONNAIRE_VERSION,catalog:CATALOG_VERSION},
 methodology:"Diagnóstico determinístico, não estimativa de prevalência humana. Halton: alternativas 1–5 independentes por item, 4096 casos por modo. Grade: 3^8 perfis {0,50,100}, 6561 por modo. Empates dividem a contagem. Testemunhas de alcance arredondam cada eixo ao valor alcançável mais próximo.",
 ranges:AXES.map(a=>({axis:a.id,min:Math.min(...CATALOG.map(c=>c.profile[a.id])),max:Math.max(...CATALOG.map(c=>c.profile[a.id]))})),
 reachability:["quick","full"].map(mode=>({mode,characters:catalogReachability(mode)})),
 distributions:["raw-halton","profile-grid"].flatMap(suite=>["quick","full"].map(mode=>distributionAudit(mode,suite))),
 scenarios:["quick","full"].flatMap(mode=>SYNTHETIC_SCENARIOS.map(s=>{
  const answers=answersForProfile(s.profile,mode),profile=calculateAxes(answers,mode);
  return {id:s.id,mode,profile,top3:rankCharacters(profile).slice(0,3).map(r=>({id:r.character.id,compatibility:r.compatibility}))};
 })),
};
let markdown="# Auditoria de distribuição e alcance\n\n"+report.methodology+"\n\n";
markdown+="Versões: "+Object.values(report.versions).join(" / ")+"\n\n";
markdown+="## Alcance\n\n";
for(const suite of report.reachability)markdown+=suite.mode+": "+suite.characters.filter(c=>c.reachable).length+"/24 personagens com uma testemunha realizável pelo questionário.\n\n";
markdown+="Uma testemunha prova possibilidade, não frequência provável nem robustez a mudanças nas respostas.\n\n";
markdown+="## Faixas do catálogo\n\n|Eixo|Mínimo|Máximo|\n|---|---|---|\n";
for(const r of report.ranges)markdown+="|"+[r.axis,r.min,r.max].join("|")+"|\n";
markdown+="\n## Frequência sintética\n\nNão se busca distribuição uniforme. Respostas independentes tendem ao centro conforme aumenta o número de itens; a grade explora extremos sem representar usuários reais.\n\n";
markdown+="|Personagem|Halton rápido (4096)|Halton completo (4096)|Grade rápido (6561)|Grade completo (6561)|\n|---|---|---|---|---|\n";
for(const c of CATALOG)markdown+="|"+[c.name,...report.distributions.map(d=>(100*d.shares[c.id]/d.samples).toFixed(2)+"%")].join("|")+"|\n";
markdown+="\n## Cenários comportamentais\n\n|Cenário|Modo|Primeiro|Compatibilidade|Segundo|\n|---|---|---|---|---|\n";
for(const s of report.scenarios)markdown+="|"+[s.id,s.mode,s.top3[0].id,s.top3[0].compatibility.toFixed(2)+"%",s.top3[1].id].join("|")+"|\n";
markdown+="\n## Interpretação\n\nO catálogo se concentra em autonomia elevada (75–98) e risco elevado (45–95). Perfis dependentes de orientação ou avessos a risco ficam fora dessas faixas. O mais próximo entre 24 pode ainda ser distante em eixos relevantes. Autonomia não é domínio sobre outras pessoas; empatia não é cooperação. Não houve ajuste de pesos ou valores para mudar a frequência de personagens.\n\n";
markdown+="Respostas neutras podem produzir concordância interna de 100% por construção. Isso não significa certeza ou validade. O modo completo pode alterar o resultado por coletar respostas novas; aumentar itens não garante estabilidade para respostas contraditórias ou independentes.\n";
const outputs={"RESULTS_AUDIT.json":JSON.stringify(report,null,2)+"\n","RESULTS_AUDIT.md":markdown};
const directory=new URL("../docs/",import.meta.url);
if(!process.argv.includes("--check"))await mkdir(directory,{recursive:true});
for(const [name,content]of Object.entries(outputs)){
 const target=new URL(name,directory);
 if(process.argv.includes("--check")){if(await readFile(target,"utf8")!==content)throw new Error(name+" desatualizado");}
 else await writeFile(target,content,"utf8");
}
console.log(process.argv.includes("--check")?"Auditoria de resultados consistente.":"Auditoria de resultados gerada.");
for(const d of report.distributions){
 const sorted=Object.entries(d.shares).sort((a,b)=>b[1]-a[1]);
 console.log(JSON.stringify({mode:d.mode,suite:d.suite,samples:d.samples,top:sorted.slice(0,3),zero:sorted.filter(x=>x[1]===0).map(x=>x[0])}));
}
